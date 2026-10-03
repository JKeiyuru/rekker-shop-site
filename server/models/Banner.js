// server/models/Banner.js
// Advertising / promotion banners shown on the storefront.
// Each banner belongs to a "placement" (a slot on the site). Admins create them
// in Admin → Ads & Banners; the storefront asks for the active ones per slot.

const mongoose = require("mongoose");

const PLACEMENTS = [
  "hero",          // big rotating carousel at the top of the home page
  "announcement",  // thin strip above the header ("Free delivery over KES 3,000")
  "tile",          // small promo tiles under the hero (3-4 across)
  "wide",          // full-width banner between home sections
  "listing",       // banner on top of the products page
];

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Banner title is required"], trim: true, maxlength: 120 },
    subtitle: { type: String, trim: true, default: "", maxlength: 240 },
    placement: { type: String, enum: PLACEMENTS, required: true, default: "hero", index: true },
    badge: { type: String, trim: true, default: "", maxlength: 30 }, // e.g. "-30%", "NEW"
    ctaLabel: { type: String, trim: true, default: "Shop now", maxlength: 40 },
    linkUrl: { type: String, trim: true, default: "/products" }, // internal path or full URL
    imageUrl: { type: String, trim: true, default: "" },         // desktop image
    mobileImageUrl: { type: String, trim: true, default: "" },   // optional tighter crop for phones
    bgColor: { type: String, trim: true, default: "#111111" },
    textColor: { type: String, trim: true, default: "#ffffff" },
    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },
    showCountdown: { type: Boolean, default: false }, // shows "ends in 2d 04h" when endsAt is set
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BannerSchema.index({ placement: 1, isActive: 1, sortOrder: 1 });

BannerSchema.statics.PLACEMENTS = PLACEMENTS;

module.exports = mongoose.model("Banner", BannerSchema);
