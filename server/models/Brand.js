// shop/server/models/Brand.js
const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Brand name is required"], trim: true },
    slug: { type: String, required: [true, "Brand slug is required"], trim: true, lowercase: true, unique: true, index: true },
    tagline: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    story: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: null },
    bannerUrl: { type: String, trim: true, default: null },
    themeColor: { type: String, trim: true, default: "#000000" },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    ogImage: { type: String, trim: true, default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Brand", BrandSchema);
