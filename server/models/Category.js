// shop/server/models/Category.js
//
// Categories are real, brand-independent shelves ("Hair Care", "Home Care &
// Hygiene") with at most two levels: a main category and its subcategories.
// Brands are a separate filter — they do NOT own categories any more.
// (brandIds is kept only so old data still loads.)

const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Category name is required"], trim: true },
    slug: { type: String, required: [true, "Category slug is required"], trim: true, lowercase: true, unique: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    description: { type: String, trim: true, default: "" },        // short intro shown on the shop page
    image: { type: String, trim: true, default: null },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },                    // "Show on website"
    showOnHome: { type: Boolean, default: false },                 // feature as a tile on the home page
    sortOrder: { type: Number, default: 0 },
    // standard = shipped with the system, custom = created by an admin,
    // legacy = old per-brand category kept hidden after tidy-up.
    // Documents created before this field existed have no value and are
    // treated as legacy by the catalogue tidy-up tool.
    source: { type: String, enum: ["standard", "custom", "legacy"], default: "custom" },
    isSystem: { type: Boolean, default: false },                   // cannot be deleted (e.g. Uncategorised)
    brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }], // deprecated
  },
  { timestamps: true }
);

CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", CategorySchema);
