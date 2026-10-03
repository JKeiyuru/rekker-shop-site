// What customers typed into the chat assistant — mainly so the team can see
// the questions it could NOT answer and turn them into new FAQs.
const mongoose = require("mongoose");
const ChatLogSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 300 },
    matched: { type: Boolean, default: false },
    faqId: { type: mongoose.Schema.Types.ObjectId, ref: "FaqEntry", default: null },
    handled: { type: Boolean, default: false }, // admin marked as dealt with
  },
  { timestamps: true }
);
ChatLogSchema.index({ createdAt: -1 });
ChatLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
module.exports = mongoose.model("ChatLog", ChatLogSchema);
