// server/helpers/catalog-taxonomy.js
//
// The single source of truth for Rekker's shop categories.
//
// WHY THIS EXISTS
// Categories used to be tied to brands and mixed with product ranges:
// "Super Foods", "Dark & Beautiful", "Bold & Beautiful" and "Cute & Pretty"
// are Cornells *ranges*, not categories, and "Shampoo" existed four times
// (once per range). Shoppers think in shelves — Hair Care, Body Care, Home
// Care — exactly like Carrefour. This file defines those shelves, maps every
// old category/subcategory onto them, and can migrate the live database.
//
// RULES
//  - Two levels only: main category -> subcategory.
//  - Categories are independent of brands. Brand is its own filter.
//  - Old ranges (Super Foods etc.) are preserved on Product.productLine.

const Category = require("../models/Category");
const Product = require("../models/Product");
const Brand = require("../models/Brand");

// ── The standard shelves ────────────────────────────────────────────────────
const TAXONOMY = [
  {
    name: "Hair Care", slug: "hair-care", showOnHome: true,
    description: "Shampoos, conditioners, treatments and styling for every hair type.",
    children: [
      { name: "Shampoo", slug: "shampoo" },
      { name: "Conditioner & Leave-In", slug: "conditioners" },
      { name: "Hair Treatments & Masks", slug: "hair-treatments" },
      { name: "Styling, Mousse & Edge Care", slug: "hair-styling" },
      { name: "Hair Oils, Serums & Mists", slug: "hair-oils-serums" },
    ],
  },
  {
    name: "Body Care", slug: "body-care", showOnHome: true,
    description: "Lotions, butters, shower gels and fragrance for soft, fresh skin.",
    children: [
      { name: "Body Lotions & Creams", slug: "body-lotions-creams" },
      { name: "Body Butter & Oils", slug: "body-butter-oils" },
      { name: "Shower Gels & Scrubs", slug: "shower-gels-scrubs" },
      { name: "Deodorants & Anti-Perspirants", slug: "deodorants" },
      { name: "Body Mists & Fragrance", slug: "body-mists-fragrance" },
    ],
  },
  {
    name: "Face & Skin Care", slug: "face-skin-care", showOnHome: true,
    description: "Cleansers, moisturisers, masks and serums for healthy-looking skin.",
    children: [
      { name: "Face Wash & Cleansers", slug: "face-wash" },
      { name: "Face Moisturisers & Creams", slug: "face-moisturizers" },
      { name: "Face Masks & Scrubs", slug: "face-masks-scrubs" },
      { name: "Face Serums & Treatments", slug: "face-serums" },
    ],
  },
  {
    name: "Baby & Kids", slug: "baby-kids", showOnHome: true,
    description: "Gentle care for babies and children.",
    children: [
      { name: "Baby Wash & Shampoo", slug: "baby-wash-shampoo" },
      { name: "Baby Lotions, Oils & Creams", slug: "baby-lotions-creams" },
      { name: "Nappy Rash Care", slug: "nappy-rash-care" },
      { name: "Kids Hair Care", slug: "kids-hair-care" },
    ],
  },
  {
    name: "Home Care & Hygiene", slug: "home-care-hygiene", showOnHome: true,
    description: "Cleaners, detergents and hand wash that keep your home fresh.",
    children: [
      { name: "Hand Wash", slug: "hand-wash" },
      { name: "Dishwashing Liquid", slug: "dishwashing" },
      { name: "Laundry Detergent", slug: "laundry-detergent" },
      { name: "Toilet & Bathroom Cleaners", slug: "toilet-bathroom-cleaners" },
    ],
  },
  {
    name: "Men's Care", slug: "mens-care",
    description: "Shaving and grooming essentials.",
    children: [{ name: "After-Shave", slug: "aftershave" }],
  },
  { name: "Gift Sets", slug: "gift-sets", showOnHome: true, description: "Ready-to-gift sets.", children: [] },
  { name: "Stationery & School", slug: "stationery", description: "Everything for school and office.", children: [] },
  {
    name: "Toys & Games", slug: "toys-games",
    description: "Toys, games and learning fun.",
    children: [
      { name: "Soft Toys & Teddy Bears", slug: "soft-toys" },
      { name: "Educational Toys", slug: "educational-toys" },
    ],
  },
  { name: "Kitchen & Dining", slug: "kitchenware", description: "Kitchenware for everyday cooking and serving.", children: [] },
  { name: "Bags & Luggage", slug: "bags-luggage", description: "Bags, backpacks and suitcases.", children: [] },
  {
    name: "Hardware & Security", slug: "hardware-security",
    description: "Padlocks and security hardware.",
    children: [{ name: "Padlocks", slug: "padlocks" }],
  },
  { name: "Party & Celebration", slug: "party-items", description: "Party supplies and decorations.", children: [] },
];

