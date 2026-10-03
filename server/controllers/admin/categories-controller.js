// server/controllers/admin/categories-controller.js
// Admin → Categories. Written so a first-day employee can't break the shop:
//  - only two levels (category → subcategory)
//  - names/slugs must be unique among siblings
//  - a category that still has products or subcategories cannot be deleted
//    (the API says exactly what to do instead)
//  - a "Tidy up" tool moves old per-brand categories onto the standard shelves.

const Category = require("../../models/Category");
const Product = require("../../models/Product");
const slugifyCategory = (v) => String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const taxonomy = require("../../helpers/catalog-taxonomy");

const clean = (body = {}) => {
  const out = {};
  const str = (k) => { if (body[k] !== undefined) out[k] = String(body[k] ?? "").trim(); };
  ["name", "description", "seoTitle", "seoDescription"].forEach(str);
  if (body.slug !== undefined) out.slug = slugifyCategory(body.slug);
  if (body.image !== undefined) out.image = body.image ? String(body.image).trim() : null;
  if (body.parentId !== undefined) out.parentId = body.parentId || null;
  if (body.isActive !== undefined) out.isActive = body.isActive === true || body.isActive === "true";
  if (body.showOnHome !== undefined) out.showOnHome = body.showOnHome === true || body.showOnHome === "true";
  if (body.sortOrder !== undefined) out.sortOrder = Number(body.sortOrder) || 0;
  return out;
};

const fail = (res, code, message) => res.status(code).json({ success: false, message });

