// server/routes/shop/paystack-routes.js
const express = require("express");
const router = express.Router();

const {
  initializePaystackPayment,
  verifyPaystackPayment,
  handlePaystackWebhook,
} = require("../../controllers/shop/paystackController");

router.post("/paystack/initialize", initializePaystackPayment);
router.get("/paystack/verify/:reference", verifyPaystackPayment);
router.post("/paystack/webhook", handlePaystackWebhook);

module.exports = router;
