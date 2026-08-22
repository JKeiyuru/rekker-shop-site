// server/routes/shop/wishlist-routes.js
const express = require("express");
const mongoose = require("mongoose");
const Wishlist = require("../../models/Wishlist");
const router = express.Router();

// Get wishlist
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ userId, products: [] });
    }
    const wishlist = await Wishlist.findOne({ userId }).populate("products");
    res.json(wishlist || { userId, products: [] });
  } catch (e) {
    console.error("Get wishlist error:", e.message);
    res.status(500).json({ success: false, message: "Could not load wishlist" });
  }
});

// Add to wishlist
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "userId and productId are required" });
    }
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else if (!wishlist.products.some((p) => p.toString() === productId)) {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    await wishlist.populate("products");
    res.json({ success: true, wishlist });
  } catch (e) {
    console.error("Add to wishlist error:", e.message);
    res.status(500).json({ success: false, message: "Could not add to wishlist" });
  }
});

// Remove from wishlist
router.post("/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "userId and productId are required" });
    }
    const wishlist = await Wishlist.findOne({ userId });

    if (wishlist) {
      wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
      await wishlist.save();
      await wishlist.populate("products");
    }

    res.json({ success: true, wishlist: wishlist || { userId, products: [] } });
  } catch (e) {
    console.error("Remove from wishlist error:", e.message);
    res.status(500).json({ success: false, message: "Could not remove from wishlist" });
  }
});

module.exports = router;
