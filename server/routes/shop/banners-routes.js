const express = require("express");
const { getActiveBanners, trackBanner } = require("../../controllers/shop/banners-controller");
const router = express.Router();
router.get("/", getActiveBanners);
router.post("/:id/:event(click|view)", trackBanner);
module.exports = router;
