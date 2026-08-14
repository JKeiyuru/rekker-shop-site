const express = require("express");
const { getActivePromotions } = require("../../controllers/shop/promotions-controller");

const router = express.Router();

router.get("/active", getActivePromotions);

module.exports = router;
