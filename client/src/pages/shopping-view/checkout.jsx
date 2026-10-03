/* eslint-disable react/prop-types, react/no-unescaped-entities */
// client/src/pages/shopping-view/checkout.jsx
// Rekker checkout — redesigned to match the storefront (ink / primary red / display font).
//   • One flowing page: Delivery → Payment → Review. Finished steps collapse into a
//     tidy summary with a "Change" link, so shoppers always see where they are.
//   • Phones: collapsible order summary pinned at the top (with the live total),
//     big tap targets, no horizontal clutter.
//   • Trust signals, discount code, saved addresses, free-delivery highlighting.
//   • Same order logic as before: COD or Paystack (M-Pesa / card / Airtel Money),
//     prices are always re-calculated on the server.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import {
  fetchCounties,
  fetchSubCounties,
  fetchLocations,
  clearSubCounties,
  clearLocations,
} from "@/store/shop/delivery-slice";
import { fetchAllAddresses, addNewAddress, deleteAddress } from "@/store/shop/address-slice";
import { clearCart } from "@/store/shop/cart-slice";
import DiscountBox from "@/components/shopping-view/discount-box";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, CreditCard, ClipboardList, Check, ChevronDown, ChevronLeft, Loader2, MessageCircle,
  Truck, Smartphone, Wallet, Phone, ShoppingCart, Lock, ShieldCheck, BadgeCheck, Trash2,
  Plus, Pencil, PackageCheck, Mail, Bookmark,
} from "lucide-react";

const WHATSAPP_NUMBER = "254796183064";
const MAX_SAVED_ADDRESSES = 2;

const formatKES = (amount) => `KES ${Number(amount || 0).toLocaleString("en-KE")}`;
const unitPrice = (i) => Number(i?.salePrice > 0 ? i.salePrice : i?.price) || 0;

function extractCartItems(cartState) {
  if (!cartState) return [];
  if (Array.isArray(cartState.cartItems)) return cartState.cartItems;
  if (cartState.cartItems && Array.isArray(cartState.cartItems.items)) return cartState.cartItems.items;
  return [];
}

