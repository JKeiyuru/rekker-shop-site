const express = require("express");
const { getBundles } = require("../../controllers/shop/bundles-controller");

const router = express.Router();

router.get("/", getBundles);

module.exports = router;
