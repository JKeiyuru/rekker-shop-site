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
    // Merchandising — controlled from Admin → Brands
    category: { type: String, trim: true, default: "" },        // e.g. "Pet Care", "Home & Cleaning"
    highlights: [{ type: String, trim: true }],                  // short bullet points for brand cards/pages
    // Trade requests (stockists / wholesalers / distributors): minimum units per brand. 0 = use the default (see helpers/trade.js)
    wholesaleMoq: { type: Number, default: 0, min: 0 },
    isFeatured: { type: Boolean, default: false },               // spotlight on the home-page hero (shop + corporate)
    showNewBadge: { type: Boolean, default: false },             // "New" ribbon on cards and the brands pages
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Brand", BrandSchema);
