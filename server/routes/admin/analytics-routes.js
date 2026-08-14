const express = require("express");
const {
  getAnalyticsOverview,
  getSalesByCategory,
} = require("../../controllers/admin/analytics-controller");

const router = express.Router();

router.get("/overview", getAnalyticsOverview);
router.get("/sales-by-category", getSalesByCategory);

module.exports = router;