// Holding shelf for anything we couldn't place. Hidden from shoppers' filter
// unless products are sitting in it; admins are nudged to re-home them.
const UNCATEGORISED = { name: "Uncategorised", slug: "uncategorised" };

// ── Legacy mapping ──────────────────────────────────────────────────────────
// [oldCategorySlug] -> { to: "newCategorySlug", sub?: "newSubSlug", line?: "Range name",
//                        subs?: { oldSubSlug: "newSubSlug" | { to, sub } } }
const LEGACY_TOP = {
  // Rekker
  "stationery": { to: "stationery" },
  "bags-suitcases": { to: "bags-luggage" },
  "toys": { to: "toys-games" },
  "kitchenware": { to: "kitchenware" },
  "padlocks": { to: "hardware-security", sub: "padlocks" },
  "stuffed-toys": { to: "toys-games", sub: "soft-toys" },
  "party-items": { to: "party-items" },
  "educational": { to: "toys-games", sub: "educational-toys" },

  // Saffron Milan
  "home-care-hygiene": {
    to: "home-care-hygiene",
    subs: {
      "home-care-hygiene-handwash": "hand-wash",
      "home-care-hygiene-dishwashing": "dishwashing",
      "home-care-hygiene-detergent": "laundry-detergent",
    },
  },
  "beauty-body-care": {
    to: "body-care",
    subs: {
      "beauty-body-care-shower-gel": "shower-gels-scrubs",
      "beauty-body-care-aftershave": { to: "mens-care", sub: "aftershave" },
    },
  },

  // Bio Saff
  "hair-mousse": { to: "hair-care", sub: "hair-styling" },
  "braid-edge-care": { to: "hair-care", sub: "hair-styling" },
  "shampoos-treatments": { to: "hair-care", sub: "shampoo" },
  "body-mists": { to: "body-care", sub: "body-mists-fragrance" },
  "hair-mists": { to: "hair-care", sub: "hair-oils-serums" },
  "curl-activator": { to: "hair-care", sub: "hair-styling" },
  "leave-in-conditioners": { to: "hair-care", sub: "conditioners" },

  // Cornells ranges — these become productLine, the subcategory suffix decides the shelf
  "super-foods": { to: null, line: "Super Foods", prefix: "super-foods-" },
  "dark-beautiful": { to: null, line: "Dark & Beautiful", prefix: "dark-beautiful-" },
  "bold-beautiful": { to: null, line: "Bold & Beautiful", prefix: "bold-beautiful-" },
  "cute-pretty": { to: null, line: "Cute & Pretty", prefix: "cute-pretty-" },
};

