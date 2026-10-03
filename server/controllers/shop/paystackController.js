// server/controllers/shop/paystackController.js
// Handles: creating the pending order + Paystack checkout link, confirming
// payment on redirect-back, and processing Paystack's webhook (the
// authoritative source of truth — the redirect can be closed/lost by the
// customer, the webhook can't).

const crypto = require("crypto");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const { initializeTransaction, verifyTransaction, verifyWebhookSignature } = require("../../helpers/paystack");
const { priceOrderLines, resolveDeliveryFee, deductStockForOrder } = require("../../helpers/order-pricing");
const { notifyNewOrder, notifyLowStock } = require("../../helpers/notifications");
const { evaluateCode, redeemForOrder } = require("../../helpers/discounts");

let sendOrderConfirmationEmail = () => Promise.resolve();
try {
  ({ sendOrderConfirmationEmail } = require("../../helpers/email"));
} catch (e) {
  console.warn("Email helper not loaded:", e.message);
}

const clearUserCart = async (userId, cartId) => {
  try {
    if (cartId) await Cart.findByIdAndDelete(cartId);
    else await Cart.findOneAndDelete({ userId });
  } catch (e) {
    console.error("Cart clear error (non-fatal):", e.message);
  }
};

// Shared "payment just succeeded" finalizer — called from both the
// redirect-verify endpoint and the webhook, guarded so it only runs once.
const finalizeSuccessfulPayment = async (order, { channel } = {}) => {
  if (order.paymentStatus === "paid") return order; // already finalized, avoid double stock decrement / double email

  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paymentConfirmedAt = new Date();
  if (channel) order.paystackChannel = channel;

  // Deduct stock exactly once (bundles deduct each component product)
  const touched = await deductStockForOrder(order);

  await redeemForOrder(order); // counts the code only once the money is in
  const shouldAlertAdmins = !order.adminNotifiedAt;
  if (shouldAlertAdmins) order.adminNotifiedAt = new Date();
  await order.save();
  clearUserCart(order.userId, order.cartId);

  let customerName;
  try {
    const user = await User.findById(order.userId).select("email userName");
    customerName = user?.userName;
    if (user) sendOrderConfirmationEmail(user, order).catch((e) => console.error("Confirmation email failed:", e));
  } catch (e) {
    console.error("User lookup for confirmation email failed:", e.message);
  }

  // Alert the team only now that the money is in — unpaid/abandoned checkouts are not orders
  if (shouldAlertAdmins) notifyNewOrder(order, customerName);
  notifyLowStock(touched);

  return order;
};

