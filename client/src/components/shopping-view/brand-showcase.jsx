/* eslint-disable react/prop-types */
// client/src/components/shopping-view/brand-showcase.jsx
// A full-width section on the brands page for any brand added in Admin → Brands
// that doesn't have a hand-written section (PetCare, and whatever comes next).
// Everything on it comes from the brand record, so editing the brand in the
// admin console changes this section.
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { anchorId, brandPagePath, productsPath } from "@/lib/brand-utils";

export default function BrandShowcase({ brand }) {
  const theme = /^#[0-9a-f]{6}$/i.test(brand.themeColor || "") && brand.themeColor !== "#000000" ? brand.themeColor : "#14532d";
  const art = brand.bannerUrl || brand.logoUrl;

  return (
    <section id={anchorId(brand.slug || brand.name)} className="scroll-mt-20 py-24" style={{ background: `linear-gradient(135deg, ${theme}14 0%, #ffffff 55%, ${theme}0d 100%)` }}>
      <div className="container mx-auto px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {brand.showNewBadge && <span className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: theme }}>New brand</span>}
              <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-black/55">{brand.category || "A Rekker brand"}</span>
            </div>
            <h2 className="font-display text-5xl font-bold text-ink md:text-6xl">{brand.name}</h2>
            {brand.tagline && <p className="mt-3 text-2xl font-medium" style={{ color: theme }}>{brand.tagline}</p>}
            {brand.description && <p className="mt-5 max-w-xl text-lg leading-relaxed text-black/65">{brand.description}</p>}
            {brand.highlights?.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {brand.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 text-base text-black/75">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ background: theme }}><Check className="h-3 w-3" /></span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to={productsPath(brand)} className="inline-flex items-center rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: theme }}>
                Shop {brand.name} products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to={brandPagePath(brand)} className="inline-flex items-center rounded-full border border-black/15 px-7 py-3.5 text-sm font-semibold text-ink transition hover:bg-black hover:text-white">
                Discover our story
              </Link>
            </div>
          </div>
          {art && (
            <Link to={productsPath(brand)} className="block overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl transition duration-500 hover:-translate-y-1" aria-label={`Shop ${brand.name}`}>
              <img src={art} alt={brand.name} loading="lazy" className="h-full w-full object-cover" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
