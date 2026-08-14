const express = require("express");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../../controllers/admin/categories-controller");

const router = express.Router();

router.post("/add", createCategory);
router.get("/get", getAllCategories);
router.put("/edit/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
