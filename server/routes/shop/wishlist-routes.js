const express = require("express");
const Wishlist =require('../../models/Wishlist');
const router = express.Router();

// Get wishlist
router.get('/:userId', async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate('products');
  res.json(wishlist || { userId: req.params.userId, products: [] });
});

// Add to wishlist
router.post('/', async (req, res) => {
  const { userId, productId } = req.body;
  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, products: [productId] });
  } else if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  res.json({ success: true, wishlist });
});

// Remove from wishlist
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  const wishlist = await Wishlist.findOne({ userId });

  if (wishlist) {
    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
  }

  res.json({ success: true, wishlist });
});

module.exports = router;