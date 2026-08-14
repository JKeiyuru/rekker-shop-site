const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  listShopProducts,
  getProductBySlug,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// Legacy endpoints (kept for backward compatibility)
router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);

// New multi-brand catalogue endpoints
router.get("/", listShopProducts);
router.get("/slug/:slug", getProductBySlug);

module.exports = router;
