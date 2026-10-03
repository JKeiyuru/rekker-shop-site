const express = require("express");
const { getFaqs, ask } = require("../../controllers/shop/assistant-controller");
const router = express.Router();
router.get("/faqs", getFaqs);
router.post("/ask", ask);
module.exports = router;
