// shop/server/models/Promotion.js
const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Promotion title is required"], trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        "percentage",
        "fixed",
        "buy_x_get_y",
        "bundle",
        "brand",
        "category",
        "product",
        "min_order",
        "free_delivery",
        "coupon",
      ],
    },
    code: { type: String, trim: true, uppercase: true, default: null, index: true },
    value: { type: Number, default: 0 },
    appliesTo: {
      brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
      productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    minOrder: { type: Number, default: 0 },
    buyQty: { type: Number, default: 0 },
    getQty: { type: Number, default: 0 },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PromotionSchema.index({ isActive: 1, startsAt: 1, endsAt: 1 });

module.exports = mongoose.model("Promotion", PromotionSchema);
