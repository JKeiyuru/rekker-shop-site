// shop/server/scripts/seed-brands.js
// Seeds the three initial brands: Saffron Milan, Bio Saff, Cornells.
// Usage: node scripts/seed-brands.js
require("dotenv").config();
const mongoose = require("mongoose");
const Brand = require("../models/Brand");

const brands = [
  {
    name: "Saffron Milan",
    slug: "saffron-milan",
    tagline: "Home & Cleaning, Milano Style",
    description: "Premium home and cleaning products.",
    story: "Saffron Milan brings European-inspired home care to Kenyan households.",
    themeColor: "#0f766e",
    seoTitle: "Saffron Milan | Home & Cleaning",
    seoDescription: "Shop Saffron Milan home & cleaning products.",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Bio Saff",
    slug: "bio-saff",
    tagline: "Beauty & Personal Care, Naturally",
    description: "Beauty and personal care products for everyday routines.",
    story: "Bio Saff blends natural ingredients with modern skincare science.",
    themeColor: "#be185d",
    seoTitle: "Bio Saff | Beauty & Personal Care",
    seoDescription: "Shop Bio Saff beauty & personal care products.",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Cornells",
    slug: "cornells",
    tagline: "Fragrance for Every Story",
    description: "Fragrance and body care products.",
    story: "Cornells is a globally loved fragrance and body care brand.",
    themeColor: "#7c3aed",
    seoTitle: "Cornells | Fragrance",
    seoDescription: "Shop Cornells fragrance products.",
    isActive: true,
    sortOrder: 3,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected for seeding");

    for (const brandData of brands) {
      const existing = await Brand.findOne({ slug: brandData.slug });
      if (existing) {
        await Brand.updateOne({ slug: brandData.slug }, brandData);
        console.log(`Updated brand: ${brandData.name}`);
      } else {
        await Brand.create(brandData);
        console.log(`Created brand: ${brandData.name}`);
      }
    }

    console.log("Seeding complete");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
