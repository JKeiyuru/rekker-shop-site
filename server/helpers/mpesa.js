// server/helpers/mpesa.js
// Rekker M-Pesa Daraja API helper.
// Set MPESA_ENV=production in your .env to use production endpoints.
// Sandbox is used by default (safe for testing).

const axios = require("axios");

const MPESA_ENV      = process.env.MPESA_ENV || "sandbox"; // "sandbox" | "production"
const IS_PRODUCTION  = MPESA_ENV === "production";

const BASE_URL       = IS_PRODUCTION
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const consumerKey    = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const passkey        = process.env.MPESA_PASSKEY;
const shortCode      = process.env.MPESA_SHORTCODE || "174379"; // 174379 = Safaricom sandbox default

console.log(`📱 M-Pesa helper loaded — ENV: ${MPESA_ENV}, ShortCode: ${shortCode}`);

/**
 * Obtain an OAuth2 access token from Safaricom.
 * @returns {Promise<string>} access_token
 */
const createToken = async () => {
  if (!consumerKey || !consumerSecret) {
    throw new Error("MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET not set in environment");
  }

  const auth     = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const url      = `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

  const response = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 15000,
  });

  const token = response.data.access_token;
  if (!token) throw new Error("Safaricom did not return an access token");
  console.log("✅ M-Pesa token obtained");
  return token;
};

/**
 * Initiate an STK push (Lipa Na M-Pesa Online).
 * @param {string} token        - OAuth2 access token from createToken()
 * @param {string} phone        - Subscriber phone — must be in format 2547XXXXXXXX
 * @param {number} amount       - Amount in KES (whole number)
 * @param {string} callbackUrl  - Public HTTPS URL for Safaricom to POST the result to
 */
const stkPush = async (token, phone, amount, callbackUrl) => {
  if (!passkey) {
    throw new Error("MPESA_PASSKEY not set in environment");
  }

  const now       = new Date();
  const timestamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const password  = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
  const roundedAmount = Math.ceil(Number(amount)); // Safaricom requires whole KES amounts

  const payload = {
    BusinessShortCode: shortCode,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   "CustomerPayBillOnline",
    Amount:            roundedAmount,
    PartyA:            phone,       // Must be 2547XXXXXXXX
    PartyB:            shortCode,
    PhoneNumber:       phone,       // Must be 2547XXXXXXXX
    CallBackURL:       callbackUrl,
    AccountReference:  "Rekker",
    TransactionDesc:   "Rekker Order Payment",
  };

  console.log("🚀 STK push payload:", {
    ...payload,
    Password: "***hidden***",
  });

  const url      = `${BASE_URL}/mpesa/stkpush/v1/processrequest`;
  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  console.log("📲 STK push response:", response.data);
  return response.data;
};

module.exports = { createToken, stkPush };