// ─── INITIALIZE ───────────────────────────────────────────────────────────────
// POST /api/shop/paystack/initialize
const initializePaystackPayment = async (req, res) => {
  try {
    const { userId, cartItems, addressInfo, deliveryFee, cartId, email, discountCode } = req.body;

    if (!userId || !cartItems?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, cartItems",
      });
    }

    const user = await User.findById(userId).select("email userName");
    const customerEmail = email || user?.email;
    if (!customerEmail) {
      return res.status(400).json({ success: false, message: "No email on file for this account — please add one before paying online." });
    }

    // Prices, bundles, stock and delivery fee are decided here, never by the browser
    const priced = await priceOrderLines(cartItems);
    if (priced.errors.length || !priced.lines.length) {
      return res.status(409).json({
        success: false,
        message: priced.errors[0] || "Your cart is empty.",
        errors: priced.errors,
      });
    }
    const finalDeliveryFee = await resolveDeliveryFee(addressInfo, deliveryFee);
    let discountAmount = 0;
    let appliedCode = null;
    if (discountCode) {
      const ev = await evaluateCode({ code: discountCode, userId, lines: priced.lines, subtotal: priced.subtotal });
      if (!ev.ok) return res.status(409).json({ success: false, message: ev.error });
      discountAmount = ev.discountAmount;
      appliedCode = ev.code.code;
    }
    const totalAmount = priced.subtotal - discountAmount + finalDeliveryFee;

    const order = new Order({
      userId,
      cartId: cartId || null,
      cartItems: priced.lines,
      addressInfo,
      paymentMethod: "paystack",
      paymentStatus: "pending",
      orderStatus: "pending",
      discountCode: appliedCode,
      discountAmount,
      totalAmount,
      subtotalAmount: priced.subtotal,
      deliveryFee: finalDeliveryFee,
      orderDate: new Date(),
    });
    await order.save();

    const reference = `RK-${order._id}-${Date.now()}`;
    order.paystackReference = reference;
    await order.save();

    const baseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || "https://shop.rekker.co.ke";
    const callbackUrl = `${baseUrl}/payment-success`;

    let init;
    try {
      init = await initializeTransaction({
        email: customerEmail,
        amountKES: totalAmount,
        reference,
        callbackUrl,
        metadata: { orderId: order._id.toString(), userId },
      });
    } catch (paystackError) {
      console.error("Paystack initialize error:", paystackError?.response?.data || paystackError.message);
      order.paymentStatus = "failed";
      await order.save();
      return res.status(500).json({
        success: false,
        message: "Could not start the online payment. Check PAYSTACK_SECRET_KEY on the server, or try Cash on Delivery.",
      });
    }

    return res.status(201).json({
      success: true,
      orderId: order._id,
      authorizationUrl: init.data.authorization_url,
      reference,
    });
  } catch (e) {
    console.error("initializePaystackPayment error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── VERIFY (called from the payment-success redirect page) ──────────────────
// GET /api/shop/paystack/verify/:reference
const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const order = await Order.findOne({ paystackReference: reference });
    if (!order) return res.status(404).json({ success: false, message: "Order not found for this payment reference" });

    if (order.paymentStatus === "paid") {
      return res.status(200).json({ success: true, message: "Payment already confirmed", data: order });
    }

    let verification;
    try {
      verification = await verifyTransaction(reference);
    } catch (e) {
      console.error("Paystack verify error:", e?.response?.data || e.message);
      return res.status(502).json({ success: false, message: "Could not reach Paystack to verify payment. It may still be processing." });
    }

    const txStatus = verification?.data?.status;
    if (txStatus === "success") {
      const finalized = await finalizeSuccessfulPayment(order, { channel: verification.data.channel });
      return res.status(200).json({ success: true, message: "Payment confirmed", data: finalized });
    }

    if (txStatus === "abandoned" || txStatus === "failed") {
      order.paymentStatus = "failed";
      await order.save();
    }

    return res.status(200).json({ success: false, message: `Payment ${txStatus || "not completed"}`, data: order });
  } catch (e) {
    console.error("verifyPaystackPayment error:", e);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── WEBHOOK (authoritative — Paystack calls this server-to-server) ──────────
// POST /api/shop/paystack/webhook
const handlePaystackWebhook = async (req, res) => {
  // Always ack quickly so Paystack doesn't retry-storm us; do real work after.
  try {
    const signature = req.headers["x-paystack-signature"];
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn("Paystack webhook: invalid signature — ignoring");
      return res.status(200).json({ received: true });
    }

    const event = req.body;
    if (event?.event === "charge.success") {
      const reference = event.data?.reference;
      const order = await Order.findOne({ paystackReference: reference });
      if (order) {
        await finalizeSuccessfulPayment(order, { channel: event.data?.channel });
        console.log(`✅ Paystack webhook confirmed order ${order._id}`);
      } else {
        console.warn(`Paystack webhook: no order found for reference ${reference}`);
      }
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("Paystack webhook processing error:", e);
    // Still 200 — we don't want Paystack hammering retries over our own bug;
    // it's logged above for follow-up instead.
    return res.status(200).json({ received: true });
  }
};

module.exports = { initializePaystackPayment, verifyPaystackPayment, handlePaystackWebhook };
