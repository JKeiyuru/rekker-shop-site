const mongoose = require("mongoose");

// A cart line is EITHER a product (productId) OR a bundle deal (bundleId).
const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },
        bundleId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Bundle",
          default: null,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", CartSchema);
