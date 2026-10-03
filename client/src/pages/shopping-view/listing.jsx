/* eslint-disable react-hooks/exhaustive-deps */
// client/src/pages/shopping-view/listing.jsx
// Products page. The URL is the single source of truth:
//   /products?category=hair-care&brand=cornells&sort=newest
// so every filtered view is shareable, bookmarkable and works with the
// browser back button. Only two filters exist: category and brand.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { ArrowUpDownIcon, Filter, Loader2, PackageSearch, X } from "lucide-react";
import ProductFilter from "@/components/shopping-view/filter";
import LuxuryProductTile from "@/components/shopping-view/product-tile";
import { WideBanner } from "@/components/shopping-view/ad-banners";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { API_BASE_URL } from "@/config/config.js";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";
import useSeo from "@/hooks/use-seo";

const PAGE_SIZE = 24;
const csv = (v) => (v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);

// old links (/products?category=toys&brand=saffron) keep working
const OLD_BRAND_SLUGS = { saffron: "saffron-milan", biosaff: "bio-saff" };

export default function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const { cartItems } = useSelector((s) => s.shopCart);
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  const selected = useMemo(() => ({
    category: csv(params.get("category")),
    brand: csv(params.get("brand")).map((b) => OLD_BRAND_SLUGS[b] || b),
  }), [params]);
  const sort = params.get("sort") || "newest";
  const search = params.get("search") || "";

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [options, setOptions] = useState({ categories: [], brands: [] });
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reqId = useRef(0);

  const update = useCallback((next) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join(",") : v;
      if (val) p.set(k, val); else p.delete(k);
    });
    setParams(p, { replace: true });
  }, [params, setParams]);

  const toggle = (key) => (slug) => {
    const cur = selected[key];
    update({ [key]: cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug] });
  };

  // Products (page 1 whenever filters or sort change)
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/shop/products`, {
      params: { category: selected.category.join(","), brand: selected.brand.join(","), sortBy: sort, search, page: 1, limit: PAGE_SIZE },
    }).then(({ data }) => {
      if (id !== reqId.current) return;
      setProducts(data.data || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    }).catch(() => { if (id === reqId.current) setProducts([]); })
      .finally(() => { if (id === reqId.current) setLoading(false); });
  }, [selected.category.join(","), selected.brand.join(","), sort, search]);

  // Sidebar options with live counts
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shop/products/filters`, { params: { category: selected.category.join(","), brand: selected.brand.join(",") } })
      .then(({ data }) => setOptions(data.data || { categories: [], brands: [] })).catch(() => {});
  }, [selected.category.join(","), selected.brand.join(",")]);

  // Heading / SEO for a single chosen category
  useEffect(() => {
    if (selected.category.length !== 1) { setCategoryInfo(null); return; }
    axios.get(`${API_BASE_URL}/api/shop/categories/${selected.category[0]}`)
      .then(({ data }) => setCategoryInfo(data.data)).catch(() => setCategoryInfo(null));
  }, [selected.category.join(",")]);

  useEffect(() => { if (user?.id) dispatch(fetchWishlist(user.id)); }, [dispatch, user?.id]);

  const brandName = selected.brand.length === 1 ? options.brands.find((b) => b.slug === selected.brand[0])?.name : null;
  const heading = [brandName, categoryInfo?.name].filter(Boolean).join(" ") || (search ? `Results for “${search}”` : "All products");

  useSeo({
    title: categoryInfo?.seoTitle && !brandName ? categoryInfo.seoTitle : (heading !== "All products" ? `${heading} — Shop Online` : "Shop All Products"),
    description: categoryInfo?.seoDescription && !brandName
      ? categoryInfo.seoDescription
      : heading !== "All products"
        ? `Shop ${heading} online at Rekker — delivered across Kenya with M-Pesa and card checkout.`
        : "Browse the full Rekker catalogue — Saffron Milan, Bio Saff and Cornells home care, beauty and personal care products, delivered across Kenya.",
    path: "/products",
  });

  async function loadMore() {
    setLoadingMore(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/shop/products`, {
        params: { category: selected.category.join(","), brand: selected.brand.join(","), sortBy: sort, search, page: pagination.page + 1, limit: PAGE_SIZE },
      });
      setProducts((p) => [...p, ...(data.data || [])]);
      setPagination(data.pagination);
    } finally { setLoadingMore(false); }
  }

  const handleAddtoCart = useCallback(async (productId, totalStock) => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Required", description: "Please login to add items to your cart", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    const inCart = (cartItems?.items || []).find((i) => String(i.productId) === String(productId))?.quantity || 0;
    if (totalStock !== undefined && inCart + 1 > totalStock) {
      toast({ title: `Only ${inCart} available for this item`, variant: "destructive" });
      return;
    }
    const res = await dispatch(addToCart({ userId: user?.id, productId, quantity: 1 }));
    if (res?.payload?.success) { dispatch(fetchCartItems(user?.id)); toast({ title: "Product is added to cart" }); }
    else toast({ title: res?.payload?.message || "Couldn't add to cart", variant: "destructive" });
  }, [isAuthenticated, user, cartItems, navigate, dispatch, toast]);

  const activeCount = selected.category.length + selected.brand.length;
  const clearAll = () => update({ category: "", brand: "" });
  const filterProps = { options, selected, onToggleCategory: toggle("category"), onToggleBrand: toggle("brand"), onClear: clearAll };

  // removable chips for active filters
  const chips = [
    ...selected.category.map((slug) => ({ key: `c-${slug}`, label: findCatName(options, slug) || slug, remove: () => toggle("category")(slug) })),
    ...selected.brand.map((slug) => ({ key: `b-${slug}`, label: options.brands.find((b) => b.slug === slug)?.name || slug, remove: () => toggle("brand")(slug) })),
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
      <WideBanner placement="listing" className="pb-6" />

      <header className="mb-6">
        {categoryInfo?.image && (
          <div className="relative mb-5 h-36 overflow-hidden rounded-2xl sm:h-48">
            <img src={categoryInfo.image} alt={categoryInfo.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
              <h1 className="font-display text-3xl font-bold sm:text-4xl">{heading}</h1>
              {categoryInfo.description && <p className="mt-1 max-w-xl text-sm text-white/85">{categoryInfo.description}</p>}
            </div>
          </div>
        )}
        {!categoryInfo?.image && (
          <>
            <h1 className="font-display text-3xl font-bold text-ink">{heading}</h1>
            {categoryInfo?.description && <p className="mt-1 max-w-2xl text-muted-foreground">{categoryInfo.description}</p>}
          </>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4"><ProductFilter {...filterProps} /></div>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{loading ? "Loading…" : `${pagination.total} product${pagination.total === 1 ? "" : "s"}`}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 lg:hidden" onClick={() => setMobileOpen(true)}>
                <Filter className="h-4 w-4" /> Filter{activeCount > 0 && ` (${activeCount})`}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2"><ArrowUpDownIcon className="h-4 w-4" /> Sort by</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[210px]">
                  <DropdownMenuRadioGroup value={sort} onValueChange={(v) => update({ sort: v === "newest" ? "" : v })}>
                    {sortOptions.map((o) => <DropdownMenuRadioItem value={o.id} key={o.id}>{o.label}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.key} onClick={c.remove} className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {c.label} <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button onClick={clearAll} className="px-2 text-sm text-muted-foreground hover:text-ink">Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />)}</div>
          ) : products.length ? (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => <LuxuryProductTile key={p._id} product={p} handleAddtoCart={handleAddtoCart} />)}
              </div>
              {pagination.page < pagination.pages && (
                <div className="mt-10 flex justify-center">
                  <Button variant="outline" size="lg" className="rounded-full px-8" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Show more ({pagination.total - products.length} left)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-3 font-semibold text-ink">No products match</p>
              <p className="mt-1 text-sm text-muted-foreground">Try removing a filter.</p>
              {activeCount > 0 && <Button className="mt-4 rounded-full" onClick={clearAll}>Clear filters</Button>}
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
          <SheetHeader><SheetTitle className="sr-only">Filter products</SheetTitle></SheetHeader>
          <div className="pt-4"><ProductFilter {...filterProps} /></div>
          <Button className="mt-6 w-full rounded-full" onClick={() => setMobileOpen(false)}>Show {pagination.total} products</Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function findCatName(options, slug) {
  for (const c of options.categories || []) {
    if (c.slug === slug) return c.name;
    const s = c.children.find((x) => x.slug === slug);
    if (s) return s.name;
  }
  return null;
}
