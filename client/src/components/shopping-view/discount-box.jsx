/* eslint-disable react/prop-types */
// client/src/components/shopping-view/discount-box.jsx
// "Have a discount code?" — used in the checkout summary. The server checks
// the code against the real cart (some codes only work on selected products)
// and returns the exact amount saved.
import { useState } from "react";
import axios from "axios";
import { BadgeCheck, Loader2, Tag, X } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";

export default function DiscountBox({ cartItems = [], discount, onChange }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function apply(e) {
    e?.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/shop/discount/validate`,
        { code, cartItems: cartItems.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
        { withCredentials: true }
      );
      if (data.success) {
        onChange({ code: data.code, discountAmount: data.discountAmount, message: data.message });
        setCode("");
        setOpen(false);
      } else setError(data.message || "That code didn't work.");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't check that code. Please try again.");
    } finally { setBusy(false); }
  }

  if (discount) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
        <div className="flex gap-2">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">{discount.code}</p>
            <p className="text-xs text-green-700">{discount.message}</p>
          </div>
        </div>
        <button type="button" onClick={() => onChange(null)} aria-label="Remove code" className="rounded p-1 text-green-700 hover:bg-green-100"><X className="h-4 w-4" /></button>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm font-medium text-red-700 hover:underline">
          <Tag className="h-4 w-4" /> Have a discount code?
        </button>
      ) : (
        <form onSubmit={apply} className="space-y-1.5">
          <div className="flex gap-2">
            <input
              autoFocus value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
              placeholder="Enter code" maxLength={24} autoCapitalize="characters" autoComplete="off"
              className="h-10 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm uppercase tracking-wider outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
            <button type="submit" disabled={busy || !code.trim()} className="flex h-10 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
