// server/helpers/catalog-resolver.js
//
// Bridges the legacy string brand/category fields on Product (kept for
// backward compatibility with the existing storefront filter/display code)
// to the relational Brand/Category collections used by the admin catalogue
// pages and brand overview pages.
//
// The core rule: this NEVER rejects an unrecognized category. If a brand or
// category doesn't exist yet, it's created on the fly and linked up —
// that's what lets bulk import (or the admin form) introduce a brand-new
// category without needing anyone to pre-create it first.
const Brand = require("../models/Brand");
const Category = require("../models/Category");

// Legacy Product.brand string -> the slug actually used in the seeded Brand
// collection (server/scripts/seed-brands.js). These don't match 1:1
// ("biosaff" vs "bio-saff", "saffron" vs "saffron-milan") so this mapping
// has to be explicit rather than derived.
const LEGACY_BRAND_SLUG = {
  rekker: "rekker",
  saffron: "saffron-milan",
  cornells: "cornells",
  biosaff: "bio-saff",
};

const LEGACY_BRAND_NAME = {
  rekker: "Rekker",
  saffron: "Saffron Milan",
  cornells: "Cornells",
  biosaff: "Bio Saff",
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Common ways someone might type a brand that already has a canonical short
// code elsewhere in the app (static filters, category lists, admin banners)
// — these collapse to that short code so a sheet using "Saffron Milan" or
// "saffron-milan" lines up with existing "saffron" products instead of
// silently forking into a second, disconnected brand bucket. Anything NOT
// in this table is treated as a genuinely new brand and used as-is.
const BRAND_ALIASES = {
  "saffron-milan": "saffron",
  "saffron milan": "saffron",
  "bio-saff": "biosaff",
  "bio saff": "biosaff",
};

// Normalizes any brand input (from the admin form or a bulk-import sheet)
// to the canonical string stored on Product.brand.
function normalizeBrandInput(rawBrand) {
  const cleaned = String(rawBrand || "").toLowerCase().trim();
  if (!cleaned) return "";
  if (BRAND_ALIASES[cleaned]) return BRAND_ALIASES[cleaned];
  // Also check the hyphen-collapsed form, in case of stray spacing/casing
  const collapsed = cleaned.replace(/\s+/g, "-");
  if (BRAND_ALIASES[collapsed]) return BRAND_ALIASES[collapsed];
  return collapsed;
}

// "hair-mousse" -> "Hair Mousse", "Saffron Milan" -> "Saffron Milan"
function humanize(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Finds (or creates) the relational Brand doc for a legacy brand string.
async function findOrCreateBrand(legacyBrand) {
  const normalized = normalizeBrandInput(legacyBrand);
  const slug = LEGACY_BRAND_SLUG[normalized] || slugify(normalized);
  if (!slug) return null;

  let brand = await Brand.findOne({ slug });
  if (brand) return brand;

  try {
    return await Brand.create({
      name: LEGACY_BRAND_NAME[normalized] || humanize(normalized),
      slug,
      isActive: true,
    });
  } catch (err) {
    if (err.code === 11000) {
      // Another request created it in the split second between find and
      // create — just use that one.
      return Brand.findOne({ slug });
    }
    throw err;
  }
}

// Finds (or creates) a Category doc for a brand + name (+ optional parent
// for subcategories), auto-linking it to the brand. Returns
// { doc, created } so callers can report when a brand-new category was
// introduced (e.g. during a bulk import).
async function findOrCreateCategory({ brand, rawValue, parentId = null }) {
  if (!rawValue) return { doc: null, created: false };
  const brandDoc = await findOrCreateBrand(brand);
  if (!brandDoc) return { doc: null, created: false };

  const baseSlug = slugify(rawValue);
  if (!baseSlug) return { doc: null, created: false };
  const displayName = humanize(rawValue);

  // Prefer an existing category already linked to this brand (same parent
  // level) with a matching slug or name — this is the common case for every
  // import after the first one.
  const existing = await Category.findOne({
    brandIds: brandDoc._id,
    parentId: parentId || null,
    $or: [{ slug: baseSlug }, { name: new RegExp(`^${displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }],
  });
  if (existing) return { doc: existing, created: false };

  // Category.slug is globally unique, but the same category name can
  // legitimately exist under different brands (e.g. "Shampoo" for both
  // Saffron Milan and Cornells) — so if the plain slug is already taken by
  // a different brand's category, namespace it with the brand's slug
  // instead of failing the import.
  const attempts = [baseSlug, `${brandDoc.slug}-${baseSlug}`];
  let lastError = null;
  for (const candidateSlug of attempts) {
    try {
      const created = await Category.create({
        name: displayName,
        slug: candidateSlug,
        parentId: parentId || null,
        brandIds: [brandDoc._id],
        isActive: true,
      });
      return { doc: created, created: true };
    } catch (err) {
      if (err.code !== 11000) throw err;
      lastError = err;
      // Someone may have created this exact slug in the meantime — check
      // before falling through to the namespaced retry.
      const raceWinner = await Category.findOne({ slug: candidateSlug });
      if (raceWinner && raceWinner.brandIds.some((id) => String(id) === String(brandDoc._id))) {
        return { doc: raceWinner, created: false };
      }
    }
  }
  throw lastError || new Error(`Could not create category "${rawValue}"`);
}

// Convenience wrapper: resolve brandId/categoryId/subcategoryId together for
// one product row. Never throws for an unrecognized category/subcategory —
// only throws for genuine DB errors. `newCategoryNames` collects a
// human-readable label for every category/subcategory that was newly
// created by this call, so callers (e.g. bulk import) can report it.
async function resolveProductCatalogRefs({ brand, category, subcategory }) {
  const brandDoc = await findOrCreateBrand(brand);
  const newCategoryNames = [];

  let categoryResult = { doc: null, created: false };
  if (category) {
    categoryResult = await findOrCreateCategory({ brand, rawValue: category });
    if (categoryResult.created) {
      newCategoryNames.push(`${categoryResult.doc.name} (${LEGACY_BRAND_NAME[brand] || brand})`);
    }
  }

  let subcategoryResult = { doc: null, created: false };
  if (subcategory) {
    subcategoryResult = await findOrCreateCategory({
      brand,
      rawValue: subcategory,
      parentId: categoryResult.doc ? categoryResult.doc._id : null,
    });
    if (subcategoryResult.created) {
      newCategoryNames.push(
        `${subcategoryResult.doc.name} (under ${categoryResult.doc?.name || "—"}, ${LEGACY_BRAND_NAME[brand] || brand})`
      );
    }
  }

  return {
    brandId: brandDoc ? brandDoc._id : null,
    categoryId: categoryResult.doc ? categoryResult.doc._id : null,
    subcategoryId: subcategoryResult.doc ? subcategoryResult.doc._id : null,
    newCategoryNames,
  };
}

module.exports = {
  findOrCreateBrand,
  findOrCreateCategory,
  resolveProductCatalogRefs,
  slugify,
  humanize,
  normalizeBrandInput,
  LEGACY_BRAND_SLUG,
};
