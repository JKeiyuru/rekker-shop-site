const express = require("express");
const c = require("../../controllers/admin/categories-controller");

const router = express.Router();

router.post("/add", c.createCategory);
router.get("/get", c.getAllCategories);
router.put("/edit/:id", c.updateCategory);
router.delete("/delete/:id", c.deleteCategory);
router.put("/reorder", c.reorderCategories);
router.get("/tidy/preview", c.tidyPreview);
router.post("/tidy/apply", c.tidyApply);
router.post("/standard/add", c.addStandardCategories);

module.exports = router;
