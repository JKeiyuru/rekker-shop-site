const express = require("express");
const { getCategoryTree } = require("../../controllers/shop/categories-controller");

const router = express.Router();

router.get("/", getCategoryTree);

module.exports = router;
