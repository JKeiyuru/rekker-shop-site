// shop/server/models/Bundle.js
const mongoose = require("mongoose");

const BundleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const BundleSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Bundle name is required"], trim: true },
    slug: { type: String, required: [true, "Bundle slug is required"], trim: true, lowercase: true, unique: true, index: true },
    productIds: { type: [BundleItemSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    images: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bundle", BundleSchema);