const field =
  "h-12 w-full rounded-xl border border-border bg-card px-4 text-[15px] text-ink outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60";

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Progress ────────────────────────────────────────────────────────────────
const STEPS = [["Delivery", MapPin], ["Payment", CreditCard], ["Review", ClipboardList]];
function Progress({ step, onGo }) {
  return (
    <ol className="mx-auto flex max-w-xl items-center justify-between">
      {STEPS.map(([label, Icon], i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <li key={label} className="flex flex-1 items-center">
            <button
              type="button"
              disabled={!done}
              onClick={() => done && onGo(n)}
              className="flex flex-col items-center gap-1.5 disabled:cursor-default"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold transition ${
                done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              }`}>
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-ink" : "text-muted-foreground"}`}>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`mx-2 mb-5 h-0.5 flex-1 rounded ${step > n ? "bg-primary" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

// ─── A step card that collapses into a summary once completed ────────────────
function StepCard({ n, title, icon: Icon, step, summary, onEdit, children }) {
  const state = step === n ? "active" : step > n ? "done" : "locked";
  return (
    <section className={`overflow-hidden rounded-3xl border bg-card transition ${state === "active" ? "border-primary/30 shadow-xl shadow-black/5" : "border-border"} ${state === "locked" ? "opacity-60" : ""}`}>
      <header className="flex items-center gap-3 px-5 py-4 sm:px-7 sm:py-5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${state === "done" ? "bg-primary text-primary-foreground" : state === "active" ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground"}`}>
          {state === "done" ? <Check className="h-4 w-4" /> : n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{title}</h2>
          {state === "done" && <div className="mt-0.5 text-sm text-muted-foreground">{summary}</div>}
        </div>
        {state === "done" && (
          <button onClick={onEdit} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
            <Pencil className="h-3.5 w-3.5" /> Change
          </button>
        )}
        {state === "locked" && <Icon className="h-5 w-5 text-muted-foreground" />}
      </header>
      {state === "active" && <div className="space-y-5 px-5 pb-6 sm:px-7 sm:pb-8">{children}</div>}
    </section>
  );
}

// ─── Order lines (used in sidebar, mobile drawer and review) ─────────────────
function Lines({ cartItems }) {
  return (
    <ul className="divide-y divide-border">
      {cartItems.map((item, idx) => {
        const q = Number(item?.quantity) || 1;
        return (
          <li key={idx} className="flex gap-3 py-3">
            <div className="relative h-16 w-16 shrink-0">
              <img src={item?.image || ""} alt="" className="h-full w-full rounded-xl border border-border bg-secondary object-cover" />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] font-bold text-ink-foreground">{q}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-ink">
                {item?.isBundle && <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">Bundle</span>}
                {item?.title}
              </p>
              {item?.isBundle && item?.bundleItems?.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">{item.bundleItems.map((b) => `${b.qty}× ${b.title}`).join(", ")}</p>
              )}
            </div>
            <p className="shrink-0 text-sm font-semibold text-ink">{formatKES(unitPrice(item) * q)}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Totals({ subtotal, discount, discountAmt, deliveryFee, isFree, hasFee, total }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-muted-foreground"><dt>Subtotal</dt><dd className="text-ink">{formatKES(subtotal)}</dd></div>
      {discountAmt > 0 && (
        <div className="flex justify-between font-medium text-green-700"><dt>Discount ({discount.code})</dt><dd>-{formatKES(discountAmt)}</dd></div>
      )}
      <div className="flex justify-between text-muted-foreground">
        <dt className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Delivery</dt>
        <dd className={isFree ? "font-semibold text-green-700" : "text-ink"}>{!hasFee ? "Calculated next" : isFree ? "FREE" : formatKES(deliveryFee)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-border pt-3">
        <dt className="font-display text-base font-bold text-ink">Total</dt>
        <dd className="font-display text-2xl font-bold text-ink">{formatKES(total)}</dd>
      </div>
    </dl>
  );
}

function Summary(props) {
  const { cartItems, discount, onDiscountChange } = props;
  return (
    <aside className="space-y-4 rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-6">
      <h2 className="font-display text-lg font-bold text-ink">Order summary</h2>
      <Lines cartItems={cartItems} />
      <DiscountBox cartItems={cartItems} discount={discount} onChange={onDiscountChange} />
      <Totals {...props} />
      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-medium text-muted-foreground">
        {[[ShieldCheck, "Secure payment"], [BadgeCheck, "Genuine products"], [Truck, "Delivery across Kenya"], [MessageCircle, "WhatsApp support"]].map(([I, t]) => (
          <span key={t} className="flex items-center gap-1.5"><I className="h-3.5 w-3.5 text-primary" />{t}</span>
        ))}
      </div>
    </aside>
  );
}

function SavedAddressCard({ address, isSelected, onSelect, onDelete }) {
  const free = address.isFreeDelivery || address.deliveryFee === 0;
  return (
    <div onClick={onSelect} role="button" tabIndex={0}
      className={`cursor-pointer rounded-2xl border-2 p-4 transition ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-ink/30"}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${isSelected ? "border-primary" : "border-border"}`}>
          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
        </span>
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-ink">{address.location}, {address.subCounty}</p>
          <p className="text-muted-foreground">{address.county}{address.specificAddress ? ` · ${address.specificAddress}` : ""}</p>
          <p className="mt-1 flex items-center gap-1 text-muted-foreground"><Phone className="h-3 w-3" /> {address.phone}</p>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${free ? "bg-green-100 text-green-700" : "bg-secondary text-ink"}`}>
            {free ? "FREE delivery" : `${formatKES(address.deliveryFee)} delivery`}
          </span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(address._id); }} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary" title="Delete address">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const { user }         = useSelector((s) => s.auth  || {});
  const shopCart         = useSelector((s) => s.shopCart) || {};
  const shopDelivery     = useSelector((s) => s.shopDelivery) || {};
  const { addressList }  = useSelector((s) => s.shopAddress) || { addressList: [] };
  const cartItems        = extractCartItems(shopCart);

  const {
    counties = [],
    subCounties = [],
    locations   = [],
    isLoading: deliveryLoading = false,
  } = shopDelivery;

  const [step,          setStep]          = useState(1);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [placedOrder,   setPlacedOrder]   = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [showSummary,   setShowSummary]   = useState(false);

  // Saved address mode
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [useNewAddress,        setUseNewAddress]         = useState(true);
  const [saveThisAddress,      setSaveThisAddress]       = useState(false);

  // Step 1 — address
  const [address, setAddress] = useState({
    county: "", subCounty: "", location: "",
    specificAddress: "", phone: "", notes: "",
  });
  const [deliveryFee,    setDeliveryFee]    = useState(null);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  // Step 2 — payment
  const [paymentMethod, setPaymentMethod] = useState("");

  // Derived amounts
  const subtotal = cartItems.reduce((s, i) => {
    const price = Number(i?.salePrice > 0 ? i.salePrice : i?.price) || 0;
    return s + price * (Number(i?.quantity) || 1);
  }, 0);
  const [discount, setDiscount] = useState(null); // { code, discountAmount, message }
  const discountAmount   = discount?.discountAmount || 0;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee || 0;
  const totalAmount      = subtotal - discountAmount + finalDeliveryFee;

  // Fetch counties & saved addresses on mount
  useEffect(() => {
    dispatch(fetchCounties());
    if (user?.id) dispatch(fetchAllAddresses(user.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // ── Saved address selection ─────────────────────────────────────────────────
  const handleSelectSavedAddress = (saved) => {
    setSelectedSavedAddress(saved);
    setUseNewAddress(false);
    setAddress({
      county:          saved.county          || "",
      subCounty:       saved.subCounty       || "",
      location:        saved.location        || "",
      specificAddress: saved.specificAddress || "",
      phone:           saved.phone           || "",
      notes:           saved.notes           || "",
    });
    setDeliveryFee(saved.deliveryFee || 0);
    setIsFreeDelivery(saved.isFreeDelivery || saved.deliveryFee === 0);
  };

  const handleUseNewAddress = () => {
    setSelectedSavedAddress(null);
    setUseNewAddress(true);
    setAddress({ county: "", subCounty: "", location: "", specificAddress: "", phone: "", notes: "" });
    setDeliveryFee(null);
    setIsFreeDelivery(false);
    dispatch(clearSubCounties());
    dispatch(clearLocations());
  };

  const handleDeleteSavedAddress = async (addressId) => {
    await dispatch(deleteAddress({ userId: user.id, addressId }));
    dispatch(fetchAllAddresses(user.id));
    if (selectedSavedAddress?._id === addressId) handleUseNewAddress();
    toast({ title: "Address deleted" });
  };

  // ── Address cascades ────────────────────────────────────────────────────────
  const handleCountyChange = (county) => {
    setAddress((a) => ({ ...a, county, subCounty: "", location: "" }));
    setDeliveryFee(null); setIsFreeDelivery(false);
    dispatch(clearSubCounties());
    if (county) dispatch(fetchSubCounties(county));
  };

  const handleSubCountyChange = (subCounty) => {
    setAddress((a) => ({ ...a, subCounty, location: "" }));
    setDeliveryFee(null); setIsFreeDelivery(false);
    dispatch(clearLocations());
    if (subCounty && address.county)
      dispatch(fetchLocations({ county: address.county, subCounty }));
  };

  const handleLocationChange = (locationName) => {
    setAddress((a) => ({ ...a, location: locationName }));
    const loc = locations.find((l) => l.location === locationName);
    if (loc) { setDeliveryFee(loc.deliveryFee); setIsFreeDelivery(loc.isFreeDelivery); }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateAddress = () => {
    if (!address.county)    { toast({ title: "Please select a county",            variant: "destructive" }); return false; }
    if (!address.subCounty) { toast({ title: "Please select a sub-county",        variant: "destructive" }); return false; }
    if (!address.location)  { toast({ title: "Please select a delivery location", variant: "destructive" }); return false; }
    if (!address.phone || address.phone.length < 9) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" }); return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!paymentMethod) { toast({ title: "Please select a payment method", variant: "destructive" }); return false; }
    return true;
  };

  // ── Optionally save address ─────────────────────────────────────────────────
  const maybeSaveAddress = async () => {
    if (!saveThisAddress || !useNewAddress) return;
    const canSave = (addressList || []).length < MAX_SAVED_ADDRESSES;
    if (!canSave) return;

    try {
      const loc = locations.find((l) => l.location === address.location);
      await dispatch(addNewAddress({
        userId:          user.id,
        county:          address.county,
        subCounty:       address.subCounty,
        location:        address.location,
        specificAddress: address.specificAddress,
        address:         [address.specificAddress, address.location, address.subCounty, address.county].filter(Boolean).join(", "),
        phone:           address.phone,
        notes:           address.notes,
        deliveryFee:     loc?.deliveryFee     || 0,
        isFreeDelivery:  loc?.isFreeDelivery  || false,
      }));
      dispatch(fetchAllAddresses(user.id));
    } catch (e) {
      console.warn("Address save failed (non-fatal):", e);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      await maybeSaveAddress();

      const baseOrderPayload = {
        userId:    user?.id,
        cartItems: cartItems.map((i) => ({
          productId: i.productId,
          title:     i.title,
          image:     i.image,
          price:     i.salePrice > 0 ? i.salePrice : i.price,
          quantity:  i.quantity,
        })),
        addressInfo: {
          ...address,
          fullAddress: [
            address.specificAddress,
            address.location,
            address.subCounty,
            address.county,
          ].filter(Boolean).join(", "),
        },
        paymentMethod,
        paymentStatus:  "pending",
        orderStatus:    "pending",
        totalAmount,
        subtotalAmount: subtotal,
        discountCode:   discount?.code || undefined,
        discountAmount,
        deliveryFee:    finalDeliveryFee,
        orderDate:      new Date().toISOString(),
      };

      // ── COD ─────────────────────────────────────────────────────────────────
      if (paymentMethod === "cod") {
        const res = await axios.post(
          `${API_BASE_URL}/api/shop/order/create`,
          baseOrderPayload,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(clearCart());
          setPlacedOrder({ ...baseOrderPayload, _id: res.data.orderId });
          setStep(4);
        } else {
          throw new Error(res.data.message || "Failed to place order");
        }
      }

      // ── PAYSTACK (M-Pesa / Card / Airtel Money — one hosted checkout) ────────
      else if (paymentMethod === "paystack") {
        const res = await axios.post(
          `${API_BASE_URL}/api/shop/paystack/initialize`,
          {
            userId:         user?.id,
            email:          user?.email,
            cartItems:      baseOrderPayload.cartItems,
            addressInfo:    baseOrderPayload.addressInfo,
            discountCode:   discount?.code || undefined,
            totalAmount,
            subtotalAmount: subtotal,
            deliveryFee:    finalDeliveryFee,
          },
          { withCredentials: true }
        );
        if (res.data.success && res.data.authorizationUrl) {
          dispatch(clearCart());
          sessionStorage.setItem("pendingOrderId", res.data.orderId);
          sessionStorage.setItem("pendingOrderReference", res.data.reference);
          window.location.href = res.data.authorizationUrl;
        } else {
          throw new Error(res.data.message || "Could not start online payment");
        }
      }

    } catch (err) {
      toast({
        title:   err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildWhatsAppLink = () => {
    const orderId = placedOrder?._id?.toString().slice(-8).toUpperCase() || "NEW";

    const itemLines = cartItems
      .map((item) => {
        const price = Number(item?.salePrice > 0 ? item.salePrice : item?.price) || 0;
        const quantity = Number(item?.quantity) || 1;
        return `• ${quantity}x ${item?.title || "Product"} — ${formatKES(price * quantity)}`;
      })
      .join("\n");

    const msg = encodeURIComponent(
      `Hi Rekker! I just placed order #${orderId}.\n\n` +
      `${itemLines}\n\n` +
      `Subtotal: ${formatKES(subtotal)}\n` +
      `Delivery: ${finalDeliveryFee === 0 ? "Free" : formatKES(finalDeliveryFee)}\n` +
      `Total: ${formatKES(totalAmount)}\n\n` +
      `Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online (Paystack)"}\n` +
      `Delivery to: ${address.location}, ${address.subCounty}, ${address.county}`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  // ── Loading / empty states ──────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Getting your checkout ready…</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step < 4) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-secondary"><ShoppingCart className="h-9 w-9 text-muted-foreground" /></div>
          <h2 className="font-display text-2xl font-bold text-ink">Your cart is empty</h2>
          <p className="mb-6 mt-2 text-muted-foreground">Add a few products and come back to check out.</p>
          <button onClick={() => navigate("/products")} className="rounded-full bg-primary px-8 py-3 font-bold text-primary-foreground">Continue shopping</button>
        </div>
      </div>
    );
  }

  const savedAddresses = addressList || [];
  const canSaveMore = savedAddresses.length < MAX_SAVED_ADDRESSES;
  const hasFee = deliveryFee !== null && !!address.location;
  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const next = (n) => { setStep(n); goTop(); };
  const summaryProps = { cartItems, subtotal, discount, discountAmt: discountAmount, deliveryFee: finalDeliveryFee, isFree: isFreeDelivery, hasFee, total: totalAmount, onDiscountChange: setDiscount };
  const orderRef = placedOrder?._id ? placedOrder._id.toString().slice(-8).toUpperCase() : null;

  // ═════════════════════════ SUCCESS ═════════════════════════════════════════
  if (step === 4) {
    return (
      <div className="min-h-screen bg-secondary/40 px-4 py-10 sm:py-16">
        <style>{`@keyframes pop{0%{transform:scale(.4);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}@keyframes draw{to{stroke-dashoffset:0}}`}</style>
        <div className="mx-auto max-w-xl space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-black/5 sm:p-10">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-green-100" style={{ animation: "pop .55s ease-out both" }}>
              <svg viewBox="0 0 52 52" className="h-12 w-12"><path d="M14 27l8 8 16-17" fill="none" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="40" strokeDashoffset="40" style={{ animation: "draw .5s .35s ease-out forwards" }} /></svg>
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold text-ink">Thank you{user?.userName ? `, ${user.userName.split(" ")[0]}` : ""}!</h1>
            <p className="mt-2 text-muted-foreground">Your order is in and we're already getting it ready.</p>
            {orderRef && <p className="mt-4 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold tracking-wider text-ink">ORDER #{orderRef}</p>}
            {paymentMethod === "cod" && (
              <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Please have <strong>{formatKES(totalAmount)}</strong> ready. Our team will call <strong>{address.phone}</strong> before delivery.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="mb-4 font-display text-lg font-bold text-ink">What happens next</h2>
            <ol className="space-y-4">
              {[[Mail, "Confirmation email", "We've sent your order details to your inbox."], [PackageCheck, "We pack your order", "You'll get an email when it's on its way."], [Truck, "Delivery", `Our rider will call ${address.phone} before arriving.`]].map(([I, t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><I className="h-5 w-5" /></span>
                  <div><p className="font-semibold text-ink">{i + 1}. {t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
                </li>
              ))}
            </ol>
          </div>

          <a href={buildWhatsAppLink()} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-full bg-[#25D366] font-bold text-white shadow-lg transition hover:brightness-105">
            <MessageCircle className="h-5 w-5" /> Message us about this order
          </a>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/account")} className="h-12 rounded-full border border-border bg-card font-semibold text-ink hover:bg-secondary">My orders</button>
            <button onClick={() => navigate("/products")} className="h-12 rounded-full bg-ink font-semibold text-ink-foreground hover:opacity-90">Keep shopping</button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════ CHECKOUT ════════════════════════════════════════
  return (
    <div className="min-h-screen bg-secondary/40">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate("/products")} className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary">
            <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Continue shopping</span><span className="sm:hidden">Back</span>
          </button>
          <h1 className="font-display text-2xl font-extrabold tracking-[0.18em] text-ink">REKKER</h1>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700"><Lock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Secure checkout</span><span className="sm:hidden">Secure</span></span>
        </div>
      </header>

      {/* Phones: collapsible summary with live total */}
      <div className="border-b border-border bg-card lg:hidden">
        <button onClick={() => setShowSummary((v) => !v)} className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-primary">
            <ShoppingCart className="h-4 w-4" /> {showSummary ? "Hide" : "Show"} order summary ({cartItems.length})
            <ChevronDown className={`h-4 w-4 transition ${showSummary ? "rotate-180" : ""}`} />
          </span>
          <span className="font-display text-lg font-bold text-ink">{formatKES(totalAmount)}</span>
        </button>
        {showSummary && <div className="mx-auto max-w-6xl px-4 pb-5"><Summary {...summaryProps} /></div>}
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="mb-8"><Progress step={step} onGo={next} /></div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">

            {/* ── 1 · DELIVERY ── */}
            <StepCard n={1} title="Delivery" icon={MapPin} step={step} onEdit={() => next(1)}
              summary={<>{address.location}, {address.subCounty}, {address.county} · {address.phone}</>}>

              {savedAddresses.length > 0 && (
                <div className="space-y-3">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink"><Bookmark className="h-4 w-4 text-primary" /> Your saved addresses</p>
                  <div className="grid gap-3">
                    {savedAddresses.map((sa) => (
                      <SavedAddressCard key={sa._id} address={sa} isSelected={selectedSavedAddress?._id === sa._id}
                        onSelect={() => handleSelectSavedAddress(sa)} onDelete={handleDeleteSavedAddress} />
                    ))}
                  </div>
                  <button onClick={handleUseNewAddress}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-semibold transition ${useNewAddress ? "border-primary bg-primary/5 text-primary" : "border-dashed border-border text-muted-foreground hover:border-ink/30"}`}>
                    <Plus className="h-4 w-4" /> Deliver somewhere else
                  </button>
                </div>
              )}

              {(useNewAddress || savedAddresses.length === 0) && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="County">
                      <select className={field} value={address.county} onChange={(e) => handleCountyChange(e.target.value)}>
                        <option value="">Select county</option>
                        {Array.isArray(counties) && counties.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Sub-county">
                      <select className={field} value={address.subCounty} onChange={(e) => handleSubCountyChange(e.target.value)} disabled={!address.county || subCounties.length === 0}>
                        <option value="">{deliveryLoading && address.county && !address.subCounty ? "Loading…" : "Select sub-county"}</option>
                        {Array.isArray(subCounties) && subCounties.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                  </div>

                  <Field label="Delivery area">
                    <select className={field} value={address.location} onChange={(e) => handleLocationChange(e.target.value)} disabled={!address.subCounty || locations.length === 0}>
                      <option value="">Select area</option>
                      {Array.isArray(locations) && locations.map((l) => (
                        <option key={l._id} value={l.location}>{l.location} — {l.isFreeDelivery ? "FREE delivery" : formatKES(l.deliveryFee)}</option>
                      ))}
                    </select>
                  </Field>

                  {address.location && (
                    <div className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold ${isFreeDelivery ? "bg-green-50 text-green-700" : "bg-secondary text-ink"}`}>
                      <Truck className="h-4 w-4" />
                      {isFreeDelivery ? "Great news — delivery to this area is FREE 🎉" : `Delivery to this area: ${formatKES(deliveryFee)}`}
                    </div>
                  )}

                  <Field label="Street / landmark" hint="Helps our rider find you faster (optional).">
                    <input className={field} placeholder="e.g. Near Total petrol station, blue gate" value={address.specificAddress}
                      onChange={(e) => setAddress((a) => ({ ...a, specificAddress: e.target.value }))} />
                  </Field>

                  <Field label="Phone number" hint="Our delivery team will call this number.">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input type="tel" inputMode="tel" autoComplete="tel" className={`${field} pl-11`} placeholder="0712 345 678" value={address.phone}
                        onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Delivery notes (optional)">
                    <textarea rows={2} className={`${field} h-auto py-3`} placeholder="Anything we should know?" value={address.notes}
                      onChange={(e) => setAddress((a) => ({ ...a, notes: e.target.value }))} />
                  </Field>

                  {canSaveMore ? (
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-secondary/50 p-3.5 text-sm font-medium text-ink">
                      <input type="checkbox" checked={saveThisAddress} onChange={(e) => setSaveThisAddress(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                      Save this address for next time
                    </label>
                  ) : (
                    <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">You've saved the maximum of {MAX_SAVED_ADDRESSES} addresses. Delete one to save this.</p>
                  )}
                </div>
              )}

              <PrimaryButton onClick={() => validateAddress() && next(2)}>Continue to payment</PrimaryButton>
            </StepCard>

            {/* ── 2 · PAYMENT ── */}
            <StepCard n={2} title="Payment" icon={CreditCard} step={step} onEdit={() => next(2)}
              summary={paymentMethod === "cod" ? "Pay on delivery" : "Pay online — M-Pesa / Card / Airtel Money"}>
              <div className="space-y-3">
                {[
                  { id: "paystack", Icon: Smartphone, title: "Pay now", desc: "M-Pesa, Visa / Mastercard or Airtel Money — secure checkout by Paystack.", badge: "Fastest", chips: ["M-PESA", "VISA", "MASTERCARD", "AIRTEL"] },
                  { id: "cod", Icon: Wallet, title: "Pay on delivery", desc: "Pay in cash when your order arrives.", chips: [] },
                ].map(({ id, Icon, title, desc, badge, chips }) => (
                  <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                    className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition sm:p-5 ${paymentMethod === id ? "border-primary bg-primary/5" : "border-border hover:border-ink/30"}`}>
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${paymentMethod === id ? "bg-primary text-primary-foreground" : "bg-secondary text-ink"}`}><Icon className="h-6 w-6" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-bold text-ink">{title}</span>
                        {badge && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold uppercase text-green-700">{badge}</span>}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{desc}</span>
                      {chips.length > 0 && <span className="mt-2 flex flex-wrap gap-1.5">{chips.map((c) => <span key={c} className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-bold tracking-wider text-ink/70">{c}</span>)}</span>}
                    </span>
                    <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${paymentMethod === id ? "border-primary" : "border-border"}`}>
                      {paymentMethod === id && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                  </button>
                ))}
              </div>
              <PrimaryButton onClick={() => validatePayment() && next(3)}>Review my order</PrimaryButton>
            </StepCard>

            {/* ── 3 · REVIEW ── */}
            <StepCard n={3} title="Review & place order" icon={ClipboardList} step={step} onEdit={() => next(3)} summary="">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink"><MapPin className="h-4 w-4 text-primary" /> Delivering to</p>
                  <p className="text-muted-foreground">{address.location}, {address.subCounty}, {address.county}</p>
                  {address.specificAddress && <p className="text-muted-foreground">{address.specificAddress}</p>}
                  <p className="text-muted-foreground">{address.phone}</p>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-4 text-sm">
                  <p className="mb-1 flex items-center gap-1.5 font-semibold text-ink"><CreditCard className="h-4 w-4 text-primary" /> Payment</p>
                  <p className="text-muted-foreground">{paymentMethod === "cod" ? "Pay on delivery" : "Pay online — M-Pesa / Card / Airtel Money"}</p>
                </div>
              </div>

              <div className="lg:hidden"><DiscountBox cartItems={cartItems} discount={discount} onChange={setDiscount} /></div>
              <Lines cartItems={cartItems} />
              <Totals {...summaryProps} />

              <PrimaryButton onClick={handlePlaceOrder} disabled={isSubmitting}>
                {isSubmitting ? (<><Loader2 className="h-5 w-5 animate-spin" /> {paymentMethod === "paystack" ? "Taking you to payment…" : "Placing your order…"}</>)
                  : paymentMethod === "paystack" ? (<><Lock className="h-4 w-4" /> Pay {formatKES(totalAmount)}</>)
                  : (<>Place order · {formatKES(totalAmount)}</>)}
              </PrimaryButton>
              <p className="text-center text-xs text-muted-foreground">
                {paymentMethod === "paystack" ? "You'll be redirected to Paystack's secure page to finish paying." : "No payment needed now — you pay when your order arrives."}
              </p>
            </StepCard>
          </div>

          {/* Desktop summary */}
          <div className="hidden lg:block"><Summary {...summaryProps} /></div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