// Cornells range subcategory suffix -> new shelf
const RANGE_SUFFIX = {
  "shampoo": { to: "hair-care", sub: "shampoo" },
  "conditioner": { to: "hair-care", sub: "conditioners" },
  "hair-mask": { to: "hair-care", sub: "hair-treatments" },
  "hair-treatments": { to: "hair-care", sub: "hair-treatments" },
  "hair-serum": { to: "hair-care", sub: "hair-oils-serums" },
  "oils-serums": { to: "hair-care", sub: "hair-oils-serums" },
  "styling-products": { to: "hair-care", sub: "hair-styling" },
  "kids-hair-care": { to: "baby-kids", sub: "kids-hair-care" },
  "kids-shampoo": { to: "baby-kids", sub: "kids-hair-care" },
  "kids-conditioner": { to: "baby-kids", sub: "kids-hair-care" },
  "kids-styling": { to: "baby-kids", sub: "kids-hair-care" },
  "kids-treatments": { to: "baby-kids", sub: "kids-hair-care" },
  "shower-gel": { to: "body-care", sub: "shower-gels-scrubs" },
  "shower-scrub": { to: "body-care", sub: "shower-gels-scrubs" },
  "body-scrub": { to: "body-care", sub: "shower-gels-scrubs" },
  "sugar-scrub": { to: "body-care", sub: "shower-gels-scrubs" },
  "body-lotion": { to: "body-care", sub: "body-lotions-creams" },
  "body-cream": { to: "body-care", sub: "body-lotions-creams" },
  "hand-body-lotion": { to: "body-care", sub: "body-lotions-creams" },
  "moisturizer": { to: "body-care", sub: "body-lotions-creams" },
  "body-butter": { to: "body-care", sub: "body-butter-oils" },
  "body-oil": { to: "body-care", sub: "body-butter-oils" },
  "deodorant": { to: "body-care", sub: "deodorants" },
  "facial-scrub": { to: "face-skin-care", sub: "face-masks-scrubs" },
  "facial-mask": { to: "face-skin-care", sub: "face-masks-scrubs" },
  "face-wash": { to: "face-skin-care", sub: "face-wash" },
  "facial-cream": { to: "face-skin-care", sub: "face-moisturizers" },
  "day-night-cream": { to: "face-skin-care", sub: "face-moisturizers" },
  "facial-care": { to: "face-skin-care", sub: "face-moisturizers" },
  "serums": { to: "face-skin-care", sub: "face-serums" },
  "baby-care": { to: "baby-kids" },
  "baby-wash-shampoo": { to: "baby-kids", sub: "baby-wash-shampoo" },
  "baby-lotion": { to: "baby-kids", sub: "baby-lotions-creams" },
  "baby-oil": { to: "baby-kids", sub: "baby-lotions-creams" },
  "baby-cream": { to: "baby-kids", sub: "baby-lotions-creams" },
  "nappy-rash-cream": { to: "baby-kids", sub: "nappy-rash-care" },
  "gift-sets": { to: "gift-sets" },
};

// Last-resort guess from the product title (only used when the old category
// is unknown, e.g. a one-off category created during a bulk import).
const TITLE_RULES = [
  [/toilet|bathroom cleaner|thick bleach|disinfect/i, "home-care-hygiene", "toilet-bathroom-cleaners"],
  [/hand ?wash|hand soap|sanitis|sanitiz/i, "home-care-hygiene", "hand-wash"],
  [/dish ?wash|dishwashing/i, "home-care-hygiene", "dishwashing"],
  [/detergent|laundry|fabric soft/i, "home-care-hygiene", "laundry-detergent"],
  [/baby|nappy|diaper/i, "baby-kids", null],
  [/after ?shave/i, "mens-care", "aftershave"],
  [/shampoo/i, "hair-care", "shampoo"],
  [/conditioner|leave-?in/i, "hair-care", "conditioners"],
  [/edge control|mousse|pomade|gel\b|curl|braid|styling/i, "hair-care", "hair-styling"],
  [/hair (oil|serum|mist)/i, "hair-care", "hair-oils-serums"],
  [/hair/i, "hair-care", null],
  [/shower|scrub/i, "body-care", "shower-gels-scrubs"],
  [/roll-?on|deodorant|anti-?perspirant/i, "body-care", "deodorants"],
  [/body (lotion|cream)/i, "body-care", "body-lotions-creams"],
  [/body butter|body oil/i, "body-care", "body-butter-oils"],
  [/mist|perfume|fragrance|cologne/i, "body-care", "body-mists-fragrance"],
  [/face|facial/i, "face-skin-care", null],
  [/lotion|cream|moisturi/i, "body-care", "body-lotions-creams"],
  [/gift ?set|gift pack/i, "gift-sets", null],
  [/teddy|plush|stuffed/i, "toys-games", "soft-toys"],
  [/padlock/i, "hardware-security", "padlocks"],
  [/toy|game|puzzle/i, "toys-games", null],
  [/notebook|pen\b|pencil|stationery|exercise book/i, "stationery", null],
  [/bag|suitcase|backpack|luggage/i, "bags-luggage", null],
  [/party|balloon/i, "party-items", null],
  [/cup|plate|pot|pan|kitchen|spoon|bottle|container/i, "kitchenware", null],
];

