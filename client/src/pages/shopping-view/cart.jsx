/* eslint-disable react/prop-types, react/no-unescaped-entities */
// client/src/pages/shopping-view/cart.jsx — /cart
// A proper cart page (it used to be a cramped side sheet):
//  • full product names, bundle contents, sale prices
//  • big +/- buttons AND a quantity box you can type into
//  • stock-aware (can't exceed what we have, tells you why)
//  • sticky checkout bar on phones, order summary on desktop
//  • bundle deals under the cart as an upsell, plus clear ways back to shopping
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, ChevronLeft, Loader2, Lock, Minus, MessageCircle, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { deleteCartItem, fetchCartItems, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import DealsRail from "@/components/shopping-view/deals-rail";
import useSeo from "@/hooks/use-seo";

const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const unit = (i) => Number(i?.salePrice > 0 && i.salePrice < i.price ? i.salePrice : i?.price) || 0;
const WHATSAPP = "254796183064";

function QtyBox({ item, busy, onSet }) {
  const [text, setText] = useState(String(item.quantity));
  useEffect(() => setText(String(item.quantity)), [item.quantity]);
  const limit = item.maxPerOrder > 0 ? Math.min(item.totalStock ?? Infinity, item.maxPerOrder) : item.totalStock ?? Infinity;

  const commit = () => {
    const n = Math.floor(Number(text));
    if (!Number.isFinite(n) || n < 1) { setText(String(item.quantity)); return; }
    if (n !== item.quantity) onSet(n);
  };
  const btn = "grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-ink transition hover:bg-secondary active:scale-95 disabled:opacity-40 disabled:hover:bg-card";
  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} disabled={busy || item.quantity <= 1} onClick={() => onSet(item.quantity - 1)} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
      <input
        value={text}
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Quantity"
        disabled={busy}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="h-11 w-14 rounded-xl border border-border bg-card text-center text-base font-semibold text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
      <button type="button" className={btn} disabled={busy || item.quantity >= limit} onClick={() => onSet(item.quantity + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

function Row({ item, busy, onSet, onRemove }) {
  const onSale = item.salePrice > 0 && item.salePrice < item.price;
  const limit = item.maxPerOrder > 0 ? Math.min(item.totalStock ?? Infinity, item.maxPerOrder) : item.totalStock ?? Infinity;
  const atLimit = item.quantity >= limit;
  const img = (
    <img src={item.image || ""} alt="" className="h-24 w-24 rounded-2xl border border-border bg-secondary object-cover sm:h-28 sm:w-28" />
  );
  return (
    <li className={`flex gap-4 py-5 transition ${busy ? "opacity-60" : ""}`}>
      {item.isBundle ? img : <Link to={`/product/${item.productId}`} className="shrink-0">{img}</Link>}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.isBundle && <span className="mb-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Bundle deal</span>}
            {/* full name — never truncated */}
            <h3 className="break-words text-[15px] font-semibold leading-snug text-ink sm:text-base">
              {item.isBundle ? item.title : <Link to={`/product/${item.productId}`} className="hover:text-primary">{item.title}</Link>}
            </h3>
            {item.isBundle && item.bundleItems?.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">Includes {item.bundleItems.map((b) => `${b.qty}× ${b.title}`).join(", ")}</p>
            )}
          </div>
          <p className="hidden shrink-0 text-right font-display text-lg font-bold text-ink sm:block">{kes(unit(item) * item.quantity)}</p>
        </div>

        <div className="mt-1 flex items-baseline gap-2 text-sm">
          <span className="font-semibold text-ink">{kes(unit(item))}</span>
          {onSale && <span className="text-xs text-muted-foreground line-through">{kes(item.price)}</span>}
          {item.isBundle && item.compareAtPrice > item.price && <span className="text-xs text-muted-foreground line-through">{kes(item.compareAtPrice)}</span>}
          <span className="text-xs text-muted-foreground">each</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <QtyBox item={item} busy={busy} onSet={onSet} />
          <div className="flex items-center gap-4">
            <p className="font-display text-base font-bold text-ink sm:hidden">{kes(unit(item) * item.quantity)}</p>
            <button type="button" onClick={onRemove} disabled={busy} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-primary">
              <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>

        {atLimit && Number.isFinite(limit) && (
          <p className="mt-2 text-xs font-medium text-amber-700">
            {item.maxPerOrder > 0 && item.maxPerOrder <= (item.totalStock ?? Infinity) ? `Limit of ${item.maxPerOrder} per order` : `That's all we have — only ${limit} in stock`}
          </p>
        )}
        {!atLimit && item.totalStock > 0 && item.totalStock <= 5 && <p className="mt-2 text-xs font-medium text-amber-700">Only {item.totalStock} left</p>}
      </div>
    </li>
  );
}

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSelector((s) => s.auth);
  const { cartItems, isLoading } = useSelector((s) => s.shopCart);
  const items = Array.isArray(cartItems?.items) ? cartItems.items : Array.isArray(cartItems) ? cartItems : [];
  const [busyId, setBusyId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useSeo({ title: "Your Cart | Rekker", description: "Review your cart and check out.", path: "/cart", noindex: true });

  useEffect(() => {
    if (user?.id) dispatch(fetchCartItems(user.id)).finally(() => setLoaded(true));
  }, [dispatch, user?.id]);

  const subtotal = items.reduce((s, i) => s + unit(i) * (Number(i.quantity) || 0), 0);
  const count = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const issue = items.find((i) => i.totalStock !== undefined && i.totalStock < 1);

  async function setQty(item, quantity) {
    setBusyId(String(item.productId));
    const res = await dispatch(updateCartQuantity({ userId: user.id, productId: item.productId, quantity }));
    setBusyId(null);
    if (!res?.payload?.success) {
      toast({ title: res?.payload?.message || "Couldn't change the quantity", variant: "destructive" });
      dispatch(fetchCartItems(user.id)); // put the box back to the real number
    }
  }
  async function remove(item) {
    setBusyId(String(item.productId));
    await dispatch(deleteCartItem({ userId: user.id, productId: item.productId }));
    setBusyId(null);
    toast({ title: "Removed from cart" });
  }

  if (!loaded && isLoading && items.length === 0) {
    return <div className="flex flex-1 items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // ── Empty ──
  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-secondary"><ShoppingBag className="h-10 w-10 text-muted-foreground" /></div>
          <h1 className="font-display text-3xl font-bold text-ink">Your cart is empty</h1>
          <p className="mb-6 mt-2 text-muted-foreground">Looks like you haven't added anything yet.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/products" className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground">Start shopping</Link>
            <Link to="/deals" className="rounded-full border border-border px-8 py-3 font-semibold text-ink hover:bg-secondary">See bundle deals</Link>
          </div>
        </div>
        <DealsRail className="mt-14" title="Deals you might like" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-ink">Home</Link><span>/</span><span className="font-medium text-ink">Cart</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-ink">Your cart <span className="text-lg font-medium text-muted-foreground">({count} item{count === 1 ? "" : "s"})</span></h1>
        <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"><ChevronLeft className="h-4 w-4" /> Continue shopping</Link>
      </div>

      <div className="grid gap-8 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
        <div className="rounded-3xl border border-border bg-card px-4 sm:px-6">
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <Row key={String(item.productId)} item={item} busy={busyId === String(item.productId)} onSet={(q) => setQty(item, q)} onRemove={() => remove(item)} />
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-4 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal ({count} item{count === 1 ? "" : "s"})</dt><dd className="font-semibold text-ink">{kes(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="flex items-center gap-1.5 text-muted-foreground"><Truck className="h-4 w-4" /> Delivery</dt><dd className="text-muted-foreground">Calculated at checkout</dd></div>
          </dl>
          <div className="flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-display font-bold text-ink">Estimated total</span>
            <span className="font-display text-2xl font-bold text-ink">{kes(subtotal)}</span>
          </div>
          <p className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-xs text-muted-foreground"><Tag className="h-4 w-4 shrink-0 text-primary" /> Have a discount code? You can enter it at checkout.</p>
          {issue && <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800">"{issue.title}" is out of stock — remove it to continue.</p>}
          <button onClick={() => navigate("/checkout")} disabled={!!issue} className="hidden h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-50 lg:flex">
            <Lock className="h-4 w-4" /> Checkout <ArrowRight className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Secure checkout</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-primary" /> Genuine products</span>
          </div>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Rekker! I need help with my cart.")}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-semibold text-ink hover:bg-secondary">
            <MessageCircle className="h-4 w-4 text-[#25D366]" /> Need help? Chat with us
          </a>
        </aside>
      </div>

      <DealsRail className="mt-12" title="Add a deal to your order" subtitle="Bundles save you more" />

      {/* Phones: always-visible checkout bar, sitting above the bottom tab bar */}
      <div className="fixed inset-x-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur lg:hidden" style={{ bottom: "calc(56px + env(safe-area-inset-bottom))" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <div className="leading-tight"><p className="text-xs text-muted-foreground">Total</p><p className="font-display text-xl font-bold text-ink">{kes(subtotal)}</p></div>
          <button onClick={() => navigate("/checkout")} disabled={!!issue} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50">
            Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
