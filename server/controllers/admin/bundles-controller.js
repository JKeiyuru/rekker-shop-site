// server/controllers/admin/bundles-controller.js
// Bundle deals — managed without creating "fake" products.
const Bundle = require("../../models/Bundle");
const Product = require("../../models/Product");
const { effectivePrice, bundleAvailability } = require("../../helpers/order-pricing");

const slugify = (v) => String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fail = (res, code, message) => res.status(code).json({ success: false, message });

// Validates + normalises the request body. Returns { error } or { data }.
async function prepare(body = {}, existingId = null) {
  const name = String(body.name || "").trim();
  if (!name) return { error: "Please give the bundle a name." };

  const rawItems = Array.isArray(body.productIds) ? body.productIds : [];
  // merge duplicates of the same product
  const merged = {};
  rawItems.forEach((i) => {
    const id = String(i.productId?._id || i.productId || "");
    const qty = Math.max(1, Math.floor(Number(i.qty) || 1));
    if (id) merged[id] = (merged[id] || 0) + qty;
  });
  const items = Object.entries(merged).map(([productId, qty]) => ({ productId, qty }));
  if (items.length < 1) return { error: "Add at least one product to the bundle." };
  const totalUnits = items.reduce((n, i) => n + i.qty, 0);
  if (totalUnits < 2) return { error: "A bundle needs at least 2 items in total (for example 2 × the same product, or 2 different products)." };

  const products = await Product.find({ _id: { $in: items.map((i) => i.productId) } }).select("price salePrice title");
  if (products.length !== items.length) return { error: "One of the selected products no longer exists. Refresh and try again." };
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));
  const compareAtPrice = items.reduce((s, i) => s + effectivePrice(byId[i.productId]) * i.qty, 0);

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter the bundle price (what the customer pays)." };
  if (price >= compareAtPrice) {
    return { error: `The bundle price (KES ${price.toLocaleString()}) must be LOWER than buying the items separately (KES ${compareAtPrice.toLocaleString()}), otherwise it isn't a deal.` };
  }

  let slug = slugify(body.slug || name);
  if (!slug) return { error: "That name can't be turned into a web address." };
  const clash = await Bundle.findOne({ slug, ...(existingId ? { _id: { $ne: existingId } } : {}) });
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 5)}`;

  const data = {
    name,
    slug,
    description: String(body.description || "").trim(),
    badge: String(body.badge || "").trim(),
    productIds: items,
    price,
    compareAtPrice,
    images: (Array.isArray(body.images) ? body.images : []).filter((u) => typeof u === "string" && u.trim()),
    startsAt: body.startsAt ? new Date(body.startsAt) : null,
    endsAt: body.endsAt ? new Date(body.endsAt) : null,
    maxPerOrder: Math.max(0, Math.floor(Number(body.maxPerOrder) || 0)),
    sortOrder: Number(body.sortOrder) || 0,
    isActive: body.isActive === undefined ? true : body.isActive === true || body.isActive === "true",
  };
  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) return { error: "The end date must be after the start date." };
  return { data };
}

const createBundle = async (req, res) => {
  try {
    const { error, data } = await prepare(req.body);
    if (error) return fail(res, 400, error);
    const bundle = await Bundle.create(data);
    res.status(201).json({ success: true, data: bundle });
  } catch (e) {
    console.error("createBundle:", e);
    fail(res, 500, e.message || "Could not create the bundle.");
  }
};

const getAllBundles = async (req, res) => {
  try {
    const bundles = await Bundle.find().populate("productIds.productId", "title image images price salePrice totalStock stock").sort({ sortOrder: 1, createdAt: -1 });
    const now = new Date();
    const data = bundles.map((b) => {
      const obj = b.toObject();
      const byId = {};
      b.productIds.forEach((i) => { if (i.productId) byId[String(i.productId._id)] = i.productId; });
      obj.available = bundleAvailability(b, byId);
      obj.state = !b.isActive ? "off" : b.endsAt && b.endsAt < now ? "expired" : b.startsAt && b.startsAt > now ? "scheduled" : "live";
      return obj;
    });
    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error("getAllBundles:", e);
    fail(res, 500, "Could not load bundles.");
  }
};

const updateBundle = async (req, res) => {
  try {
    const existing = await Bundle.findById(req.params.id);
    if (!existing) return fail(res, 404, "Bundle not found.");
    const { error, data } = await prepare({ ...existing.toObject(), ...req.body }, existing._id);
    if (error) return fail(res, 400, error);
    Object.assign(existing, data);
    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (e) {
    console.error("updateBundle:", e);
    fail(res, 500, e.message || "Could not save the bundle.");
  }
};

// Quick on/off without validating prices again (a product price may have changed)
const toggleBundle = async (req, res) => {
  try {
    const b = await Bundle.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive === true }, { new: true });
    if (!b) return fail(res, 404, "Bundle not found.");
    res.status(200).json({ success: true, data: b });
  } catch (e) {
    fail(res, 500, "Could not update the bundle.");
  }
};

const deleteBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findByIdAndDelete(req.params.id);
    if (!bundle) return fail(res, 404, "Bundle not found.");
    res.status(200).json({ success: true, message: "Bundle deleted successfully" });
  } catch (e) {
    fail(res, 500, "Could not delete the bundle.");
  }
};

module.exports = { createBundle, getAllBundles, updateBundle, deleteBundle, toggleBundle };
