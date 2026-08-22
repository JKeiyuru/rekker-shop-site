// server/routes/shop/order-routes.js
// Rekker shop order routes — COD and legacy direct M-Pesa STK push.
// Online payments (M-Pesa / card / Airtel Money via Paystack) live in
// paystack-routes.js.

const express = require("express");
const router  = express.Router();

const {
  createOrder,
  initiateMpesaPayment,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");

// Order CRUD
router.post("/create",  createOrder);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id",  getOrderDetails);

// M-Pesa STK push initiation (legacy — kept for fallback use)
router.post("/mpesa/initiate", initiateMpesaPayment);

module.exports = router;
