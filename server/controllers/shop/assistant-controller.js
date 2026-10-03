// The chat assistant brain: answers from the admin-managed FAQ list.
// No outside AI service — fast, free, and it only ever says what the team wrote.
const FaqEntry = require("../../models/FaqEntry");
const ChatLog = require("../../models/ChatLog");
const seed = require("../../helpers/faq-seed");

const STOP = new Set(["the","a","an","is","are","do","does","you","your","i","me","my","to","of","for","and","or","can","how","what","where","when","it","in","on","at","with","have","has","there","please","hi","hello","hey","want","need","get","about"]);
const tokens = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");

async function ensureSeed() {
  if ((await FaqEntry.estimatedDocumentCount()) === 0) {
    await FaqEntry.insertMany(seed.map((f, i) => ({ ...f, sortOrder: i * 10 }))).catch(() => {});
  }
}

const getFaqs = async (req, res) => {
  try {
    await ensureSeed();
    const data = await FaqEntry.find({ isActive: true }).sort({ sortOrder: 1 }).select("question").lean();
    res.status(200).json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, data: [] }); }
};

// POST /ask { text } or { faqId }
const ask = async (req, res) => {
  try {
    await ensureSeed();
    const { text, faqId } = req.body || {};
    const faqs = await FaqEntry.find({ isActive: true });
    let best = null;

    if (faqId) {
      best = faqs.find((f) => String(f._id) === String(faqId)) || null;
    } else {
      const q = tokens(text).map(stem);
      if (!q.length) return res.status(200).json({ success: true, matched: false });
      let top = 0;
      for (const f of faqs) {
        const kw = new Set([...tokens(f.question), ...(f.keywords || []).flatMap(tokens)].map(stem));
        let score = 0;
        q.forEach((w) => { if (kw.has(w)) score += 2; else if ([...kw].some((k) => k.length > 3 && w.length > 3 && (k.startsWith(w) || w.startsWith(k)))) score += 1; });
        if (score > top) { top = score; best = f; }
      }
      if (top < 2) best = null; // need at least one solid keyword hit
      await ChatLog.create({ text: String(text).slice(0, 300), matched: !!best, faqId: best?._id || null }).catch(() => {});
    }

    if (!best) return res.status(200).json({ success: true, matched: false });
    FaqEntry.updateOne({ _id: best._id }, { $inc: { timesShown: 1 } }).catch(() => {});
    res.status(200).json({ success: true, matched: true, answer: best.answer, question: best.question, link: best.link, linkLabel: best.linkLabel });
  } catch (e) { res.status(500).json({ success: false, matched: false }); }
};

module.exports = { getFaqs, ask };
