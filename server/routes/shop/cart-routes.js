const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");

const { selfOnly } = require("../../middleware/self");
const router = express.Router();

router.post("/add", ...selfOnly, addToCart);
router.get("/get/:userId", ...selfOnly, fetchCartItems);
router.put("/update-cart", ...selfOnly, updateCartItemQty);
router.delete("/:userId/:productId", ...selfOnly, deleteCartItem);

module.exports = router;
