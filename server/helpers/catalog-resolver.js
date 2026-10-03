// server/helpers/catalog-resolver.js
//
// Bridges the legacy string brand/category fields on Product (kept for
// backward compatibility with the existing storefront filter/display code)
// to the relational Brand/Category collections used by the admin catalogue
// pages and brand overview pages.
//
// Brands are still created on the fly (a new brand name just works).
// Categories are NOT created on the fly any more — they are shared shelves
// managed in Admin → Categories; see resolveProductCatalogRefs below.
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

// Resolves the category for a product — INDEPENDENT of brand.
//
// Categories are shared shelves (Hair Care, Home Care & Hygiene …). We match
// what was typed/uploaded against the real category list (slug or name), then
// against the standard shelves and the old per-brand ids. If nothing fits the
// product goes to "Uncategorised" and is reported, instead of silently
// inventing a new junk category like the old behaviour did.
//
// Accepts either explicit ids (from the admin form's dropdowns) or text
// (from bulk import / old clients).
const { resolveCategoryText, ensureStandardCategories, UNCATEGORISED } = require("./catalog-taxonomy");

async function resolveProductCatalogRefs({ brand, category, subcategory, categoryId, subcategoryId, title }) {
  const brandDoc = await findOrCreateBrand(brand);
  const unplacedNotes = [];
  let catDoc = null;
  let subDoc = null;
  let productLine = "";

  // 1) Explicit ids win (admin form dropdowns)
  if (categoryId) {
    catDoc = await Category.findById(categoryId);
    if (catDoc && catDoc.parentId) {
      // someone passed a subcategory as the main category — normalise
      subDoc = catDoc;
      catDoc = await Category.findById(catDoc.parentId);
    }
  }
  if (subcategoryId) {
    const maybeSub = await Category.findById(subcategoryId);
    if (maybeSub && (!catDoc || String(maybeSub.parentId) === String(catDoc._id))) {
      subDoc = maybeSub;
      if (!catDoc && maybeSub.parentId) catDoc = await Category.findById(maybeSub.parentId);
    }
  }

  // 2) Otherwise understand the text
  if (!catDoc) {
    const text = category || subcategory || "";
    const r = await resolveCategoryText(text, { title });
    catDoc = r.category;
    subDoc = r.subcategory || null;
    productLine = r.productLine || "";
    if (r.unplaced) {
      unplacedNotes.push(text ? `"${text}"` : "(no category given)");
    }
    // A separate subcategory text can still refine within the chosen shelf
    if (catDoc && !subDoc && subcategory && subcategory !== category) {
      const sr = await resolveCategoryText(subcategory, { title });
      if (sr.subcategory && String(sr.subcategory.parentId) === String(catDoc._id)) subDoc = sr.subcategory;
      else if (sr.category && sr.category.parentId && String(sr.category.parentId) === String(catDoc._id)) subDoc = sr.category;
    }
  }

  if (!catDoc) {
    const docs = await ensureStandardCategories([UNCATEGORISED.slug]);
    catDoc = docs[UNCATEGORISED.slug];
    unplacedNotes.push("(could not determine a category)");
  }

  return {
    brandId: brandDoc ? brandDoc._id : null,
    categoryId: catDoc ? catDoc._id : null,
    subcategoryId: subDoc ? subDoc._id : null,
    categorySlug: catDoc ? catDoc.slug : "",
    subcategorySlug: subDoc ? subDoc.slug : null,
    productLine,
    unplacedNotes,
    // kept for the bulk-import report which listed "newly created" categories
    newCategoryNames: [],
  };
}

module.exports = {
  findOrCreateBrand,
  resolveProductCatalogRefs,
  slugify,
  humanize,
  normalizeBrandInput,
  LEGACY_BRAND_SLUG,
};