const norm = (v) => String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Public: figure out where a product (or free-text category) belongs.
// Returns { categorySlug, subSlug|null, productLine|"", matchedBy }
function mapCore({ category, subcategory, title } = {}) {
  const cat = norm(category);
  const sub = norm(subcategory);

  // 0) Old subcategory ids that redirect to a different shelf (checked first,
  //    because "home-care-hygiene" is both an old and a new category slug)
  const legacyEarly = LEGACY_TOP[cat];
  if (legacyEarly && legacyEarly.subs && sub && legacyEarly.subs[sub]) {
    const t = legacyEarly.subs[sub];
    if (typeof t === "string") return { categorySlug: legacyEarly.to, subSlug: t, productLine: "", matchedBy: "legacy-sub" };
    return { categorySlug: t.to, subSlug: t.sub || null, productLine: "", matchedBy: "legacy-sub" };
  }

  // 1) Already a standard slug (new data, or re-running the tool)
  const std = findStandard(cat) || findStandard(sub);
  if (std) {
    return { categorySlug: std.top, subSlug: std.sub, productLine: "", matchedBy: "standard" };
  }

  // 2) Known legacy category
  const legacy = LEGACY_TOP[cat];
  if (legacy) {
    // Cornells ranges: decide by subcategory suffix
    if (legacy.prefix) {
      const suffix = sub.startsWith(legacy.prefix) ? sub.slice(legacy.prefix.length) : sub;
      const target = RANGE_SUFFIX[suffix];
      if (target) {
        return { categorySlug: target.to, subSlug: target.sub || null, productLine: legacy.line, matchedBy: "legacy-range" };
      }
      // range with no recognisable subcategory — fall through to title guess, keep the range name
      const guess = guessFromTitle(title);
      if (guess) return { ...guess, productLine: legacy.line, matchedBy: "legacy-range+title" };
      return { categorySlug: UNCATEGORISED.slug, subSlug: null, productLine: legacy.line, matchedBy: "legacy-range-unplaced" };
    }
    // Saffron-style: the subcategory may redirect to a different shelf
    if (legacy.subs && sub && legacy.subs[sub]) {
      const t = legacy.subs[sub];
      if (typeof t === "string") return { categorySlug: legacy.to, subSlug: t, productLine: "", matchedBy: "legacy-sub" };
      return { categorySlug: t.to, subSlug: t.sub || null, productLine: "", matchedBy: "legacy-sub" };
    }
    return { categorySlug: legacy.to, subSlug: legacy.sub || null, productLine: legacy.line || "", matchedBy: "legacy" };
  }

  // 3) Subcategory-only hints, then a guess from the title
  if (sub && LEGACY_TOP[sub]) return mapCore({ category: sub, title });
  const guess = guessFromTitle(title);
  if (guess) return { ...guess, productLine: "", matchedBy: "title-guess" };

  return { categorySlug: UNCATEGORISED.slug, subSlug: null, productLine: "", matchedBy: "unplaced" };
}

