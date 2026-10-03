const express = require("express");
const { adminOnly } = require("../../middleware/admin");
const c = require("../../controllers/common/wholesale-controller");
const router = express.Router();

router.post("/submit", c.createWholesaleRequest);               // public
router.get("/requests", ...adminOnly, c.getWholesaleRequests);   // admin
router.put("/requests/:id", ...adminOnly, c.updateWholesaleRequest);
router.delete("/requests/:id", ...adminOnly, c.deleteWholesaleRequest);
module.exports = router;
