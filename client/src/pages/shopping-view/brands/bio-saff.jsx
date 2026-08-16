// Bio Saff brand page — premium cosmetics & body care by Rekker
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Sparkles, Leaf, ShieldCheck, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllFilteredProducts } from "@/store/shop/products-slice";
import ProductTile from "@/components/shopping-view/product-tile";

const ranges = [
  { title: "Hair mousse & styling", copy: "Lightweight hold that keeps curls and coils defined all day.", icon: Sparkles },
  { title: "Braid & edge care", copy: "Braid sprays and edge control that soothe the scalp and lay edges cleanly.", icon: Droplets },
  { title: "Shampoos & treatments", copy: "Cleansing and conditioning systems built for textured hair.", icon: Leaf },
  { title: "Body mists & hair mists", copy: "Premium fragranced mists for a finished, long-lasting scent.", icon: ShieldCheck },
];

const products = [
  "Hair mousse",
  "Body mists",
  "Braid sprays",
  "Shampoos",
  "Edge control",
  "Curl activator",
  "Hair mist",
  "Leave-in conditioners",
];

export default function BioSaffBrand() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList } = useSelector((s) => s.shopProducts);

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  const featured = (productList || [])
    .filter((p) => `${p?.brand || ""} ${p?.title || ""}`.toLowerCase().includes("bio"))
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="pointer-events-none absolute -left-24 top-0 h-96 w-96 rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-10 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> A Rekker brand
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Bio Saff — premium cosmetics and <span className="text-accent">body care</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/65">
            Bio Saff is Rekker&apos;s premium cosmetics and body care brand. Hair mousse, body mists,
            braid sprays, shampoos, edge control, curl activator and hair mists — formulated and
            manufactured in Kenya for people who expect premium results.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-7" onClick={() => navigate("/products")}>
              Shop Bio Saff <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white hover:text-ink"
              onClick={() => navigate("/brands")}
            >
              All Rekker brands
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">The range</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-ink">Built for real routines</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ranges.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
              <r.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Products</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-ink">What Bio Saff makes</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary hover:underline">
              Browse the shop
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {products.map((p) => (
              <span key={p} className="rounded-full border border-border bg-card px-4 py-2 text-sm text-ink">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="font-display text-3xl font-bold text-ink">Shop Bio Saff</h2>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductTile key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 pb-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-10 text-ink-foreground md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Stock Bio Saff in your salon or store</h2>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Wholesale pricing and scheduled deliveries for salons, retailers and distributors across Kenya.
            </p>
          </div>
          <Button size="lg" className="rounded-full px-7" onClick={() => navigate("/distributors")}>
            Become a stockist <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
