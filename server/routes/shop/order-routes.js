// server/routes/shop/order-routes.js
// Rekker shop order routes — COD and legacy direct M-Pesa STK push.
// Online payments (M-Pesa / card / Airtel Money via Paystack) live in
// paystack-routes.js.

const express = require("express");
const router  = express.Router();
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { selfOnly } = require("../../middleware/self");

const {
  createOrder,
  initiateMpesaPayment,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");

// Order CRUD
router.post("/create", ...selfOnly, createOrder);
router.get("/list/:userId", ...selfOnly, getAllOrdersByUser);
router.get("/details/:id", authMiddleware, getOrderDetails);

// M-Pesa STK push initiation (legacy — kept for fallback use)
// DISABLED by default: this legacy route trusts client-supplied prices. The
// checkout uses Paystack now. Set ENABLE_LEGACY_MPESA=true only if you
// truly need it back (and re-price the order server-side first).
router.post("/mpesa/initiate", (req, res, next) => {
  if (process.env.ENABLE_LEGACY_MPESA === "true") return next();
  return res.status(410).json({ success: false, message: "Direct M-Pesa is retired. Use the online payment option at checkout." });
}, initiateMpesaPayment);

module.exports = router;
