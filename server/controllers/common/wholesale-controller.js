// Wholesale / trade requests: public form + admin inbox
const WholesaleRequest = require("../../models/WholesaleRequest");
const { notifyNewWholesale } = require("../../helpers/notifications");
const { sendWholesaleAckEmail } = require("../../helpers/email");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const s = (v, n) => String(v ?? "").trim().slice(0, n);

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

    const doc = await WholesaleRequest.create({
      businessName: s(b.businessName, 200),
      contactName: s(b.contactName, 200),
      email: s(b.email, 200),
      phone: s(b.phone, 60),
      businessType: s(b.businessType, 40) || undefined,
      county: s(b.county, 80),
      town: s(b.town, 120),
      kraPin: s(b.kraPin, 30),
      brandsInterested: Array.isArray(b.brandsInterested) ? b.brandsInterested.map((x) => s(x, 60)).filter(Boolean).slice(0, 10) : [],
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

module.exports = { createWholesaleRequest, getWholesaleRequests, updateWholesaleRequest, deleteWholesaleRequest };
