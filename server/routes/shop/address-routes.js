const express = require("express");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");

const { selfOnly } = require("../../middleware/self");
const router = express.Router();

router.post("/add", ...selfOnly, addAddress);
router.get("/get/:userId", ...selfOnly, fetchAllAddress);
router.delete("/delete/:userId/:addressId", ...selfOnly, deleteAddress);
router.put("/update/:userId/:addressId", ...selfOnly, editAddress);

module.exports = router;
