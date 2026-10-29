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

    // ── Comprehensive trade application (stockist / wholesaler / distributor) ──
    requestType: { type: String, enum: ["stockist", "wholesaler", "distributor"], default: "stockist", index: true },
    source: { type: String, enum: ["shop", "corporate"], default: "shop" },
    yearsInBusiness: { type: Number, default: null, min: 0, max: 200 },
    physicalAddress: { type: String, trim: true, default: "", maxlength: 400 },
    deliveryAddress: { type: String, trim: true, default: "", maxlength: 400 },
    mapLink: { type: String, trim: true, default: "", maxlength: 400 },
    // What they want to order. Each brand's total must reach that brand's MOQ.
    items: [{
      _id: false,
      brandSlug: { type: String, trim: true, default: "" },
      brandName: { type: String, trim: true, default: "" },
      productId: { type: String, trim: true, default: "" },
      productName: { type: String, trim: true, default: "", maxlength: 200 },
      quantity: { type: Number, required: true, min: 1 },
    }],
    moqSnapshot: [{ _id: false, brandSlug: String, brandName: String, moq: Number, quantity: Number }], // MOQ at the time of the request
    orderFrequency: { type: String, enum: ["one-off", "weekly", "fortnightly", "monthly"], default: "monthly" },
    paymentPreference: { type: String, enum: ["prepay", "cash-on-delivery", "credit-request"], default: "prepay" },
    currentSuppliers: { type: String, trim: true, default: "", maxlength: 500 },
    // Distributors
    territoryCounties: [{ type: String, trim: true }],
    outletsServed: { type: Number, default: null, min: 0 },
    hasWarehouse: { type: Boolean, default: false },
    hasDeliveryVehicles: { type: Boolean, default: false },

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
