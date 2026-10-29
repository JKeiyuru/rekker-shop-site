// shop/server/scripts/seed-petcare.js
// One-off, safe-to-re-run setup for the PetCare launch.
//
//   node scripts/seed-petcare.js
//
// What it does
//   1. Finds the PetCare brand you already created in Admin → Brands (matched by
//      slug "petcare"/"pet-care" or by name) and FILLS IN ONLY THE EMPTY FIELDS
//      (tagline, story, highlights, logo, banner…). Anything you typed is kept.
//      If it isn't there yet, it creates it.
//   2. Turns on "Spotlight on home hero" + the "New" badge for PetCare.
//   3. Creates ONE launch pop-up (banner image + "Shop this brand now") if no
//      PetCare pop-up exists yet. Edit or switch it off any time in
//      Admin → Ads & Banners → Pop-ups. It carries no discount code — add one there.
//
// The logo/banner paths below point at /images/petcare-*.jpg, which ship in the
// public folder of BOTH websites, so they work on the shop and on rekker.co.ke.
require("dotenv").config();
const mongoose = require("mongoose");
const Brand = require("../models/Brand");
const Banner = require("../models/Banner");

const PETCARE = {
  name: "PetCare",
  slug: "petcare",
  tagline: "Little Paws, Lots of Love.",
  category: "Pet Care",
  description:
    "Premium care for the pets who make life better. Thoughtfully developed pet-care products, starting with our premium pet shampoo for dogs, cats and horses.",
  story:
    "PetCare is a premium pet-care brand dedicated to making everyday pet care safer, gentler and more enjoyable. Introduced in January, the brand began with three months of research and development, followed by two months developing its first product — a premium pet shampoo that reached the market in May. The shampoo is only the beginning: PetCare is being built as a brand for all things pets, guided by quality, safety and the well-being of the animals it serves.",
  highlights: [
    "Premium pet shampoo for dogs, cats and horses",
    "Developed with pet safety and well-being in mind",
    "Quality-led, thoughtful product development",
    "A growing range of pet-care essentials",
  ],
  logoUrl: "/images/petcare-logo.jpg",
  bannerUrl: "/images/petcare-banner.jpg",
  themeColor: "#14532d",
  seoTitle: "PetCare | Premium Pet Shampoo & Pet Care — Little Paws, Lots of Love",
  seoDescription:
    "PetCare is a premium pet-care brand from Rekker. Shop PetCare pet shampoo for dogs, cats and horses, delivered across Kenya.",
};

const isEmpty = (v) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  // ── 1 + 2. Brand ──────────────────────────────────────────────────────────
  let brand =
    (await Brand.findOne({ slug: { $in: ["petcare", "pet-care"] } })) ||
    (await Brand.findOne({ name: /^pet[\s-]?care$/i }));

  if (!brand) {
    const last = await Brand.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
    brand = await Brand.create({ ...PETCARE, isActive: true, isFeatured: true, showNewBadge: true, sortOrder: (last?.sortOrder || 0) + 1 });
    console.log(`Created brand PetCare (/${brand.slug})`);
  } else {
    const fill = {};
    for (const [k, v] of Object.entries(PETCARE)) {
      if (k === "name" || k === "slug") continue;
      if (isEmpty(brand[k]) || (k === "themeColor" && brand[k] === "#000000")) fill[k] = v;
    }
    fill.isFeatured = true;
    fill.showNewBadge = true;
    await Brand.updateOne({ _id: brand._id }, { $set: fill });
    console.log(`Updated brand PetCare (/${brand.slug}) — filled: ${Object.keys(fill).join(", ")}`);
  }

  // ── 3. Launch pop-up ──────────────────────────────────────────────────────
  const existingPopup = await Banner.findOne({ placement: "popup", brandSlug: brand.slug });
  if (existingPopup) {
    console.log("PetCare pop-up already exists — left unchanged");
  } else {
    await Banner.create({
      title: "Meet PetCare",
      subtitle: "Premium shampoo for dogs, cats & horses. Little Paws, Lots of Love.",
      placement: "popup",
      badge: "NEW",
      ctaLabel: "Shop this brand now",
      linkUrl: `/products?brand=${brand.slug}`,
      imageUrl: "/images/petcare-banner.jpg",
      bgColor: "#14532d",
      textColor: "#ffffff",
      brandSlug: brand.slug,
      sites: ["shop", "corporate"],
      popupLayout: "image",
      popupDelay: 4,
      popupFrequency: "day",
      popupPages: "home",
      isActive: true,
    });
    console.log("Created the PetCare launch pop-up");
  }

  await mongoose.disconnect();
  console.log("Done");
}

run().catch((e) => {
  console.error("Seeding error:", e);
  process.exit(1);
});
