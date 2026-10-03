const express = require("express");
const c = require("../../controllers/admin/banners-controller");
const router = express.Router();
router.get("/get", c.getAllBanners);
router.post("/add", c.createBanner);
router.put("/edit/:id", c.updateBanner);
router.delete("/delete/:id", c.deleteBanner);
module.exports = router;
