// client/src/components/shopping-view/bundle-card.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2, Package, ShoppingCart } from "lucide-react";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";

const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;

export default function BundleCard({ bundle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { cartItems } = useSelector((s) => s.shopCart);
  const [busy, setBusy] = useState(false);

  const pct = bundle.compareAtPrice > bundle.price ? Math.round(((bundle.compareAtPrice - bundle.price) / bundle.compareAtPrice) * 100) : 0;
  const inCart = (cartItems?.items || []).find((i) => String(i.productId) === String(bundle._id))?.quantity || 0;
  const photos = (bundle.items || []).map((i) => i.product?.image || i.product?.images?.[0]).filter(Boolean);

  async function add() {
    if (!isAuthenticated) { navigate("/auth/login"); return; }
    setBusy(true);
    const res = await dispatch(addToCart({ userId: user?.id, productId: bundle._id, quantity: 1 }));
    setBusy(false);
    if (res?.payload?.success) { dispatch(fetchCartItems(user?.id)); toast({ title: "Bundle added to cart" }); }
    else toast({ title: res?.payload?.message || "Couldn't add this bundle", variant: "destructive" });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-muted">
        {bundle.image ? (
          <img src={bundle.image} alt={bundle.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full grid-cols-2 gap-px">{photos.slice(0, 4).map((p, k) => <img key={k} src={p} alt="" className="h-full w-full object-cover" />)}</div>
        )}
        {pct > 0 && <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">Save {pct}%</span>}
        {bundle.badge && <span className="absolute right-3 top-3 rounded-full bg-black/80 px-3 py-1 text-xs font-semibold text-white">{bundle.badge}</span>}
        {bundle.available <= 5 && <span className="absolute bottom-3 left-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">Only {bundle.available} left</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-ink"><Package className="h-4 w-4 text-primary" />{bundle.name}</h3>
        <ul className="space-y-0.5 text-sm text-muted-foreground">
          {(bundle.items || []).map((i, k) => <li key={k} className="truncate">{i.qty}× {i.product?.title}</li>)}
        </ul>
        {bundle.description && <p className="line-clamp-2 text-sm text-muted-foreground">{bundle.description}</p>}
        <div className="mt-auto pt-2">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-xl font-black text-ink">{kes(bundle.price)}</span>
            {bundle.compareAtPrice > bundle.price && <span className="text-sm text-muted-foreground line-through">{kes(bundle.compareAtPrice)}</span>}
          </div>
          <button onClick={add} disabled={busy || (bundle.maxPerOrder > 0 && inCart >= bundle.maxPerOrder)} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
            {inCart ? `Add another (${inCart} in cart)` : "Add bundle to cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
