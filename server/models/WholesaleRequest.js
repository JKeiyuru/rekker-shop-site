// server/models/WholesaleRequest.js
// A trade / wholesale enquiry from a retailer, salon, institution, etc.
// Saved so the admin team can work through them from the dashboard.

const mongoose = require("mongoose");

const WholesaleRequestSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true, maxlength: 200 },
    contactName: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    phone: { type: String, required: true, trim: true, maxlength: 60 },
    businessType: {
      type: String,
      enum: ["supermarket", "retail-shop", "wholesaler", "salon-barber", "pharmacy", "institution", "online-seller", "other"],
      default: "retail-shop",
    },
    county: { type: String, trim: true, default: "", maxlength: 80 },
    town: { type: String, trim: true, default: "", maxlength: 120 },
    kraPin: { type: String, trim: true, default: "", maxlength: 30 },
    brandsInterested: [{ type: String, trim: true }],
    productsInterested: { type: String, trim: true, default: "", maxlength: 1500 },
    estimatedMonthlyOrder: {
      type: String,
      enum: ["under-50k", "50k-200k", "200k-500k", "above-500k", "not-sure"],
      default: "not-sure",
    },
    message: { type: String, trim: true, default: "", maxlength: 4000 },

    // Admin workflow
    status: {
      type: String,
      enum: ["new", "contacted", "quoted", "approved", "declined", "archived"],
      default: "new",
      index: true,
    },
    adminNotes: { type: String, trim: true, default: "", maxlength: 4000 },
    pageUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

WholesaleRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WholesaleRequest", WholesaleRequestSchema);