// Wrapper: if the shelf is right but no subcategory was known, try to pick the
// subcategory from the title (e.g. a "Home Care & Hygiene" toilet cleaner).
function mapToStandard(input = {}) {
  const m = mapCore(input);
  if (!m.subSlug && m.categorySlug !== UNCATEGORISED.slug) {
    const top = TAXONOMY.find((t) => t.slug === m.categorySlug);
    if (top && top.children.length) {
      const guess = guessFromTitle(input.title);
      if (guess && guess.categorySlug === m.categorySlug && guess.subSlug) {
        return { ...m, subSlug: guess.subSlug, matchedBy: m.matchedBy + "+title" };
      }
    }
  }
  return m;
}

function guessFromTitle(title) {
  if (!title) return null;
  for (const [re, top, sub] of TITLE_RULES) {
    if (re.test(title)) return { categorySlug: top, subSlug: sub };
  }
  return null;
}

// Look a slug up in the standard taxonomy → { top, sub }
function findStandard(slug) {
  if (!slug) return null;
  // matches the slug ("hair-care") OR the display name typed by a person
  // ("Hair Care", "Hair Oils, Serums & Mists") — both normalise the same way
  for (const top of TAXONOMY) {
    if (top.slug === slug || norm(top.name) === slug) return { top: top.slug, sub: null };
    for (const child of top.children) {
      if (child.slug === slug || norm(child.name) === slug) return { top: top.slug, sub: child.slug };
    }
  }
  if (slug === UNCATEGORISED.slug) return { top: UNCATEGORISED.slug, sub: null };
  return null;
}

