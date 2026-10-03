const FaqEntry = require("../../models/FaqEntry");
const ChatLog = require("../../models/ChatLog");
const fail = (res, c, m) => res.status(c).json({ success: false, message: m });

const clean = (b = {}) => ({
  question: String(b.question || "").trim(),
  answer: String(b.answer || "").trim(),
  keywords: (Array.isArray(b.keywords) ? b.keywords : String(b.keywords || "").split(",")).map((k) => String(k).trim().toLowerCase()).filter(Boolean).slice(0, 30),
  link: String(b.link || "").trim(),
  linkLabel: String(b.linkLabel || "").trim(),
  sortOrder: Number(b.sortOrder) || 0,
  isActive: b.isActive === undefined ? true : b.isActive === true || b.isActive === "true",
});
const check = (d) => (!d.question ? "Type the question customers ask." : !d.answer ? "Type the answer." : d.link && !/^(\/|https?:\/\/)/.test(d.link) ? "A link must start with / or https://" : null);

const list = async (req, res) => {
  try {
    const [faqs, unanswered] = await Promise.all([
      FaqEntry.find().sort({ sortOrder: 1, createdAt: 1 }),
      ChatLog.aggregate([
        { $match: { matched: false, handled: false } },
        { $group: { _id: { $toLower: "$text" }, text: { $first: "$text" }, count: { $sum: 1 }, last: { $max: "$createdAt" } } },
        { $sort: { count: -1, last: -1 } }, { $limit: 40 },
      ]),
    ]);
    res.status(200).json({ success: true, data: faqs, unanswered });
  } catch (e) { fail(res, 500, "Could not load."); }
};
const create = async (req, res) => { try { const d = clean(req.body); const e = check(d); if (e) return fail(res, 400, e); res.status(201).json({ success: true, data: await FaqEntry.create(d) }); } catch (x) { fail(res, 500, "Could not save."); } };
const update = async (req, res) => { try { const d = clean(req.body); const e = check(d); if (e) return fail(res, 400, e); const f = await FaqEntry.findByIdAndUpdate(req.params.id, d, { new: true }); if (!f) return fail(res, 404, "Not found."); res.status(200).json({ success: true, data: f }); } catch (x) { fail(res, 500, "Could not save."); } };
const remove = async (req, res) => { try { await FaqEntry.findByIdAndDelete(req.params.id); res.status(200).json({ success: true }); } catch (x) { fail(res, 500, "Could not delete."); } };
// mark one unanswered question (all identical texts) as dealt with
const dismissQuestion = async (req, res) => {
  try { await ChatLog.updateMany({ matched: false, text: new RegExp(`^${String(req.body.text || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }, { handled: true }); res.status(200).json({ success: true }); }
  catch (x) { fail(res, 500, "Could not update."); }
};
module.exports = { list, create, update, remove, dismissQuestion };
