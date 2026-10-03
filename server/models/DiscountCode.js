// server/models/DiscountCode.js
// Promo / influencer codes. A code can discount everything, or only chosen
// products / categories / brands (e.g. an influencer who advertised shampoos
// only discounts shampoos, never toys).
const mongoose = require("mongoose");

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, trim: true, default: "" },         // internal note: "Wanjiru TikTok, Oct campaign"
    influencerName: { type: String, trim: true, default: "" },      // who it was given to (for the report)
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },                // 10 => 10%  (or KES 10 if type=fixed)
    maxDiscountAmount: { type: Number, default: 0, min: 0 },        // cap in KES for percent codes (0 = no cap)

    appliesTo: { type: String, enum: ["all", "products", "categories", "brands"], default: "all" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }], // main or sub category
    brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    excludeSaleItems: { type: Boolean, default: false },            // skip products already on sale

    minOrderAmount: { type: Number, default: 0, min: 0 },           // cart subtotal needed
    usageLimit: { type: Number, default: 0, min: 0 },               // total uses (0 = unlimited)
    perUserLimit: { type: Number, default: 1, min: 0 },             // uses per customer (0 = unlimited)
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },

    // running totals (updated when an order is placed / paid)
    usedCount: { type: Number, default: 0 },
    totalDiscountGiven: { type: Number, default: 0 },
    totalSalesValue: { type: Number, default: 0 },                  // order totals that used the code
  },
  { timestamps: true }
);

module.exports = mongoose.model("DiscountCode", DiscountCodeSchema);
