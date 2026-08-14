const express = require("express");
const {
  createBundle,
  getAllBundles,
  updateBundle,
  deleteBundle,
} = require("../../controllers/admin/bundles-controller");

const router = express.Router();

router.post("/add", createBundle);
router.get("/get", getAllBundles);
router.put("/edit/:id", updateBundle);
router.delete("/delete/:id", deleteBundle);

module.exports = router;
