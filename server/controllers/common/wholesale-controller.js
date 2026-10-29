// Wholesale / trade requests: public form + admin inbox
const WholesaleRequest = require("../../models/WholesaleRequest");
const { notifyNewWholesale } = require("../../helpers/notifications");
const { sendWholesaleAckEmail } = require("../../helpers/email");
const Brand = require("../../models/Brand");
const { moqFor, DEFAULT_MOQ } = require("../../helpers/trade");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (v, n) => String(v ?? "").trim().slice(0, n);

const REQUEST_TYPES = ["stockist", "wholesaler", "distributor"];
const FREQ = ["one-off", "weekly", "fortnightly", "monthly"];
const PAY = ["prepay", "cash-on-delivery", "credit-request"];
const num = (v) => (v === "" || v === null || v === undefined || isNaN(Number(v)) ? null : Number(v));

// Public: brands + the MOQ each one needs, so the form can show it live
const getTradeConfig = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).select("name slug wholesaleMoq").lean();
    res.status(200).json({ success: true, data: { defaultMoq: DEFAULT_MOQ, brands: brands.map((x) => ({ name: x.name, slug: x.slug, moq: moqFor(x) })) } });
  } catch (e) { res.status(500).json({ success: false, message: "Could not load trade settings." }); }
};

const createWholesaleRequest = async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.businessName || !b.contactName || !b.email || !b.phone) {
      return res.status(400).json({ success: false, message: "Business name, your name, email and phone are required." });
    }
    if (!EMAIL_RE.test(b.email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (String(b.phone).replace(/\D/g, "").length < 9) return res.status(400).json({ success: false, message: "Please enter a valid phone number." });

    // Quiet honeypot: bots fill hidden fields
    if (b.website) return res.status(201).json({ success: true, message: "Request received." });

    // ── Trade application checks (new form). Older callers that send no items still work. ──
    const requestType = REQUEST_TYPES.includes(b.requestType) ? b.requestType : "stockist";
    let items = [];
    let moqSnapshot = [];
    const detailed = Array.isArray(b.items);
    if (detailed) {
      if (!s(b.county, 80) || !s(b.town, 120) || !s(b.physicalAddress, 400)) {
        return res.status(400).json({ success: false, message: "Please give your county, town and physical address so we can plan delivery." });
      }
      const raw = b.items.slice(0, 60).map((i) => ({ brandSlug: s(i.brandSlug, 80).toLowerCase(), productId: s(i.productId, 40), productName: s(i.productName, 200), quantity: Math.floor(Number(i.quantity)) }))
        .filter((i) => i.brandSlug && i.quantity > 0);
      if (!raw.length) return res.status(400).json({ success: false, message: "Add at least one brand and quantity to your order." });
      const brands = await Brand.find({ slug: { $in: [...new Set(raw.map((i) => i.brandSlug))] }, isActive: true }).lean();
      const bySlug = Object.fromEntries(brands.map((x) => [x.slug, x]));
      if (raw.some((i) => !bySlug[i.brandSlug])) return res.status(400).json({ success: false, message: "One of the brands you chose is not available. Please refresh the page and try again." });
      const totals = {};
      raw.forEach((i) => { totals[i.brandSlug] = (totals[i.brandSlug] || 0) + i.quantity; });
      const short = Object.entries(totals).filter(([slug, q]) => q < moqFor(bySlug[slug]));
      if (short.length) {
        return res.status(400).json({ success: false, message: short.map(([slug, q]) => `${bySlug[slug].name}: you asked for ${q} but the minimum order is ${moqFor(bySlug[slug])} units`).join(". ") + "." });
      }
      items = raw.map((i) => ({ ...i, brandName: bySlug[i.brandSlug].name }));
      moqSnapshot = Object.entries(totals).map(([slug, q]) => ({ brandSlug: slug, brandName: bySlug[slug].name, moq: moqFor(bySlug[slug]), quantity: q }));
      if (requestType === "distributor" && !(Array.isArray(b.territoryCounties) && b.territoryCounties.length)) {
        return res.status(400).json({ success: false, message: "Distributors: please choose the counties you cover." });
      }
    }

    const doc = await WholesaleRequest.create({
      requestType,
      source: b.source === "corporate" ? "corporate" : "shop",
      yearsInBusiness: num(b.yearsInBusiness),
      physicalAddress: s(b.physicalAddress, 400),
      deliveryAddress: s(b.deliveryAddress, 400),
      mapLink: s(b.mapLink, 400),
      items,
      moqSnapshot,
      orderFrequency: FREQ.includes(b.orderFrequency) ? b.orderFrequency : undefined,
      paymentPreference: PAY.includes(b.paymentPreference) ? b.paymentPreference : undefined,
      currentSuppliers: s(b.currentSuppliers, 500),
      territoryCounties: Array.isArray(b.territoryCounties) ? b.territoryCounties.map((x) => s(x, 60)).filter(Boolean).slice(0, 47) : [],
      outletsServed: num(b.outletsServed),
      hasWarehouse: b.hasWarehouse === true,
      hasDeliveryVehicles: b.hasDeliveryVehicles === true,
      businessName: s(b.businessName, 200),
      contactName: s(b.contactName, 200),
      email: s(b.email, 200),
      phone: s(b.phone, 60),
      businessType: s(b.businessType, 40) || undefined,
      county: s(b.county, 80),
      town: s(b.town, 120),
      kraPin: s(b.kraPin, 30),
      brandsInterested: detailed ? [...new Set(items.map((i) => i.brandName))] : Array.isArray(b.brandsInterested) ? b.brandsInterested.map((x) => s(x, 60)).filter(Boolean).slice(0, 10) : [],
      productsInterested: s(b.productsInterested, 1500),
      estimatedMonthlyOrder: s(b.estimatedMonthlyOrder, 30) || undefined,
      message: s(b.message, 4000),
      pageUrl: s(b.pageUrl, 500),
    });

    notifyNewWholesale(doc);
    sendWholesaleAckEmail(doc).catch((e) => console.error("Wholesale ack email failed:", e.message));

    res.status(201).json({ success: true, message: "Request received.", data: { id: doc._id } });
  } catch (error) {
    console.error("createWholesaleRequest error:", error);
    res.status(500).json({ success: false, message: "Could not submit your request. Please try again." });
  }
};

const getWholesaleRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const q = status && status !== "all" ? { status } : {};
    const [data, newCount] = await Promise.all([
      WholesaleRequest.find(q).sort({ createdAt: -1 }).limit(500),
      WholesaleRequest.countDocuments({ status: "new" }),
    ]);
    res.status(200).json({ success: true, data, newCount });
  } catch (e) { res.status(500).json({ success: false, message: "Could not load requests." }); }
};

const updateWholesaleRequest = async (req, res) => {
  try {
    const set = {};
    if (req.body.status) set.status = req.body.status;
    if (req.body.adminNotes !== undefined) set.adminNotes = s(req.body.adminNotes, 4000);
    const doc = await WholesaleRequest.findByIdAndUpdate(req.params.id, { $set: set }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: "Request not found." });
    res.status(200).json({ success: true, data: doc });
  } catch (e) { res.status(400).json({ success: false, message: "Could not update the request." }); }
};

const deleteWholesaleRequest = async (req, res) => {
  try {
    await WholesaleRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: "Could not delete." }); }
};

module.exports = { getTradeConfig, createWholesaleRequest, getWholesaleRequests, updateWholesaleRequest, deleteWholesaleRequest };
