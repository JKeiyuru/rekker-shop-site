// server/routes/shop/mpesa-routes.js
// Rekker M-Pesa routes — handles the Safaricom STK push callback only.
// The STK push initiation is handled in order-routes.js at POST /api/shop/order/mpesa/initiate.
// NOTE: This file is fully self-contained — it does NOT import from mpesaController.js.

const express = require("express");
const router  = express.Router();
const Order   = require("../../models/Order");
const User    = require("../../models/User");

let sendOrderConfirmationEmail;
try {
  ({ sendOrderConfirmationEmail } = require("../../helpers/email"));
} catch (e) {
  sendOrderConfirmationEmail = null;
}

/**
 * POST /api/shop/mpesa/callback
 * Called by Safaricom when the user completes or cancels the M-Pesa STK prompt.
 * Must always return HTTP 200 — Safaricom retries on non-200 responses.
 */
router.post("/mpesa/callback", async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) {
      console.error("M-Pesa callback: malformed payload", JSON.stringify(req.body));
      return res.status(200).json({ success: false, message: "Malformed callback" });
    }

    const checkoutId = callbackData.CheckoutRequestID;
    const resultCode  = callbackData.ResultCode; // 0 = success

    console.log(`M-Pesa callback — ID: ${checkoutId}, ResultCode: ${resultCode}`);

    const order = await Order.findOne({ mpesaCheckoutId: checkoutId });

    if (!order) {
      console.error(`M-Pesa callback: no order for CheckoutRequestID ${checkoutId}`);
      return res.status(200).json({ success: false, message: "Order not found" });
    }

    order.mpesaCallbackData = callbackData;

    if (resultCode === 0) {
      order.paymentStatus = "paid";
      order.orderStatus   = "confirmed";

      const items   = callbackData.CallbackMetadata?.Item || [];
      const receipt = items.find((i) => i.Name === "MpesaReceiptNumber");
      if (receipt?.Value) order.paymentId = receipt.Value;

      await order.save();
      console.log(`M-Pesa confirmed for order ${order._id}`);

      if (sendOrderConfirmationEmail) {
        try {
          const user = await User.findById(order.userId).select("email userName");
          if (user) {
            sendOrderConfirmationEmail(user, order).catch((e) =>
              console.error("Confirmation email error:", e)
            );
          }
        } catch (emailErr) {
          console.error("User lookup for email failed:", emailErr);
        }
      }
    } else {
      order.paymentStatus = "failed";
      await order.save();
      console.log(`M-Pesa failed/cancelled for order ${order._id}`);
    }

    return res.status(200).json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return res.status(200).json({ success: false, message: "Internal error" });
  }
});

module.exports = router;