// shop/server/models/ContactMessage.js
const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["corporate", "shop"],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    company: { type: String, trim: true, default: "" },
    subject: { type: String, trim: true, default: "" },
    inquiryType: { type: String, trim: true, default: "general" },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["new", "read", "responded", "archived"],
      default: "new",
      index: true,
    },
    pageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
