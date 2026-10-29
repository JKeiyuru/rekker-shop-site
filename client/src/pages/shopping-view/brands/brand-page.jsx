/* eslint-disable react/prop-types */
// client/src/pages/shopping-view/brands/brand-page.jsx
// Route target for /brands/:slug. PetCare has its own written page; every other
// brand added in Admin → Brands gets this generic page built from the brand record.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Check } from "lucide-react";
import useSeo from "@/hooks/use-seo";
import BrandProductRail from "@/components/shopping-view/brand-product-rail";
import { API_BASE_URL } from "@/config/config.js";
import { normKey, productsPath } from "@/lib/brand-utils";
import PetCareBrandPage from "./petcare";
import NotFound from "@/pages/not-found";

function GenericBrand({ slug }) {
  const [state, setState] = useState({ loading: true, brand: null });
  useEffect(() => {
    let alive = true;
    setState({ loading: true, brand: null });
    axios.get(`${API_BASE_URL}/api/shop/brands/${encodeURIComponent(slug)}`)
      .then(({ data }) => { if (alive) setState({ loading: false, brand: data.data?.brand || null }); })
      .catch(() => { if (alive) setState({ loading: false, brand: null }); });
    return () => { alive = false; };
  }, [slug]);

  const brand = state.brand;
  useSeo({
    title: brand?.seoTitle || (brand ? `${brand.name} — Shop Online` : "Brand"),
    description: brand?.seoDescription || brand?.description || "",
    path: `/brands/${slug}`,
    image: brand?.ogImage || undefined,
  });

  if (state.loading) return <div className="container mx-auto px-4 py-24"><div className="h-64 animate-pulse rounded-3xl bg-muted" /></div>;
  if (!brand) return <NotFound />;

  const theme = /^#[0-9a-f]{6}$/i.test(brand.themeColor || "") && brand.themeColor !== "#000000" ? brand.themeColor : "#111111";
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden text-white" style={{ background: theme }}>
        {brand.bannerUrl && <img src={brand.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="container relative mx-auto px-4 py-20 lg:py-28">
          {brand.showNewBadge && <span className="mb-4 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-ink">New brand</span>}
          <h1 className="font-display text-5xl font-bold sm:text-6xl">{brand.name}</h1>
          {brand.tagline && <p className="mt-3 text-xl text-white/85">{brand.tagline}</p>}
          <Link to={productsPath(brand)} className="mt-8 inline-flex items-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-ink shadow-lg transition hover:scale-[1.03]">
            Shop {brand.name} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
      <section className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {brand.description && <p className="text-lg leading-relaxed text-ink">{brand.description}</p>}
          {brand.story && <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{brand.story}</p>}
        </div>
        {brand.highlights?.length > 0 && (
          <aside className="rounded-2xl border border-border bg-secondary p-6">
            <h2 className="font-display text-lg font-bold text-ink">Highlights</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {brand.highlights.map((h) => <li key={h} className="flex items-start gap-3"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{h}</li>)}
            </ul>
          </aside>
        )}
      </section>
      <BrandProductRail brand={brand} />
    </div>
  );
}

export default function BrandPage() {
  const { slug } = useParams();
  if (normKey(slug) === "petcare") return <PetCareBrandPage />;
  return <GenericBrand slug={slug} />;
}
