const Product = require("../../models/Product");
const Brand = require("../../models/Brand");
const Category = require("../../models/Category");
const { buildProductFilter, buildSort, NOT_HIDDEN } = require("../../helpers/catalog-query");

const POPULATE = [
  { path: "brandId", select: "name slug logoUrl" },
  { path: "categoryId", select: "name slug" },
  { path: "subcategoryId", select: "name slug" },
];

// ── Product list ────────────────────────────────────────────────────────────
// GET /api/shop/products?category=hair-care&brand=cornells&sortBy=newest&page=1&limit=24
// Only two filters exist on the storefront: category and brand (by slug).
// `search`, `onSale`, `inStock` and `newArrivals` are used by the search page
// and home-page rails, not by the filter sidebar.
const listShopProducts = async (req, res) => {
  try {
    const { sortBy = "newest", page = 1, limit = 24 } = req.query;
    const filter = await buildProductFilter(req.query);

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 24));

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(buildSort(sortBy))
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate(POPULATE),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error("Error in listShopProducts:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

// Legacy endpoint (/get) — still used by the home page and search. Same
// filtering logic as above, but returns everything (no paging) like before.
const getFilteredProducts = async (req, res) => {
  try {
    const { sortBy = "price-lowtohigh" } = req.query;
    const filter = await buildProductFilter(req.query);
    const products = await Product.find(filter).sort(buildSort(sortBy)).limit(500).populate(POPULATE);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(POPULATE);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found!" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase(), status: NOT_HIDDEN })
      .populate(POPULATE)
      .populate("relatedProductIds");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found!" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

// ── Filter options with live counts ─────────────────────────────────────────
// GET /api/shop/products/filters?category=...&brand=...
// Returns the categories and brands to show in the sidebar. Counts reflect the
// OTHER filter (pick a brand and category counts shrink to that brand), so a
// shopper can never click into an empty page.
const getFilterOptions = async (req, res) => {
  try {
    const [forCategories, forBrands] = await Promise.all([
      buildProductFilter({ brand: req.query.brand }, { skip: ["category"] }),
      buildProductFilter({ category: req.query.category }, { skip: ["brand"] }),
    ]);

    const [catAgg, subAgg, brandAgg, cats, brands] = await Promise.all([
      Product.aggregate([{ $match: forCategories }, { $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
      Product.aggregate([{ $match: forCategories }, { $group: { _id: "$subcategoryId", n: { $sum: 1 } } }]),
      Product.aggregate([{ $match: forBrands }, { $group: { _id: "$brandId", n: { $sum: 1 } } }]),
      Category.find({ isActive: true, source: { $ne: "legacy" } }).sort({ sortOrder: 1, name: 1 }).lean(),
      Brand.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).lean(),
    ]);

    const topCount = Object.fromEntries(catAgg.filter((r) => r._id).map((r) => [String(r._id), r.n]));
    const subCount = Object.fromEntries(subAgg.filter((r) => r._id).map((r) => [String(r._id), r.n]));
    const brandCount = Object.fromEntries(brandAgg.filter((r) => r._id).map((r) => [String(r._id), r.n]));

    const tops = cats.filter((c) => !c.parentId);
    const categories = tops
      .map((t) => {
        const children = cats
          .filter((c) => String(c.parentId) === String(t._id))
          .map((c) => ({ _id: c._id, name: c.name, slug: c.slug, count: subCount[String(c._id)] || 0 }))
          .filter((c) => c.count > 0);
        return {
          _id: t._id,
          name: t.name,
          slug: t.slug,
          image: t.image,
          count: topCount[String(t._id)] || 0,
          children,
        };
      })
      .filter((t) => t.count > 0);

    const brandList = brands
      .map((b) => ({ _id: b._id, name: b.name, slug: b.slug, logoUrl: b.logoUrl, count: brandCount[String(b._id)] || 0 }))
      .filter((b) => b.count > 0);

    res.status(200).json({ success: true, data: { categories, brands: brandList } });
  } catch (error) {
    console.error("Error in getFilterOptions:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  listShopProducts,
  getProductBySlug,
  getFilterOptions,
};
