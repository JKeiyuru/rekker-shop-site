// server/helpers/paystack.js
// Rekker Paystack helper — Transaction Initialize / Verify + webhook signature check.
//
// Why Paystack (over Pesapal): Paystack gives Rekker one hosted-checkout
// integration that already covers everything Joseph asked for — M-Pesa STK
// push, Visa/Mastercard, and (in Kenya) Airtel Money / Pesalink bank
// transfers — through a single Initialize Transaction call and a single
// webhook. The API and Node ecosystem are also better documented than
// Pesapal's IPN-based flow, which matters for a one-person dev team keeping
// this store running solo. Set PAYSTACK_SECRET_KEY in your server .env
// (Paystack Dashboard → Settings → API Keys & Webhooks), and also flip on
// "Mobile Money" under Preferences in the Paystack dashboard so M-Pesa
// actually shows up at checkout.

const axios = require("axios");
const crypto = require("crypto");

const PAYSTACK_BASE_URL = "https://api.paystack.co";
const secretKey = process.env.PAYSTACK_SECRET_KEY;

const paystackClient = () => {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY not set in environment");
  }
  return axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    timeout: 20000,
  });
};

/**
 * Initialize a Paystack transaction and get back a hosted checkout URL.
 * Amount must be in the smallest currency unit — for KES that's cents,
 * i.e. amountInKES * 100.
 */
const initializeTransaction = async ({ email, amountKES, reference, callbackUrl, cancelUrl, metadata }) => {
  const client = paystackClient();
  const payload = {
    email,
    amount: Math.round(Number(amountKES) * 100),
    currency: "KES",
    reference,
    callback_url: callbackUrl,
    // where Paystack sends the customer if they press "Cancel" on its page
    ...(cancelUrl ? { cancel_action: cancelUrl } : {}),
    // Leaving "channels" broad so the customer picks whichever rail they
    // prefer on Paystack's own checkout page. Which of these actually render
    // depends on what's enabled under Preferences in the Paystack dashboard.
    channels: ["mobile_money", "card", "bank_transfer"],
    metadata,
  };
  const response = await client.post("/transaction/initialize", payload);
  return response.data; // { status, message, data: { authorization_url, access_code, reference } }
};

/**
 * Verify a transaction by its reference — the authoritative way to confirm
 * a payment actually succeeded (used both by the redirect-back page and,
 * defensively, could be re-run any time from the reference).
 */
const verifyTransaction = async (reference) => {
  const client = paystackClient();
  const response = await client.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return response.data; // { status, message, data: { status: "success"|..., amount, channel, ... } }
};

/**
 * Validate the X-Paystack-Signature header on incoming webhooks.
 * Paystack signs the raw request body with HMAC-SHA512 using your secret key.
 */
const verifyWebhookSignature = (rawBody, signatureHeader) => {
  if (!secretKey || !signatureHeader) return false;
  const hash = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
  return hash === signatureHeader;
};

module.exports = { initializeTransaction, verifyTransaction, verifyWebhookSignature };
