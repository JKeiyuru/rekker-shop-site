const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  listShopProducts,
  getProductBySlug,
  getFilterOptions,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

// Legacy endpoints (kept so older pages keep working)
router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);

// Storefront catalogue
router.get("/filters", getFilterOptions);
router.get("/slug/:slug", getProductBySlug);
router.get("/", listShopProducts);

module.exports = router;
