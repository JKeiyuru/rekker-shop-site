// server/routes/common/feature-routes.js
const express = require("express");
const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");

const { adminOnly } = require("../../middleware/admin");
const router = express.Router();

router.post("/add", ...adminOnly, addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", ...adminOnly, deleteFeatureImage);

module.exports = router;