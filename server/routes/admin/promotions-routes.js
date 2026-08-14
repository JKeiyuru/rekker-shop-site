const express = require("express");
const {
  createPromotion,
  getAllPromotions,
  updatePromotion,
  deletePromotion,
} = require("../../controllers/admin/promotions-controller");

const router = express.Router();

router.post("/add", createPromotion);
router.get("/get", getAllPromotions);
router.put("/edit/:id", updatePromotion);
router.delete("/delete/:id", deletePromotion);

module.exports = router;
