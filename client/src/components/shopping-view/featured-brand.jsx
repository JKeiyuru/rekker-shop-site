/* eslint-disable react/prop-types */
// Home-page brand merchandising, driven by Admin → Brands:
//   • FeaturedBrandBand — a big band for the spotlight brand ("Spotlight on the
//     home page hero") with a clear "Shop <brand> now" button
//   • ShopByBrand — one card per brand, each going straight to that brand's products
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import useBrands from "@/hooks/use-brands";
import { brandPagePath, productsPath, sortBrands } from "@/lib/brand-utils";

const themeOf = (b) => (/^#[0-9a-f]{6}$/i.test(b.themeColor || "") && b.themeColor !== "#000000" ? b.themeColor : "#14532d");

export function FeaturedBrandBand() {
  const { brands } = useBrands();
  const b = sortBrands(brands).find((x) => x.isFeatured);
  if (!b) return null;
  const theme = themeOf(b);
  return (
    <section className="container mx-auto px-4 pt-12">
      <div className="relative overflow-hidden rounded-3xl text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${theme} 0%, #0b0b0b 120%)` }}>
        <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            {b.showNewBadge && <span className="inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: theme }}>New at Rekker</span>}
            <h2 className="mt-4 font-display text-4xl font-bold sm:text-5xl">{b.name}</h2>
            {b.tagline && <p className="mt-2 text-xl text-white/85">{b.tagline}</p>}
            {b.description && <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70">{b.description}</p>}
            {b.highlights?.length > 0 && (
              <ul className="mt-5 space-y-2 text-sm text-white/85">
                {b.highlights.slice(0, 3).map((h) => <li key={h} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" />{h}</li>)}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={productsPath(b)} className="inline-flex items-center rounded-full bg-white px-8 py-4 text-base font-bold text-ink shadow-lg transition hover:scale-[1.03]">
                Shop {b.name} now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to={brandPagePath(b)} className="inline-flex items-center rounded-full border border-white/40 px-7 py-4 text-sm font-semibold transition hover:bg-white/10">Meet the brand</Link>
            </div>
          </div>
          {(b.bannerUrl || b.logoUrl) && (
            <Link to={productsPath(b)} aria-label={`Shop ${b.name}`} className="block overflow-hidden rounded-2xl bg-white shadow-2xl transition duration-500 hover:-translate-y-1">
              <img src={b.bannerUrl || b.logoUrl} alt={b.name} loading="lazy" className="h-full w-full object-cover" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export function ShopByBrand() {
  const { brands } = useBrands();
  const list = sortBrands(brands);
  if (list.length < 2) return null;
  return (
    <section className="container mx-auto px-4 pt-14">
      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Our brands</p>
      <h2 className="mt-2 font-display text-3xl font-bold text-ink">Shop by brand</h2>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {list.map((b) => (
          <Link key={b._id} to={productsPath(b)} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg">
            {b.showNewBadge && <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white" style={{ background: themeOf(b) }}>New</span>}
            <div className="grid h-20 place-items-center">
              {b.logoUrl ? <img src={b.logoUrl} alt={b.name} loading="lazy" className="max-h-20 w-auto object-contain" /> : <span className="font-display text-2xl font-bold" style={{ color: themeOf(b) }}>{b.name}</span>}
            </div>
            <div className="mt-4">
              <p className="font-display text-lg font-semibold text-ink">{b.name}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{b.tagline || b.category}</p>
              <span className="mt-3 inline-flex items-center text-sm font-semibold text-primary">Shop products <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
