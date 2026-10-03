const express = require("express");
const { getCategoryTree, getCategoryBySlug } = require("../../controllers/shop/categories-controller");

const router = express.Router();

router.get("/", getCategoryTree);
router.get("/:slug", getCategoryBySlug);

module.exports = router;
