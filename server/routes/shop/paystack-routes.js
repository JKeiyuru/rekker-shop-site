// server/routes/shop/paystack-routes.js
const express = require("express");
const router = express.Router();
const { selfOnly } = require("../../middleware/self");

const {
  initializePaystackPayment,
  verifyPaystackPayment,
  handlePaystackWebhook,
  cancelPaystackPayment,
  retryPaystackPayment,
} = require("../../controllers/shop/paystackController");

router.post("/paystack/initialize", ...selfOnly, initializePaystackPayment);
router.get("/paystack/verify/:reference", verifyPaystackPayment);
router.post("/paystack/cancel", ...selfOnly, cancelPaystackPayment);
router.post("/paystack/retry", ...selfOnly, retryPaystackPayment);
router.post("/paystack/webhook", handlePaystackWebhook);

module.exports = router;
