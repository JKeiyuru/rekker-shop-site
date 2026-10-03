// server/models/Bundle.js
// A bundle deal ("Family Care Pack — any 3 for KES 1,499"). It is NOT a product:
// it points at existing products with quantities and carries its own price.
// Stock is derived from the component products, so there is nothing extra to
// maintain. Admins manage these in Admin → Bundle Deals.

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
    name: { type: String, required: [true, "Bundle name is required"], trim: true, maxlength: 140 },
    slug: { type: String, required: [true, "Bundle slug is required"], trim: true, lowercase: true, unique: true, index: true },
    description: { type: String, trim: true, default: "", maxlength: 1200 },
    badge: { type: String, trim: true, default: "", maxlength: 30 }, // e.g. "Best value"
    productIds: { type: [BundleItemSchema], default: [], validate: [(v) => v.length >= 2, "A bundle needs at least 2 products"] },
    price: { type: Number, required: true, min: 0 },          // what the customer pays for one bundle
    compareAtPrice: { type: Number, default: 0 },             // sum of the normal prices (auto-filled on save)
    images: [{ type: String, trim: true }],                   // optional custom images; falls back to product photos
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    maxPerOrder: { type: Number, default: 0, min: 0 },         // 0 = no limit
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BundleSchema.index({ isActive: 1, sortOrder: 1 });

// How much the customer saves compared with buying the items separately.
BundleSchema.virtual("savings").get(function () {
  const diff = (this.compareAtPrice || 0) - (this.price || 0);
  return diff > 0 ? diff : 0;
});
BundleSchema.virtual("savingsPercent").get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

module.exports = mongoose.model("Bundle", BundleSchema);
