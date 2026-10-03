// Admin → Discount Codes
const DiscountCode = require("../../models/DiscountCode");
const DiscountRedemption = require("../../models/DiscountRedemption");
const { normCode } = require("../../helpers/discounts");

const fail = (res, code, message) => res.status(code).json({ success: false, message });
const ids = (a) => (Array.isArray(a) ? a.map((x) => x?._id || x).filter(Boolean) : []);

function prepare(b = {}) {
  const code = normCode(b.code);
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) return { error: "The code must be 3–24 characters: letters, numbers, - or _ (no spaces). Example: WANJIRU10" };
  const type = b.type === "fixed" ? "fixed" : "percent";
  const value = Number(b.value);
  if (!(value > 0)) return { error: "Enter the discount amount." };
  if (type === "percent" && value > 100) return { error: "A percentage can't be more than 100." };
  const appliesTo = ["all", "products", "categories", "brands"].includes(b.appliesTo) ? b.appliesTo : "all";
  const data = {
    code, type, value, appliesTo,
    description: String(b.description || "").trim(),
    influencerName: String(b.influencerName || "").trim(),
    maxDiscountAmount: Math.max(0, Number(b.maxDiscountAmount) || 0),
    productIds: appliesTo === "products" ? ids(b.productIds) : [],
    categoryIds: appliesTo === "categories" ? ids(b.categoryIds) : [],
    brandIds: appliesTo === "brands" ? ids(b.brandIds) : [],
    excludeSaleItems: b.excludeSaleItems === true || b.excludeSaleItems === "true",
    minOrderAmount: Math.max(0, Number(b.minOrderAmount) || 0),
    usageLimit: Math.max(0, Math.floor(Number(b.usageLimit) || 0)),
    perUserLimit: Math.max(0, Math.floor(b.perUserLimit === "" || b.perUserLimit === undefined ? 1 : Number(b.perUserLimit) || 0)),
    startsAt: b.startsAt ? new Date(b.startsAt) : null,
    endsAt: b.endsAt ? new Date(b.endsAt) : null,
    isActive: b.isActive === undefined ? true : b.isActive === true || b.isActive === "true",
  };
  if (appliesTo === "products" && !data.productIds.length) return { error: "Choose at least one product this code works on (or switch to “Everything”)." };
  if (appliesTo === "categories" && !data.categoryIds.length) return { error: "Choose at least one category this code works on." };
  if (appliesTo === "brands" && !data.brandIds.length) return { error: "Choose at least one brand this code works on." };
  if (data.startsAt && data.endsAt && data.endsAt <= data.startsAt) return { error: "The end date must be after the start date." };
  return { data };
}

const list = async (req, res) => {
  try {
    const docs = await DiscountCode.find().sort({ createdAt: -1 })
      .populate("productIds", "title").populate("categoryIds", "name parentId").populate("brandIds", "name");
    const now = new Date();
    const data = docs.map((d) => {
      const o = d.toObject();
      o.state = !d.isActive ? "off" : d.endsAt && d.endsAt < now ? "expired" : d.startsAt && d.startsAt > now ? "scheduled"
        : d.usageLimit > 0 && d.usedCount >= d.usageLimit ? "used-up" : "live";
      return o;
    });
    res.status(200).json({ success: true, data });
  } catch (e) { fail(res, 500, "Could not load codes."); }
};

const create = async (req, res) => {
  try {
    const { error, data } = prepare(req.body);
    if (error) return fail(res, 400, error);
    if (await DiscountCode.findOne({ code: data.code })) return fail(res, 409, `The code ${data.code} already exists. Pick a different one.`);
    res.status(201).json({ success: true, data: await DiscountCode.create(data) });
  } catch (e) { fail(res, 500, e.message || "Could not create the code."); }
};

const update = async (req, res) => {
  try {
    const existing = await DiscountCode.findById(req.params.id);
    if (!existing) return fail(res, 404, "Code not found.");
    const { error, data } = prepare({ ...existing.toObject(), ...req.body });
    if (error) return fail(res, 400, error);
    if (data.code !== existing.code && (await DiscountCode.findOne({ code: data.code }))) return fail(res, 409, `The code ${data.code} already exists.`);
    Object.assign(existing, data);
    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (e) { fail(res, 500, e.message || "Could not save the code."); }
};

const toggle = async (req, res) => {
  try {
    const d = await DiscountCode.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive === true }, { new: true });
    if (!d) return fail(res, 404, "Code not found.");
    res.status(200).json({ success: true, data: d });
  } catch (e) { fail(res, 500, "Could not update."); }
};

const remove = async (req, res) => {
  try {
    const d = await DiscountCode.findById(req.params.id);
    if (!d) return fail(res, 404, "Code not found.");
    if (d.usedCount > 0) return fail(res, 409, `${d.code} has been used ${d.usedCount} time(s), so it can't be deleted (your sales report depends on it). Switch it off instead.`);
    await d.deleteOne();
    res.status(200).json({ success: true });
  } catch (e) { fail(res, 500, "Could not delete."); }
};

const redemptions = async (req, res) => {
  try {
    const data = await DiscountRedemption.find({ codeId: req.params.id }).sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ success: true, data });
  } catch (e) { fail(res, 500, "Could not load."); }
};

module.exports = { list, create, update, toggle, remove, redemptions };
