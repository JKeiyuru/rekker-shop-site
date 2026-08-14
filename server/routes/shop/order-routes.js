// server/routes/shop/order-routes.js
// Rekker shop order routes — COD, PayPal, and M-Pesa.

const express = require("express");
const router  = express.Router();

const {
  createOrder,
  capturePayment,
  initiateMpesaPayment,
  getAllOrdersByUser,
  getOrderDetails,
} = require("../../controllers/shop/order-controller");

// Order CRUD
router.post("/create",  createOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id",  getOrderDetails);

// M-Pesa STK push initiation (called from checkout page)
router.post("/mpesa/initiate", initiateMpesaPayment);

module.exports = router;