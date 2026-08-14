// shop/server/models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Category name is required"], trim: true },
    slug: { type: String, required: [true, "Category slug is required"], trim: true, lowercase: true, unique: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    brandIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
    image: { type: String, trim: true, default: null },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ parentId: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", CategorySchema);
