// shop/server/models/Article.js
const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Article title is required"], trim: true },
    slug: { type: String, required: [true, "Article slug is required"], trim: true, lowercase: true, unique: true, index: true },
    cover: { type: String, trim: true, default: null },
    body: { type: String, default: "" },
    relatedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
    seoTitle: { type: String, trim: true, default: "" },
    seoDescription: { type: String, trim: true, default: "" },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ArticleSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model("Article", ArticleSchema);
