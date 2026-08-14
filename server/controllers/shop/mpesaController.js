// server/controllers/shop/mpesaController.js
// Rekker M-Pesa controller — handles STK push callbacks from Safaricom.
// This file is only responsible for processing Safaricom callbacks.
// The STK push initiation is handled in order-controller.js → initiateMpesaPayment.

const Order = require("../../models/Order");
const User  = require("../../models/User");
const { sendOrderConfirmationEmail } = require("../../helpers/email");

/**
 * POST /api/shop/mpesa/callback
 * Called by Safaricom when the user completes or cancels the M-Pesa prompt.
 */
const handleMpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;

    if (!callbackData) {
      console.error("M-Pesa callback: malformed payload", req.body);
      return res.status(400).json({ success: false, message: "Malformed callback payload" });
    }

    const checkoutId = callbackData.CheckoutRequestID;
    const resultCode  = callbackData.ResultCode; // 0 = success

    console.log(`M-Pesa callback — CheckoutRequestID: ${checkoutId}, ResultCode: ${resultCode}`);

    const order = await Order.findOne({ mpesaCheckoutId: checkoutId });

    if (!order) {
      console.error(`M-Pesa callback: no order found for CheckoutRequestID ${checkoutId}`);
      // Safaricom expects a 200 response regardless
      return res.status(200).json({ success: false, message: "Order not found" });
    }

    order.mpesaCallbackData = callbackData;

    if (resultCode === 0) {
      // Payment successful
      order.paymentStatus = "paid";
      order.orderStatus   = "confirmed";

      // Extract M-Pesa receipt number from callback metadata
      const metadata = callbackData.CallbackMetadata?.Item || [];
      const receipt  = metadata.find((i) => i.Name === "MpesaReceiptNumber");
      if (receipt?.Value) {
        order.paymentId = receipt.Value;
      }

      await order.save();

      // Send confirmation email asynchronously
      try {
        const user = await User.findById(order.userId).select("email userName");
        if (user) {
          sendOrderConfirmationEmail(user, order).catch((e) =>
            console.error("Confirmation email failed:", e)
          );
        }
      } catch (emailErr) {
        console.error("Could not fetch user for confirmation email:", emailErr);
      }

      console.log(`M-Pesa payment confirmed for order ${order._id}`);
    } else {
      // Payment failed or cancelled
      order.paymentStatus = "failed";
      order.orderStatus   = "pending"; // Keep pending so admin can follow up
      await order.save();
      console.log(`M-Pesa payment failed/cancelled for order ${order._id}`);
    }

    // Safaricom requires a 200 response
    return res.status(200).json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error("M-Pesa callback processing error:", error);
    return res.status(200).json({ success: false, message: "Internal error" });
  }
};

module.exports = { handleMpesaCallback };