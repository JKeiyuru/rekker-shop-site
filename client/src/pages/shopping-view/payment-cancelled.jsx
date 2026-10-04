/* eslint-disable react/no-unescaped-entities */
// client/src/pages/shopping-view/payment-cancelled.jsx — /payment-cancelled?order=<id>
// Shown when the customer presses "Cancel" on Paystack (or Paystack reports the
// payment as abandoned / failed). Calm, reassuring, and gives clear next steps:
// nothing was charged, the cart is untouched, and they can retry in one tap.
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { ArrowRight, CreditCard, Loader2, MessageCircle, ShieldCheck, ShoppingBag, Wallet } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import useSeo from "@/hooks/use-seo";

const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const WHATSAPP = "254796183064";

export default function PaymentCancelled() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const orderId = params.get("order");
  const reason = params.get("reason"); // "failed" when verify said so
  const [state, setState] = useState("loading"); // loading | cancelled | error
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  useSeo({ title: "Payment not completed | Rekker", description: "Your payment was not completed.", path: "/payment-cancelled", noindex: true });

  useEffect(() => {
    sessionStorage.removeItem("pendingOrderId");
    sessionStorage.removeItem("pendingOrderReference");
    if (!orderId) { setState("error"); setError("We couldn't tell which payment this was — but your cart is safe."); return; }
    axios.post(`${API_BASE_URL}/api/shop/paystack/cancel`, { orderId, userId: user?.id }, { withCredentials: true })
      .then(({ data }) => {
        if (data.alreadyPaid) { navigate(`/payment-success?reference=${data.reference || ""}`, { replace: true }); return; }
        setOrder(data.order); setState("cancelled");
      })
      .catch((e) => { setState("error"); setError(e.response?.data?.message || "Something went wrong, but your cart is safe."); });
  }, [orderId, user?.id, navigate]);

  const retry = useCallback(async () => {
    setRetrying(true); setRetryError("");
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/shop/paystack/retry`, { orderId, userId: user?.id }, { withCredentials: true });
      if (data.success) { window.location.href = data.authorizationUrl; return; }
      setRetryError(data.message || "Couldn't restart the payment.");
    } catch (e) {
      const d = e.response?.data;
      if (d?.alreadyPaid) { navigate("/account", { replace: true }); return; }
      setRetryError(d?.message || "Couldn't restart the payment. Please try again.");
      if (d?.needsCart) setOrder((o) => ({ ...o, needsCart: true }));
    }
    setRetrying(false);
  }, [orderId, user?.id, navigate]);

  if (state === "loading") {
    return <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Checking your payment…</p></div>;
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-xl shadow-black/5 sm:p-10">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-100"><CreditCard className="h-9 w-9 text-amber-600" /></div>
        <h1 className="mt-5 font-display text-2xl font-bold text-ink sm:text-3xl">
          {state === "error" ? "Something interrupted your payment" : reason === "failed" ? "Your payment didn't go through" : "Payment cancelled"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {state === "error" ? error : "No problem — you haven't been charged, and everything in your cart is still there."}
        </p>

        {state === "cancelled" && order && (
          <p className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-semibold text-ink">
            <ShoppingBag className="h-4 w-4 text-primary" /> {order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {kes(order.totalAmount)}
          </p>
        )}

        <div className="mt-7 space-y-3">
          {state === "cancelled" && !order?.needsCart && (
            <button onClick={retry} disabled={retrying} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60">
              {retrying ? <><Loader2 className="h-5 w-5 animate-spin" /> Opening payment…</> : <>Try payment again <ArrowRight className="h-4 w-4" /></>}
            </button>
          )}
          {retryError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{retryError}</p>}
          <button onClick={() => navigate(order?.needsCart ? "/cart" : "/checkout")} className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold transition ${order?.needsCart || state === "error" ? "bg-primary text-primary-foreground" : "border border-border text-ink hover:bg-secondary"}`}>
            {order?.needsCart ? "Review my cart" : <><Wallet className="h-4 w-4" /> Choose another way to pay</>}
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/cart" className="flex h-12 items-center justify-center rounded-full border border-border text-sm font-semibold text-ink hover:bg-secondary">Back to cart</Link>
            <Link to="/products" className="flex h-12 items-center justify-center rounded-full border border-border text-sm font-semibold text-ink hover:bg-secondary">Keep shopping</Link>
          </div>
        </div>

        <div className="mt-7 space-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2"><ShieldCheck className="h-4 w-4 text-green-600" /> If money left your account, it will be matched to your order automatically.</p>
          <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi Rekker! My payment didn't complete and I need help.")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-ink hover:text-primary">
            <MessageCircle className="h-4 w-4 text-[#25D366]" /> Need a hand? Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
