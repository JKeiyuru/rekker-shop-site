// server/helpers/catalog-query.js
// Builds the database query for the storefront product list.
// The shop filter has exactly two filters — Category and Brand — both
// identified by their URL slug (e.g. ?category=hair-care&brand=cornells).

const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const Category = require("../models/Category");

const NOT_HIDDEN = { $nin: ["draft", "archived"] }; // old products may have no status field at all

const csv = (v) =>
  (Array.isArray(v) ? v : String(v || "").split(","))
    .map((x) => String(x).trim())
    .filter(Boolean);

// Old Product.brand strings vs the Brand collection's slugs
const BRAND_SLUG_TO_LEGACY = { "saffron-milan": "saffron", "bio-saff": "biosaff" };

// brand slugs -> a Mongo condition (matches brandId, falling back to the old text field)
async function brandCondition(input) {
  const slugs = csv(input).map((s) => s.toLowerCase());
  if (!slugs.length) return null;
  const brands = await Brand.find({ slug: { $in: slugs } }).select("_id slug").lean();
  const ids = brands.map((b) => b._id);
  const legacy = new Set(slugs);
  slugs.forEach((s) => BRAND_SLUG_TO_LEGACY[s] && legacy.add(BRAND_SLUG_TO_LEGACY[s]));
  const or = [{ brand: { $in: [...legacy] } }];
  if (ids.length) or.push({ brandId: { $in: ids } });
  return { $or: or };
}

// category slugs -> condition. Picking a main category includes everything under it.
async function categoryCondition(input) {
  const slugs = csv(input).map((s) => s.toLowerCase());
  if (!slugs.length) return null;
  const docs = await Category.find({ slug: { $in: slugs } }).select("_id slug parentId").lean();
  const topIds = docs.filter((d) => !d.parentId).map((d) => d._id);
  const subIds = docs.filter((d) => d.parentId).map((d) => d._id);
  const or = [{ category: { $in: slugs } }, { subcategory: { $in: slugs } }];
  if (topIds.length) or.push({ categoryId: { $in: topIds } });
  if (subIds.length) or.push({ subcategoryId: { $in: subIds } });
  return { $or: or };
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Full filter for the product list.
//   opts.skip = ["brand"] | ["category"]  -> leave that filter out (used for facet counts)
async function buildProductFilter(query = {}, opts = {}) {
  const skip = new Set(opts.skip || []);
  const and = [{ status: NOT_HIDDEN }];

  if (!skip.has("brand")) {
    const c = await brandCondition(query.brand);
    if (c) and.push(c);
  }
  if (!skip.has("category")) {
    const c = await categoryCondition(query.category);
    if (c) and.push(c);
  }

  if (query.search && String(query.search).trim()) {
    const rx = new RegExp(escapeRegex(String(query.search).trim()), "i");
    and.push({ $or: [{ title: rx }, { description: rx }, { brand: rx }, { productLine: rx }] });
  }
  if (query.onSale === "true") {
    and.push({ $expr: { $and: [{ $gt: ["$salePrice", 0] }, { $lt: ["$salePrice", "$price"] }] } });
  }
  if (query.inStock === "true") and.push({ totalStock: { $gt: 0 } });
  if (query.newArrivals === "true") and.push({ isNewArrival: true });

  return and.length === 1 ? and[0] : { $and: and };
}

function buildSort(sortBy) {
  switch (sortBy) {
    case "price-lowtohigh": return { price: 1, _id: 1 };
    case "price-hightolow": return { price: -1, _id: 1 };
    case "title-atoz": return { title: 1 };
    case "title-ztoa": return { title: -1 };
    case "bestsellers": return { salesCount: -1, createdAt: -1 };
    case "createdAt-desc":
    case "newest":
    default: return { createdAt: -1 };
  }
}

const isId = (v) => mongoose.Types.ObjectId.isValid(v);

module.exports = { buildProductFilter, buildSort, brandCondition, categoryCondition, NOT_HIDDEN, csv, isId, escapeRegex };
