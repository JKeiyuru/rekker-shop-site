const express = require("express");
const { getBrands, getBrandBySlug } = require("../../controllers/shop/brands-controller");

const router = express.Router();

router.get("/", getBrands);
router.get("/:slug", getBrandBySlug);

module.exports = router;
