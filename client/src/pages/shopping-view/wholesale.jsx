// client/src/pages/shopping-view/wholesale.jsx — /wholesale
// Trade application for stockists, wholesalers and distributors: location, order
// lines per brand and a live minimum-order (MOQ) check. Submissions land in
// Admin → Wholesale Requests and the team is alerted by email / dashboard bell.
import { Percent, Store, Truck, BadgeCheck, MessageCircle } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import useSeo from "@/hooks/use-seo";
import TradeRequestForm from "@/components/shopping-view/trade-request-form";

export default function Wholesale() {
  useSeo({ title: "Stockist, Wholesale & Distributor Applications | Rekker Kenya", description: "Stock or distribute Rekker, Saffron Milan, Cornells, Bio Saff and PetCare. Apply for a trade account — trade pricing and delivery across Kenya.", path: "/wholesale" });
  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 text-center">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide">Stockists · Wholesalers · Distributors</span>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Stock or distribute Rekker brands</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/80">Tell us where you are and what you want to order. Every brand has a minimum order quantity — the form checks it as you go.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 py-10 lg:grid-cols-[1fr_340px]">
        <TradeRequestForm apiBase={API_BASE_URL} source="shop" />

        <aside className="space-y-4">
          {[[Percent, "Trade pricing", "Better margins than retail on every brand."], [Truck, "Delivery across Kenya", "Reliable supply straight to your shop."], [BadgeCheck, "Authentic, in-date stock", "Manufactured and distributed by Rekker."], [Store, "Built for trade", "Supermarkets, salons, chemists, wholesalers and regional distributors."]].map(([Icon, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <div><p className="font-semibold text-ink">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
          <a href="https://wa.me/254796183064?text=Hi%20Rekker%2C%20I%27d%20like%20a%20trade%20account" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 font-semibold text-white hover:bg-green-700"><MessageCircle className="h-5 w-5" /> Prefer WhatsApp?</a>
        </aside>
      </div>
    </div>
  );
}
