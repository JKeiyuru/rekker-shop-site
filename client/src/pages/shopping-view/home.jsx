/* eslint-disable no-unused-vars */
// Rekker Shop — Home
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Truck, ShieldCheck, Smartphone, Sparkles, Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchAllFilteredProducts,
} from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductTile from "@/components/shopping-view/product-tile";
import useSeo from "@/hooks/use-seo";

const brands = [
  {
    id: "saffron",
    name: "Saffron Milan",
    tagline: "Home & personal care, made in Kenya",
    to: "/brands/saffron",
    tone: "bg-primary text-primary-foreground",
  },
  {
    id: "biosaff",
    name: "Bio Saff",
    tagline: "Premium cosmetics & body care",
    to: "/brands/bio-saff",
    tone: "bg-accent text-accent-foreground",
  },
  {
    id: "cornells",
    name: "Cornells",
    tagline: "Beauty, skincare & fragrance",
    to: "/brands/cornells",
    tone: "bg-ink text-ink-foreground",
  },
];

const promises = [
  { icon: Truck, title: "Countrywide delivery", copy: "Nairobi same-day, 48h upcountry." },
  { icon: Smartphone, title: "Pay with M-Pesa", copy: "STK push, card, or Airtel Money at checkout." },
  { icon: ShieldCheck, title: "Genuine products", copy: "Straight from the manufacturer." },
  { icon: Store, title: "Trade pricing", copy: "Wholesale rates for stockists." },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function ShoppingHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { productList } = useSelector((state) => state.shopProducts);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useSeo({
    title: "Shop Rekker Online — Saffron Milan, Bio Saff & Cornells",
    description: "Shop toilet cleaners, hand wash, edge control and more from Saffron Milan, Bio Saff and Cornells — manufactured in Kenya, delivered nationwide with M-Pesa and card checkout.",
    path: "/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Rekker",
      url: "https://shop.rekker.co.ke",
      logo: "https://shop.rekker.co.ke/Logo.jpg",
      brand: ["Saffron Milan", "Bio Saff", "Cornells"],
    },
  });

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ filterParams: {}, sortParams: "price-lowtohigh" }));
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) dispatch(fetchWishlist(user.id));
  }, [dispatch, user]);

  function handleAddtoCart(id) {
    if (!isAuthenticated || !user) {
      toast({ title: "Login required", description: "Please login to add items to your cart", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    dispatch(addToCart({ userId: user?.id, productId: id, quantity: 1 })).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Added to cart" });
      }
    });
  }

  const featured = (productList || []).slice(0, 8);
  const deals = (productList || []).filter((p) => p?.salePrice > 0).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="container relative mx-auto grid gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <motion.div initial="hidden" animate="show" variants={fade}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> One store. Every Rekker brand.
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Kenya&apos;s everyday essentials,
              <span className="text-primary"> delivered.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-white/65">
              Shop Saffron Milan, Bio Saff and Cornells in a single cart — manufactured
              and distributed by Rekker, paid for with M-Pesa.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" className="rounded-full px-7" onClick={() => navigate("/products")}>
                Shop all products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/25 bg-transparent px-7 text-white hover:bg-white hover:text-ink"
                onClick={() => navigate("/brands")}
              >
                Explore brands
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={fade}
            className="grid gap-4 sm:grid-cols-2"
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={brand.to}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/25 sm:first:col-span-2"
              >
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${brand.tone}`}>
                  {brand.id}
                </span>
                <div className="mt-8">
                  <h3 className="font-display text-xl font-semibold">{brand.name}</h3>
                  <p className="mt-1 text-sm text-white/55">{brand.tagline}</p>
                </div>
                <ArrowRight className="mt-5 h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Promises */}
      <section className="border-b border-border bg-secondary">
        <div className="container mx-auto grid grid-cols-2 gap-px px-4 py-10 lg:grid-cols-4">
          {promises.map((p) => (
            <div key={p.title} className="flex items-start gap-3 px-2 py-3">
              <p.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-display text-sm font-semibold text-ink">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Bestsellers</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">Popular right now</h2>
          </div>
          <Button variant="ghost" className="rounded-full" onClick={() => navigate("/products")}>
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {featured.length > 0
            ? featured.map((product) => (
                <ProductTile
                  key={product._id}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />
              ))}
        </div>
      </section>

      {/* Deals */}
      {deals.length > 0 && (
        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary">On offer</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-ink">This week&apos;s deals</h2>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {deals.map((product) => (
                <ProductTile
                  key={product._id}
                  product={product}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trade CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-10 text-ink-foreground md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Stocking Rekker brands?</h2>
            <p className="mt-2 max-w-xl text-sm text-white/60">
              Retailers, salons and institutions get wholesale pricing and scheduled
              deliveries across Kenya.
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

export default ShoppingHome;