// Product counts keyed by category id (main + sub)
async function countsByCategory() {
  const [top, sub] = await Promise.all([
    Product.aggregate([{ $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
    Product.aggregate([{ $group: { _id: "$subcategoryId", n: { $sum: 1 } } }]),
  ]);
  const map = {};
  top.forEach((r) => { if (r._id) map[String(r._id)] = r.n; });
  sub.forEach((r) => { if (r._id) map[String(r._id)] = (map[String(r._id)] || 0) + r.n; });
  return map;
}

const getAllCategories = async (req, res) => {
  try {
    const [categories, counts] = await Promise.all([
      Category.find().sort({ sortOrder: 1, name: 1 }).lean(),
      countsByCategory(),
    ]);
    const data = categories.map((c) => ({ ...c, productCount: counts[String(c._id)] || 0 }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getAllCategories:", error);
    fail(res, 500, "Could not load categories.");
  }
};

const createCategory = async (req, res) => {
  try {
    const data = clean(req.body);
    if (!data.name) return fail(res, 400, "Please give the category a name.");
    data.slug = data.slug || slugifyCategory(data.name);
    if (!data.slug) return fail(res, 400, "That name can't be turned into a web address. Use letters or numbers.");

    if (data.parentId) {
      const parent = await Category.findById(data.parentId);
      if (!parent) return fail(res, 400, "The chosen main category no longer exists.");
      if (parent.parentId) return fail(res, 400, "Categories can only go two levels deep. Pick a main category as the parent, not a subcategory.");
    }

    const dup = await Category.findOne({
      parentId: data.parentId || null,
      name: new RegExp(`^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (dup) return fail(res, 409, `"${dup.name}" already exists here. Edit that one instead of adding a copy.`);

    const slugTaken = await Category.findOne({ slug: data.slug });
    if (slugTaken) data.slug = `${data.slug}-${Math.random().toString(36).slice(2, 5)}`;

    const category = await Category.create({ ...data, source: "custom" });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Error in createCategory:", error);
    fail(res, 500, error.message || "Could not create the category.");
  }
};

const updateCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return fail(res, 404, "Category not found.");

    const data = clean(req.body);
    delete data.source;

    if (data.parentId !== undefined) {
      if (data.parentId && String(data.parentId) === String(existing._id)) return fail(res, 400, "A category can't be inside itself.");
      if (data.parentId) {
        const parent = await Category.findById(data.parentId);
        if (!parent) return fail(res, 400, "The chosen main category no longer exists.");
        if (parent.parentId) return fail(res, 400, "Categories can only go two levels deep.");
        const hasChildren = await Category.exists({ parentId: existing._id });
        if (hasChildren) return fail(res, 400, "This category has subcategories, so it can't become a subcategory itself. Move or delete its subcategories first.");
      }
    }
    if (existing.isSystem) { delete data.parentId; delete data.slug; }

    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await Category.findOne({ slug: data.slug, _id: { $ne: existing._id } });
      if (slugTaken) return fail(res, 409, "Another category already uses that web address (slug).");
    }

    Object.assign(existing, data);
    // Once an admin touches a legacy/hidden category and re-activates it, it becomes theirs
    if (existing.source === "legacy" && data.isActive === true) existing.source = "custom";
    await existing.save();

    // Keep the text fields on products in step if the slug changed
    if (data.slug && data.slug !== req.body._oldSlug) {
      if (existing.parentId) await Product.updateMany({ subcategoryId: existing._id }, { $set: { subcategory: existing.slug } });
      else await Product.updateMany({ categoryId: existing._id }, { $set: { category: existing.slug } });
    }

    res.status(200).json({ success: true, data: existing });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    fail(res, 500, error.message || "Could not save the category.");
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return fail(res, 404, "Category not found.");
    if (category.isSystem) return fail(res, 400, `"${category.name}" is a built-in holding shelf and can't be deleted.`);

    const [children, products] = await Promise.all([
      Category.countDocuments({ parentId: category._id }),
      Product.countDocuments({ $or: [{ categoryId: category._id }, { subcategoryId: category._id }] }),
    ]);
    if (children > 0) return fail(res, 409, `This category still has ${children} subcategor${children === 1 ? "y" : "ies"}. Delete or move those first.`);
    if (products > 0) return fail(res, 409, `${products} product${products === 1 ? " is" : "s are"} still in "${category.name}". Move them to another category first (Products → Edit), or just switch this category off with "Show on website" instead of deleting.`);

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    fail(res, 500, "Could not delete the category.");
  }
};

// Save a new display order for many categories at once: body { order: [id, id, ...] }
const reorderCategories = async (req, res) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order : [];
    if (!order.length) return fail(res, 400, "Nothing to reorder.");
    await Category.bulkWrite(order.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: (i + 1) * 10 } } } })));
    res.status(200).json({ success: true, message: "Order saved." });
  } catch (error) {
    console.error("reorderCategories error:", error);
    fail(res, 500, "Could not save the order.");
  }
};

// Tidy-up tool: GET preview, POST apply
const tidyPreview = async (req, res) => {
  try {
    const [status, report] = await Promise.all([taxonomy.needsTidyUp(), taxonomy.migrateCatalog({ dryRun: true })]);
    res.status(200).json({ success: true, data: { ...status, report } });
  } catch (error) {
    console.error("tidyPreview error:", error);
    fail(res, 500, error.message || "Could not prepare the preview.");
  }
};

const tidyApply = async (req, res) => {
  try {
    const report = await taxonomy.migrateCatalog({ dryRun: false });
    res.status(200).json({ success: true, data: report, message: "Your catalogue has been tidied up." });
  } catch (error) {
    console.error("tidyApply error:", error);
    fail(res, 500, error.message || "The tidy-up failed part-way. Nothing was deleted; you can safely run it again.");
  }
};

// Adds any missing standard shelves without touching products
const addStandardCategories = async (req, res) => {
  try {
    await taxonomy.ensureAllStandardCategories();
    res.status(200).json({ success: true, message: "Standard categories added." });
  } catch (error) {
    console.error("addStandardCategories error:", error);
    fail(res, 500, "Could not add the standard categories.");
  }
};

module.exports = {
  createCategory, getAllCategories, updateCategory, deleteCategory,
  reorderCategories, tidyPreview, tidyApply, addStandardCategories,
};
