// shop/server/controllers/shop/categories-controller.js
const Category = require("../../models/Category");
const Product = require("../../models/Product");
const { NOT_HIDDEN } = require("../../helpers/catalog-query");

// GET /api/shop/categories  → tree of visible categories (with product counts)
// ?home=true → only the ones flagged "Show on home page"
const getCategoryTree = async (req, res) => {
  try {
    const filter = { isActive: true, source: { $ne: "legacy" } };
    if (req.query.home === "true") filter.showOnHome = true;

    const [categories, topAgg, subAgg] = await Promise.all([
      Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean(),
      Product.aggregate([{ $match: { status: NOT_HIDDEN } }, { $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
      Product.aggregate([{ $match: { status: NOT_HIDDEN } }, { $group: { _id: "$subcategoryId", n: { $sum: 1 } } }]),
    ]);

    const counts = {};
    topAgg.forEach((r) => { if (r._id) counts[String(r._id)] = r.n; });
    subAgg.forEach((r) => { if (r._id) counts[String(r._id)] = r.n; });

    const byId = {};
    categories.forEach((cat) => { byId[String(cat._id)] = { ...cat, productCount: counts[String(cat._id)] || 0, children: [] }; });

    const tree = [];
    categories.forEach((cat) => {
      const node = byId[String(cat._id)];
      if (cat.parentId && byId[String(cat.parentId)]) byId[String(cat.parentId)].children.push(node);
      else if (!cat.parentId) tree.push(node);
    });

    // hide empty shelves from shoppers
    const visible = tree.filter((t) => t.productCount > 0 || t.children.some((c) => c.productCount > 0));

    res.status(200).json({ success: true, data: visible });
  } catch (error) {
    console.error("Error in getCategoryTree:", error);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

// GET /api/shop/categories/:slug
const getCategoryBySlug = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: String(req.params.slug).toLowerCase(), isActive: true, source: { $ne: "legacy" } }).lean();
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    const parent = cat.parentId ? await Category.findById(cat.parentId).select("name slug").lean() : null;
    res.status(200).json({ success: true, data: { ...cat, parent } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

module.exports = { getCategoryTree, getCategoryBySlug };
