// server/controllers/shop/order-controller.js
// Rekker shop order controller — COD and (legacy) direct M-Pesa STK push.
// Online card / M-Pesa / Airtel Money payments now go through Paystack —
// see controllers/shop/paystackController.js. PayPal support has been
// removed entirely.

const Order   = require("../../models/Order");
const Cart    = require("../../models/Cart");
const User    = require("../../models/User");
const { priceOrderLines, resolveDeliveryFee, deductStockForOrder } = require("../../helpers/order-pricing");
const { notifyNewOrder, notifyLowStock } = require("../../helpers/notifications");
const { evaluateCode, redeemForOrder } = require("../../helpers/discounts");

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

// ─── CREATE ORDER (COD only — Paystack has its own initialize endpoint) ──────
// The browser only tells us WHICH items and HOW MANY. Prices, bundle
// contents, stock and the delivery fee are all worked out here.
const createOrder = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, paymentMethod, deliveryFee, orderDate, cartId, discountCode } = req.body;

    console.log(`📦 createOrder — method: ${paymentMethod}, user: ${userId}`);

    if (!userId || !cartItems?.length || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, cartItems, paymentMethod",
      });
    }

    if (paymentMethod !== "cod") {
      return res.status(400).json({
        success: false,
        message: paymentMethod === "paystack"
          ? "Use POST /api/shop/paystack/initialize for online payments."
          : `Unsupported payment method: ${paymentMethod}. Use "cod" or "paystack".`,
      });
    }

    const priced = await priceOrderLines(cartItems);
    if (priced.errors.length || !priced.lines.length) {
      return res.status(409).json({
        success: false,
        message: priced.errors[0] || "Your cart is empty.",
        errors: priced.errors,
      });
    }

    const finalDeliveryFee = await resolveDeliveryFee(addressInfo, deliveryFee);

    // Optional discount / influencer code — re-checked here, never trusted from the browser
    let discountAmount = 0;
    let appliedCode = null;
    if (discountCode) {
      const ev = await evaluateCode({ code: discountCode, userId, lines: priced.lines, subtotal: priced.subtotal });
      if (!ev.ok) return res.status(409).json({ success: false, message: ev.error });
      discountAmount = ev.discountAmount;
      appliedCode = ev.code.code;
    }

    const order = new Order({
      userId,
      cartId:         cartId || null,
      cartItems:      priced.lines,
      addressInfo,
      discountCode:   appliedCode,
      discountAmount,
      paymentMethod:  "cod",
      paymentStatus:  "pending",
      orderStatus:    "pending",
      subtotalAmount: priced.subtotal,
      deliveryFee:    finalDeliveryFee,
      totalAmount:    priced.subtotal - discountAmount + finalDeliveryFee,
      orderDate:      orderDate ? new Date(orderDate) : new Date(),
    });

    // Reserve the stock now — a COD order is a real order from this moment.
    const touched = await deductStockForOrder(order);
    order.adminNotifiedAt = new Date();
    await order.save();
    console.log("✅ COD order saved:", order._id);
    if (appliedCode) { await redeemForOrder(order); await order.save(); }

    clearUserCart(userId, cartId);
    fireConfirmationEmail(userId, order);

    // Tell the team (dashboard bell + email + optional SMS) — never blocks the customer
    User.findById(userId).select("userName").lean()
      .then((u) => notifyNewOrder(order, u?.userName))
      .catch(() => notifyNewOrder(order));
    notifyLowStock(touched);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        subtotalAmount: order.subtotalAmount,
        deliveryFee: order.deliveryFee,
        discountCode: order.discountCode,
        discountAmount: order.discountAmount,
        cartItems: order.cartItems,
      },
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

// ─── M-PESA STK PUSH (legacy direct Daraja integration) ──────────────────────
// Kept for reference / fallback. The checkout UI now routes online payments
// through Paystack instead, but this endpoint still works if ever needed.
const initiateMpesaPayment = async (req, res) => {
  try {
    const { phone, amount, orderData } = req.body;

    if (!phone || !amount || !orderData) {
      return res.status(400).json({
        success: false,
        message: "phone, amount, and orderData are required",
      });
    }

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
    if (req.user?.role !== "admin" && String(order.userId) !== String(req.user?.id)) {
      return res.status(403).json({ success: false, message: "You can only view your own orders." });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.error("getOrderDetails error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createOrder,
  initiateMpesaPayment,
  getAllOrdersByUser,
  getOrderDetails,
};
