// server/controllers/shop/order-controller.js
// Rekker shop order controller — COD, M-Pesa, and PayPal.
// KEY FIX: PayPal SDK is loaded lazily inside createPaypalPayment() only.
//   Previously, requiring paypal-rest-sdk at the top of the file caused it to
//   call paypal.configure() immediately. If PAYPAL_MODE / PAYPAL_CLIENT_ID /
//   PAYPAL_CLIENT_SECRET are not set (or wrong), the SDK throws at module-load
//   time, which crashes the ENTIRE controller — making COD and M-Pesa return
//   500 too. Lazy-loading isolates the failure to PayPal requests only.

const Order   = require("../../models/Order");
const Cart    = require("../../models/Cart");
const Product = require("../../models/Product");
const User    = require("../../models/User");

let sendOrderConfirmationEmail = () => Promise.resolve();
try {
  ({ sendOrderConfirmationEmail } = require("../../helpers/email"));
} catch (e) {
  console.warn("Email helper not loaded:", e.message);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fireConfirmationEmail = async (userId, order) => {
  try {
    const user = await User.findById(userId).select("email userName");
    if (user) sendOrderConfirmationEmail(user, order).catch(console.error);
  } catch (e) {
    console.error("Confirmation email error:", e.message);
  }
};

const clearUserCart = async (userId, cartId) => {
  try {
    if (cartId) {
      await Cart.findByIdAndDelete(cartId);
    } else {
      await Cart.findOneAndDelete({ userId });
    }
    console.log("🛒 Cart cleared for user", userId);
  } catch (e) {
    console.error("Cart clear error (non-fatal):", e.message);
  }
};

const normalisePhone = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0"))   return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
};

// Wrap the callback-based PayPal SDK in a Promise.
// PayPal is required HERE (lazily) so a bad config can't crash the module.
const createPaypalPayment = (paymentJson) => {
  let paypal;
  try {
    paypal = require("../../helpers/paypal");
  } catch (e) {
    return Promise.reject(new Error("PayPal SDK failed to load: " + e.message));
  }
  return new Promise((resolve, reject) => {
    paypal.payment.create(paymentJson, (error, paymentInfo) => {
      if (error) reject(error);
      else resolve(paymentInfo);
    });
  });
};

// ─── CREATE ORDER ─────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      subtotalAmount,
      deliveryFee,
      orderDate,
      cartId,
    } = req.body;

    console.log(`📦 createOrder — method: ${paymentMethod}, user: ${userId}, total: ${totalAmount}`);

    if (!userId || !cartItems?.length || !paymentMethod || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, cartItems, paymentMethod, totalAmount",
      });
    }

    // ── COD ──────────────────────────────────────────────────────────────────
    if (paymentMethod === "cod") {
      const order = new Order({
        userId,
        cartId:         cartId || null,
        cartItems,
        addressInfo,
        paymentMethod:  "cod",
        paymentStatus:  "pending",
        orderStatus:    "pending",
        totalAmount:    Number(totalAmount),
        subtotalAmount: Number(subtotalAmount) || 0,
        deliveryFee:    Number(deliveryFee)    || 0,
        orderDate:      orderDate ? new Date(orderDate) : new Date(),
      });

      await order.save();
      console.log("✅ COD order saved:", order._id);

      clearUserCart(userId, cartId);
      fireConfirmationEmail(userId, order);

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        orderId: order._id,
      });
    }

    // ── PAYPAL ────────────────────────────────────────────────────────────────
    if (paymentMethod === "paypal") {
      const baseUrl =
        process.env.CLIENT_BASE_URL ||
        process.env.FRONTEND_URL    ||
        "https://rekker.co.ke";

      const paymentJson = {
  intent: "sale",
  payer:  { payment_method: "paypal" },
  redirect_urls: {
    return_url: `${baseUrl}/shop/paypal-return`,
    cancel_url: `${baseUrl}/shop/paypal-cancel`,
  },
  transactions: [
    {
      amount: {
        currency: "USD",
        total:    Number(totalAmount).toFixed(2),
      },
      description: "Rekker order payment",
    },
  ],
};
        

      let paymentInfo;
      try {
        paymentInfo = await createPaypalPayment(paymentJson);
      } catch (paypalError) {
        console.error("PayPal error:", paypalError?.response || paypalError?.message);
        return res.status(500).json({
          success: false,
          message: "PayPal payment creation failed. Check PAYPAL_MODE, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET in your server environment.",
        });
      }

      const order = new Order({
        userId,
        cartId:         cartId || null,
        cartItems,
        addressInfo,
        paymentMethod:  "paypal",
        paymentStatus:  "pending",
        orderStatus:    "pending",
        totalAmount:    Number(totalAmount),
        subtotalAmount: Number(subtotalAmount) || 0,
        deliveryFee:    Number(deliveryFee)    || 0,
        orderDate:      orderDate ? new Date(orderDate) : new Date(),
      });

      await order.save();
      console.log("✅ PayPal order saved:", order._id);

      const approvalURL = paymentInfo.links?.find((l) => l.rel === "approval_url")?.href;
      if (!approvalURL) {
        return res.status(500).json({
          success: false,
          message: "PayPal did not return an approval URL.",
        });
      }

      return res.status(201).json({ success: true, approvalURL, orderId: order._id });
    }

    return res.status(400).json({
      success: false,
      message: `Unknown payment method: ${paymentMethod}`,
    });

  } catch (e) {
    console.error("createOrder unhandled error:", e);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      detail:  process.env.NODE_ENV !== "production" ? e.message : undefined,
    });
  }
};

