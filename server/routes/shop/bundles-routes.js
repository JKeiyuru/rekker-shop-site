const express = require("express");
const { getBundles, getBundleBySlug } = require("../../controllers/shop/bundles-controller");

const router = express.Router();

router.get("/", getBundles);
router.get("/:slug", getBundleBySlug);

module.exports = router;
