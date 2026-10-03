const express = require("express");
const c = require("../../controllers/admin/faqs-controller");
const router = express.Router();
router.get("/get", c.list);
router.post("/add", c.create);
router.put("/edit/:id", c.update);
router.delete("/delete/:id", c.remove);
router.post("/dismiss", c.dismissQuestion);
module.exports = router;
