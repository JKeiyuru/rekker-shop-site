// client/src/hooks/use-seo.js
// Sets per-page <title>, meta description, canonical URL, Open Graph tags,
// and (optionally) a JSON-LD script — all client-side, since this is a pure
// React SPA with no server-side rendering.
//
// Why this matters: without it, every single page (home, every product,
// every brand, every category) shares the exact same <title>/<meta
// description> from index.html. Google uses the title tag as one of its
// strongest ranking signals — if 500 product pages all say "Shop Rekker |
// Saffron Milan, Bio Saff & Cornells Online", Google has no way to tell them
// apart, and near-certainly won't rank any of them for a specific product
// search like "saffron milan toilet cleaner."
//
// Note: Googlebot does execute JavaScript before indexing, so it will see
// these tags — but execution isn't instant, and other crawlers (Bing,
// social-media link previews, WhatsApp/Facebook unfurling) often DON'T run
// JS at all and will only ever see whatever's in the raw HTML. For those,
// only the tags already in index.html apply. This hook meaningfully helps
// Google specifically; it is not a full substitute for server-side
// rendering, which is the only way to guarantee every crawler sees unique
// tags. That's a bigger, separate infrastructure change (e.g. moving to
// Next.js/Remix) — worth knowing as a ceiling on what client-side SEO can
// achieve, not something to silently paper over.
import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!data) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

const SITE_NAME = "Rekker";
const DEFAULT_IMAGE = "https://shop.rekker.co.ke/Logo.jpg";

/**
 * useSeo({ title, description, path, image, jsonLd, noindex })
 * - title: page title (site name is appended automatically)
 * - description: meta description (~150-160 chars ideal)
 * - path: canonical path, e.g. "/product/abc123" (no domain)
 * - image: absolute image URL for Open Graph / social previews
 * - jsonLd: a plain object (or array of objects) to emit as JSON-LD
 * - noindex: true for pages that shouldn't be indexed (account, checkout, etc.)
 */
export default function useSeo({ title, description, path, image, jsonLd, noindex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Saffron Milan, Bio Saff & Cornells Online`;
    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    const canonicalUrl = path ? `https://shop.rekker.co.ke${path}` : undefined;
    upsertLink("canonical", canonicalUrl);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", SITE_NAME);
    if (canonicalUrl) upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", image || DEFAULT_IMAGE);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", image || DEFAULT_IMAGE);

    upsertJsonLd("page-jsonld", jsonLd);

    // No cleanup: the next page's useSeo call overwrites these same tags on
    // mount, so there's nothing stale left behind between navigations.
  }, [title, description, path, image, jsonLd, noindex]);
}