// Try to understand free text typed by a person or found in a spreadsheet:
// matches slug, then exact name, against the live Category collection first
// (so admin-created categories work), then the standard/legacy tables.
async function resolveCategoryText(text, { title } = {}) {
  const slug = norm(text);
  if (slug) {
    const live = await Category.findOne({ isActive: true, source: { $ne: "legacy" }, $or: [{ slug }, { name: new RegExp(`^${escapeRegExp(String(text).trim())}$`, "i") }] });
    if (live) {
      if (live.parentId) {
        const parent = await Category.findById(live.parentId);
        return { category: parent, subcategory: live, productLine: "", matchedBy: "live" };
      }
      return { category: live, subcategory: null, productLine: "", matchedBy: "live" };
    }
  }
  const mapped = mapToStandard({ category: text, title });
  const docs = await ensureStandardCategories([mapped.categorySlug, mapped.subSlug].filter(Boolean));
  return {
    category: docs[mapped.categorySlug] || null,
    subcategory: mapped.subSlug ? docs[mapped.subSlug] || null : null,
    productLine: mapped.productLine,
    matchedBy: mapped.matchedBy,
    unplaced: mapped.categorySlug === UNCATEGORISED.slug,
  };
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Creating the standard categories (only the missing ones) ────────────────
// Never overwrites anything an admin has edited, and never re-creates a
// category the admin deliberately deleted unless something needs it right now.
async function ensureStandardCategories(slugs) {
  const wanted = new Set(slugs);
  const result = {};
  let sort = 0;

  const upsertOne = async (def, parentId, order) => {
    let doc = await Category.findOne({ slug: def.slug });
    if (doc) {
      // A previously-hidden legacy doc with the same slug is revived as standard
      if (doc.source === "legacy" || doc.source === undefined) {
        doc.source = "standard";
        doc.isActive = true;
        if (parentId !== undefined) doc.parentId = parentId;
        await doc.save();
      }
      return doc;
    }
    try {
      return await Category.create({
        name: def.name,
        slug: def.slug,
        parentId: parentId || null,
        description: def.description || "",
        showOnHome: !!def.showOnHome,
        sortOrder: order,
        source: "standard",
        isActive: true,
        seoTitle: `${def.name} — Shop Online in Kenya | Rekker`,
        seoDescription: def.description
          ? `${def.description} Shop ${def.name} online at Rekker with M-Pesa and card checkout, delivered across Kenya.`
          : `Shop ${def.name} online at Rekker with M-Pesa and card checkout, delivered across Kenya.`,
      });
    } catch (err) {
      if (err.code === 11000) return Category.findOne({ slug: def.slug });
      throw err;
    }
  };

  for (const top of TAXONOMY) {
    sort += 10;
    const needTop = wanted.has(top.slug) || top.children.some((c) => wanted.has(c.slug));
    if (!needTop) continue;
    const topDoc = await upsertOne(top, null, sort);
    result[top.slug] = topDoc;
    let childSort = 0;
    for (const child of top.children) {
      childSort += 10;
      if (!wanted.has(child.slug)) continue;
      result[child.slug] = await upsertOne(child, topDoc._id, childSort);
    }
  }

  if (wanted.has(UNCATEGORISED.slug)) {
    let doc = await Category.findOne({ slug: UNCATEGORISED.slug });
    if (!doc) {
      doc = await Category.create({
        name: UNCATEGORISED.name,
        slug: UNCATEGORISED.slug,
        description: "Products waiting to be placed on the right shelf.",
        sortOrder: 9999,
        source: "standard",
        isSystem: true,
        isActive: true,
      });
    } else if (!doc.isSystem || doc.source !== "standard") {
      doc.isSystem = true; doc.source = "standard"; doc.isActive = true;
      await doc.save();
    }
    result[UNCATEGORISED.slug] = doc;
  }

  return result;
}

async function ensureAllStandardCategories() {
  const all = [UNCATEGORISED.slug];
  TAXONOMY.forEach((t) => { all.push(t.slug); t.children.forEach((c) => all.push(c.slug)); });
  return ensureStandardCategories(all);
}

// ── Migration ───────────────────────────────────────────────────────────────
// dryRun = true  -> only reports what WOULD change (safe preview)
// dryRun = false -> applies it
//
// What it does:
//  1. Creates any missing standard categories.
//  2. Re-homes every product onto the right shelf (categoryId/subcategoryId
//     plus the text category/subcategory used by old links), and keeps the
//     old Cornells range in Product.productLine.
//  3. Links products to their Brand document (brandId) where it was missing.
//  4. Hides old per-brand categories (source: legacy, inactive). They are not
//     deleted, so nothing is lost; admins can delete the empty ones in one click.
async function migrateCatalog({ dryRun = true } = {}) {
  const report = {
    dryRun,
    totalProducts: 0,
    productsMoved: 0,
    productsAlreadyCorrect: 0,
    brandLinksFixed: 0,
    unplaced: [],
    moves: {},          // "Old → New" -> count
    newCategories: [],  // names that would be/were created
    legacyCategoriesHidden: 0,
    sample: [],
  };

  // 1) Standard categories
  const needed = new Set([UNCATEGORISED.slug]);
  const products = await Product.find({}).select("title brand brandId category subcategory categoryId subcategoryId productLine").lean();
  report.totalProducts = products.length;

  const plans = [];
  for (const p of products) {
    const m = mapToStandard({ category: p.category, subcategory: p.subcategory, title: p.title });
    plans.push({ p, m });
    needed.add(m.categorySlug);
    if (m.subSlug) needed.add(m.subSlug);
  }

  const existingStd = await Category.find({ slug: { $in: [...needed] }, source: "standard" }).select("slug").lean();
  const existingSlugs = new Set(existingStd.map((c) => c.slug));
  [...needed].forEach((slug) => {
    if (!existingSlugs.has(slug)) report.newCategories.push(slug);
  });

  let docs = {};
  if (!dryRun) {
    docs = await ensureStandardCategories([...needed]);
  } else {
    const live = await Category.find({ slug: { $in: [...needed] } });
    live.forEach((d) => { docs[d.slug] = d; });
  }

  const nameFor = (slug) => {
    const std = findStandard(slug);
    if (!std) return slug;
    const top = TAXONOMY.find((t) => t.slug === std.top);
    if (std.top === UNCATEGORISED.slug) return UNCATEGORISED.name;
    if (std.sub) return `${top.name} › ${top.children.find((c) => c.slug === std.sub).name}`;
    return top.name;
  };

  // 2) Re-home products
  const bulkOps = [];
  for (const { p, m } of plans) {
    const targetTop = docs[m.categorySlug];
    const targetSub = m.subSlug ? docs[m.subSlug] : null;
    const sameCat = targetTop && p.categoryId && String(p.categoryId) === String(targetTop._id);
    const sameSub = (targetSub ? p.subcategoryId && String(p.subcategoryId) === String(targetSub._id) : !p.subcategoryId);
    const sameText = p.category === m.categorySlug && (p.subcategory || null) === (m.subSlug || null);
    const sameLine = !m.productLine || p.productLine === m.productLine;

    if (sameCat && sameSub && sameText && sameLine) {
      report.productsAlreadyCorrect += 1;
    } else {
      report.productsMoved += 1;
      const key = `${p.category || "—"}${p.subcategory ? " / " + p.subcategory : ""}  →  ${nameFor(m.subSlug || m.categorySlug)}`;
      report.moves[key] = (report.moves[key] || 0) + 1;
      if (report.sample.length < 8) report.sample.push({ title: p.title, from: key.split("  →  ")[0], to: nameFor(m.subSlug || m.categorySlug) });
      if (m.categorySlug === UNCATEGORISED.slug) report.unplaced.push(p.title);

      if (!dryRun && targetTop) {
        const set = {
          category: m.categorySlug,
          subcategory: m.subSlug || null,
          categoryId: targetTop._id,
          subcategoryId: targetSub ? targetSub._id : null,
        };
        if (m.productLine) set.productLine = m.productLine;
        bulkOps.push({ updateOne: { filter: { _id: p._id }, update: { $set: set } } });
      }
    }
  }
  if (!dryRun && bulkOps.length) await Product.bulkWrite(bulkOps);

  // 3) Brand links
  const brandsBySlug = {};
  (await Brand.find({})).forEach((b) => { brandsBySlug[b.slug] = b; });
  const { findOrCreateBrand } = require("./catalog-resolver");
  const brandOps = [];
  for (const p of products) {
    if (p.brandId) continue;
    report.brandLinksFixed += 1;
    if (!dryRun) {
      const b = await findOrCreateBrand(p.brand);
      if (b) brandOps.push({ updateOne: { filter: { _id: p._id }, update: { $set: { brandId: b._id } } } });
    }
  }
  if (!dryRun && brandOps.length) await Product.bulkWrite(brandOps);

  // 4) Hide old categories
  const legacyFilter = {
    $or: [{ source: { $exists: false } }, { source: "legacy" }, { source: null }],
  };
  const legacyDocs = await Category.find(legacyFilter).select("_id slug source isActive").lean();
  report.legacyCategoriesHidden = legacyDocs.length;
  if (!dryRun && legacyDocs.length) {
    await Category.updateMany(
      { _id: { $in: legacyDocs.map((d) => d._id) } },
      { $set: { source: "legacy", isActive: false, showOnHome: false } }
    );
  }

  report.unplaced = report.unplaced.slice(0, 50);
  return report;
}

// Does the live database still contain old-style categories / unlinked products?
async function needsTidyUp() {
  const [legacyActive, unlinkedProducts] = await Promise.all([
    Category.countDocuments({ $or: [{ source: { $exists: false } }, { source: null }] }),
    Product.countDocuments({ $or: [{ categoryId: null }, { categoryId: { $exists: false } }] }),
  ]);
  return { needed: legacyActive > 0 || unlinkedProducts > 0, legacyActive, unlinkedProducts };
}

module.exports = {
  TAXONOMY,
  UNCATEGORISED,
  mapToStandard,
  findStandard,
  resolveCategoryText,
  ensureStandardCategories,
  ensureAllStandardCategories,
  migrateCatalog,
  needsTidyUp,
  norm,
};