// ─── CAPTURE PAYPAL PAYMENT ───────────────────────────────────────────────────
const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.orderStatus   = "confirmed";
    order.paymentId     = paymentId;
    order.payerId       = payerId;

    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalStock = Math.max(0, product.totalStock - item.quantity);
        await product.save();
      }
    }

    clearUserCart(order.userId, order.cartId);
    await order.save();
    fireConfirmationEmail(order.userId, order);

    return res.status(200).json({ success: true, message: "Payment captured", data: order });
  } catch (e) {
    console.error("capturePayment error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── M-PESA STK PUSH ─────────────────────────────────────────────────────────
const initiateMpesaPayment = async (req, res) => {
  try {
    const { phone, amount, orderData } = req.body;

    if (!phone || !amount || !orderData) {
      return res.status(400).json({
        success: false,
        message: "phone, amount, and orderData are required",
      });
    }

    // Load M-Pesa helper lazily for the same isolation reason as PayPal
    let createToken, stkPush;
    try {
      ({ createToken, stkPush } = require("../../helpers/mpesa"));
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "M-Pesa helper failed to load: " + e.message,
      });
    }

    const normPhone = normalisePhone(String(phone));
    console.log(`📱 M-Pesa STK → ${normPhone}, KES ${amount}`);

    const order = new Order({
      userId:         orderData.userId,
      cartId:         orderData.cartId   || null,
      cartItems:      orderData.cartItems,
      addressInfo:    orderData.addressInfo,
      paymentMethod:  "mpesa",
      paymentStatus:  "pending",
      orderStatus:    "pending",
      totalAmount:    Number(amount),
      subtotalAmount: Number(orderData.subtotalAmount) || 0,
      deliveryFee:    Number(orderData.deliveryFee)    || 0,
      orderDate:      new Date(),
    });

    await order.save();
    console.log("✅ M-Pesa order saved:", order._id);

    const callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      `${process.env.API_BASE_URL || "https://api.rekker.co.ke"}/api/shop/mpesa/callback`;

    try {
      const token       = await createToken();
      const stkResponse = await stkPush(token, normPhone, Math.ceil(Number(amount)), callbackUrl);

      if (stkResponse.CheckoutRequestID) {
        order.mpesaCheckoutId = stkResponse.CheckoutRequestID;
        await order.save();
      }

      clearUserCart(orderData.userId, orderData.cartId);

      return res.status(200).json({
        success:           true,
        message:           "STK push sent — enter your M-Pesa PIN",
        orderId:           order._id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
      });
    } catch (mpesaErr) {
      const errData = mpesaErr?.response?.data;
      console.error("STK push failed:", errData || mpesaErr.message);

      order.paymentStatus = "failed";
      await order.save();

      return res.status(500).json({
        success: false,
        message: errData?.errorMessage || "M-Pesa STK push failed. Try again or use a different payment method.",
        orderId: order._id,
      });
    }
  } catch (e) {
    console.error("initiateMpesaPayment error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── USER ORDER QUERIES ───────────────────────────────────────────────────────
const getAllOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ orderDate: -1 });
    if (!orders.length) return res.status(404).json({ success: false, message: "No orders found" });
    return res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.error("getAllOrdersByUser error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    return res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error("getOrderDetails error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  initiateMpesaPayment,
  getAllOrdersByUser,
  getOrderDetails,
};