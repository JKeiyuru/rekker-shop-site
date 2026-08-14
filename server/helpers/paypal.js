// server/helpers/paypal.js
// Rekker PayPal helper.
// configure() is called here but errors are caught and re-thrown with a clear
// message so the lazy-loading in order-controller.js can surface them cleanly.

const paypal = require("paypal-rest-sdk");

const mode   = process.env.PAYPAL_MODE;
const id     = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;

if (!mode || !id || !secret) {
  // Log clearly but don't throw — the lazy require in order-controller will
  // propagate a useful error only when a PayPal payment is actually attempted.
  console.warn(
    "⚠️  PayPal: PAYPAL_MODE, PAYPAL_CLIENT_ID, or PAYPAL_CLIENT_SECRET missing from environment. " +
    "PayPal payments will fail but COD and M-Pesa are unaffected."
  );
}

try {
  paypal.configure({
    mode:          mode   || "sandbox",
    client_id:     id     || "",
    client_secret: secret || "",
  });
} catch (e) {
  console.error("PayPal configure error:", e.message);
}

module.exports = paypal;