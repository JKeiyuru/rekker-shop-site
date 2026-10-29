// client/src/lib/brand-utils.js
// Helpers for brands that come from Admin → Brands.
//
// Admin-created brands are matched to pages by a "loose key" (lower-case,
// letters and digits only) so "PetCare", "pet-care" and "Pet Care" are all the
// same brand — whichever way it was typed in the admin console.

export const normKey = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Brands that already have their own hand-written section on the brands page.
const ALIASES = { saffron: "saffronmilan" };
const canon = (k) => ALIASES[k] || k;
export const KNOWN_BRAND_KEYS = ["saffronmilan", "biosaff", "cornells"];

export function findBrand(brands = [], key) {
  const k = canon(normKey(key));
  return brands.find((b) => canon(normKey(b.slug)) === k || canon(normKey(b.name)) === k) || null;
}

export const isKnownBrand = (b) => KNOWN_BRAND_KEYS.includes(canon(normKey(b.slug))) || KNOWN_BRAND_KEYS.includes(canon(normKey(b.name)));

// Where "Shop <brand>" goes: the products page with that brand's filter applied
export const productsPath = (brand) => `/products?brand=${encodeURIComponent(brand?.slug || "")}`;

// Featured brands first, then the admin's own sort order
export const sortBrands = (list = []) =>
  [...list].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || String(a.name).localeCompare(String(b.name)));

// A page link that scrolls to a brand on the brands page: /brands#petcare
export const anchorId = (key) => canon(normKey(key));
export const brandAnchor = (brand) => anchorId(brand?.slug || brand?.name);

// The brand's own page. Saffron Milan's page has always lived at /brands/saffron
// (App.jsx also redirects /brands/saffron-milan there), everything else is /brands/<slug>.
export const brandPagePath = (brand) => (canon(normKey(brand?.slug)) === "saffronmilan" ? "/brands/saffron" : `/brands/${brand?.slug}`);
