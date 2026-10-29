// server/controllers/admin/banners-controller.js  (Ads & Banners)
const Banner = require("../../models/Banner");

const fail = (res, code, message) => res.status(code).json({ success: false, message });

const clean = (b = {}) => {
  const d = {};
  ["title", "subtitle", "badge", "ctaLabel", "linkUrl", "imageUrl", "mobileImageUrl", "bgColor", "textColor"].forEach((k) => {
    if (b[k] !== undefined) d[k] = String(b[k] ?? "").trim();
  });
  if (b.brandSlug !== undefined) d.brandSlug = String(b.brandSlug ?? "").trim().toLowerCase();
  if (b.couponCode !== undefined) d.couponCode = String(b.couponCode ?? "").trim().toUpperCase().replace(/\s+/g, "");
  if (b.sites !== undefined) d.sites = (Array.isArray(b.sites) ? b.sites : []).filter((s) => Banner.SITES.includes(s));
  if (b.popupLayout !== undefined) d.popupLayout = b.popupLayout;
  if (b.popupFrequency !== undefined) d.popupFrequency = b.popupFrequency;
  if (b.popupPages !== undefined) d.popupPages = b.popupPages;
  if (b.popupDelay !== undefined) d.popupDelay = Math.min(120, Math.max(0, Number(b.popupDelay) || 0));
  if (b.placement !== undefined) d.placement = b.placement;
  if (b.startsAt !== undefined) d.startsAt = b.startsAt ? new Date(b.startsAt) : null;
  if (b.endsAt !== undefined) d.endsAt = b.endsAt ? new Date(b.endsAt) : null;
  if (b.showCountdown !== undefined) d.showCountdown = b.showCountdown === true || b.showCountdown === "true";
  if (b.isActive !== undefined) d.isActive = b.isActive === true || b.isActive === "true";
  if (b.sortOrder !== undefined) d.sortOrder = Number(b.sortOrder) || 0;
  return d;
};

const validate = (d) => {
  if (!d.title) return "Please give the banner a headline.";
  if (!Banner.PLACEMENTS.includes(d.placement)) return "Pick where the banner should appear.";
  if (d.placement !== "announcement" && !d.imageUrl && !d.bgColor) return "Upload an image (or pick a background colour).";
  if (d.startsAt && d.endsAt && d.endsAt <= d.startsAt) return "The end date must be after the start date.";
  if (d.linkUrl && !/^(\/|https?:\/\/)/i.test(d.linkUrl)) return "The link must start with / (a page on this site, e.g. /products) or https://";
  if (d.couponCode && !/^[A-Z0-9_-]{3,24}$/.test(d.couponCode)) return "The discount code must be 3–24 characters: letters, numbers, - or _ (no spaces).";
  if (d.placement === "popup") {
    if (!d.imageUrl && !d.subtitle && !d.couponCode) return "A pop-up needs an image, a message or a discount code.";
    if (!(d.sites || []).length) return "Choose at least one website for the pop-up (Shop and/or Corporate).";
    if (d.popupLayout === "image" && !d.imageUrl) return "The “banner image” layout needs an image. Upload one or switch to the text card layout.";
  }
  return null;
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ placement: 1, sortOrder: 1, createdAt: -1 });
    const now = new Date();
    const data = banners.map((b) => ({
      ...b.toObject(),
      state: !b.isActive ? "off" : b.endsAt && b.endsAt < now ? "expired" : b.startsAt && b.startsAt > now ? "scheduled" : "live",
    }));
    res.status(200).json({ success: true, data });
  } catch (e) { fail(res, 500, "Could not load banners."); }
};

const createBanner = async (req, res) => {
  try {
    const d = clean(req.body);
    const placement = d.placement || "hero";
    // banners have always been shop-only; pop-ups default to both websites
    if (d.sites === undefined) d.sites = placement === "popup" ? ["shop", "corporate"] : ["shop"];
    const err = validate({ placement: "hero", ...d });
    if (err) return fail(res, 400, err);
    const banner = await Banner.create({ placement: "hero", ...d });
    res.status(201).json({ success: true, data: banner });
  } catch (e) { fail(res, 500, e.message || "Could not create the banner."); }
};

const updateBanner = async (req, res) => {
  try {
    const existing = await Banner.findById(req.params.id);
    if (!existing) return fail(res, 404, "Banner not found.");
    const d = clean(req.body);
    const err = validate({ ...existing.toObject(), ...d });
    if (err) return fail(res, 400, err);
    Object.assign(existing, d);
    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (e) { fail(res, 500, e.message || "Could not save the banner."); }
};

const deleteBanner = async (req, res) => {
  try {
    const b = await Banner.findByIdAndDelete(req.params.id);
    if (!b) return fail(res, 404, "Banner not found.");
    res.status(200).json({ success: true, message: "Banner deleted." });
  } catch (e) { fail(res, 500, "Could not delete the banner."); }
};

module.exports = { getAllBanners, createBanner, updateBanner, deleteBanner };
