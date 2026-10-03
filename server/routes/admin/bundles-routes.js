const express = require("express");
const c = require("../../controllers/admin/bundles-controller");

const router = express.Router();

router.post("/add", c.createBundle);
router.get("/get", c.getAllBundles);
router.put("/edit/:id", c.updateBundle);
router.put("/toggle/:id", c.toggleBundle);
router.delete("/delete/:id", c.deleteBundle);

module.exports = router;
