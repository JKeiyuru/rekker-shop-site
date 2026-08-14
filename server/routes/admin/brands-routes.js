const express = require("express");
const {
  createBrand,
  getAllBrands,
  updateBrand,
  deleteBrand,
} = require("../../controllers/admin/brands-controller");

const router = express.Router();

router.post("/add", createBrand);
router.get("/get", getAllBrands);
router.put("/edit/:id", updateBrand);
router.delete("/delete/:id", deleteBrand);

module.exports = router;
