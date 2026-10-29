/* eslint-disable react/prop-types */
// client/src/components/shopping-view/brand-product-rail.jsx
// A row of one brand's products with add-to-cart, plus a "see all" link to the
// products page filtered to that brand. Used on the PetCare page and on the
// generic page every admin-created brand gets.
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import ProductTile from "@/components/shopping-view/product-tile";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchWishlist } from "@/store/shop/wishlist-slice";
import { API_BASE_URL } from "@/config/config.js";
import { productsPath } from "@/lib/brand-utils";

export default function BrandProductRail({ brand, limit = 4, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [products, setProducts] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!brand?.slug) return;
    let alive = true;
    axios.get(`${API_BASE_URL}/api/shop/products`, { params: { brand: brand.slug, sortBy: "newest", page: 1, limit } })
      .then(({ data }) => { if (alive) { setProducts(data.data || []); setTotal(data.pagination?.total ?? (data.data || []).length); } })
      .catch(() => { if (alive) setProducts([]); });
    return () => { alive = false; };
  }, [brand?.slug, limit]);

  useEffect(() => { if (user?.id) dispatch(fetchWishlist(user.id)); }, [dispatch, user?.id]);

  function handleAddtoCart(productId) {
    if (!isAuthenticated || !user) {
      toast({ title: "Login required", description: "Please login to add items to your cart", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    dispatch(addToCart({ userId: user.id, productId, quantity: 1 })).then((res) => {
      if (res?.payload?.success) { dispatch(fetchCartItems(user.id)); toast({ title: "Added to cart" }); }
    });
  }

  if (products && products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Shop the range</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">{title || `${brand.name} products`}</h2>
        </div>
        <Link to={productsPath(brand)} className="inline-flex items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-secondary">
          {total > limit ? `View all ${total} products` : "View in shop"} <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products
          ? products.map((p) => <ProductTile key={p._id} product={p} handleAddtoCart={handleAddtoCart} />)
          : Array.from({ length: limit }).map((_, i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-muted" />)}
      </div>
    </section>
  );
}
