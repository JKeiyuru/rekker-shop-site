const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { validateDiscount } = require("../../controllers/shop/discount-controller");
const router = express.Router();
router.post("/validate", authMiddleware, validateDiscount);
module.exports = router;
