const mongoose = require("mongoose");
const FaqEntrySchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 200 },
    answer: { type: String, required: true, trim: true, maxlength: 1500 },
    keywords: [{ type: String, trim: true, lowercase: true }], // extra words that should trigger this answer
    link: { type: String, trim: true, default: "" },           // optional page to offer ("/wholesale")
    linkLabel: { type: String, trim: true, default: "" },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    timesShown: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("FaqEntry", FaqEntrySchema);
