// client/src/pages/shopping-view/wholesale.jsx — /wholesale
// Trade enquiry form. Submissions land in Admin → Wholesale Requests and the
// team is alerted by email / dashboard bell straight away.
import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, Loader2, Percent, Store, Truck, BadgeCheck, MessageCircle } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import useSeo from "@/hooks/use-seo";

const TYPES = [["retail-shop", "Retail shop"], ["supermarket", "Supermarket / chain"], ["wholesaler", "Wholesaler / distributor"], ["salon-barber", "Salon / barbershop"], ["pharmacy", "Pharmacy / chemist"], ["institution", "School / hotel / institution"], ["online-seller", "Online seller"], ["other", "Other"]];
const VOLUMES = [["not-sure", "Not sure yet"], ["under-50k", "Under KES 50,000"], ["50k-200k", "KES 50,000 – 200,000"], ["200k-500k", "KES 200,000 – 500,000"], ["above-500k", "Above KES 500,000"]];
const BRANDS = ["Rekker", "Saffron Milan", "Cornells", "Bio Saff"];
const init = { businessName: "", contactName: "", email: "", phone: "", businessType: "retail-shop", county: "", town: "", kraPin: "", brandsInterested: [], productsInterested: "", estimatedMonthlyOrder: "not-sure", message: "", website: "" };

const field = "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
const Label = ({ children, req }) => <label className="mb-1 block text-sm font-medium text-ink">{children}{req && <span className="text-primary"> *</span>}</label>;

export default function Wholesale() {
  useSeo({ title: "Wholesale & Trade Accounts | Rekker Kenya", description: "Stock Rekker, Saffron Milan, Cornells and Bio Saff in your shop. Apply for a wholesale account — trade pricing and delivery across Kenya.", path: "/wholesale" });
  const [f, setF] = useState(init);
  const [counties, setCounties] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shop/delivery/counties`).then(({ data }) => setCounties((data.data || data.counties || []).map((c) => (typeof c === "string" ? c : c.name || c.county)).filter(Boolean))).catch(() => {});
  }, []);

  const toggleBrand = (b) => set("brandsInterested", f.brandsInterested.includes(b) ? f.brandsInterested.filter((x) => x !== b) : [...f.brandsInterested, b]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await axios.post(`${API_BASE_URL}/api/wholesale/submit`, { ...f, pageUrl: window.location.href });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again, or message us on WhatsApp.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
        <h1 className="mt-4 text-3xl font-black text-ink">Request received!</h1>
        <p className="mt-2 text-muted-foreground">Thank you, {f.contactName.split(" ")[0]}. Our trade team will contact you within 1–2 working days with pricing and minimum order details. We've also sent a confirmation to {f.email}.</p>
        <a href="/products" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white">Keep browsing</a>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 text-center">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide">Trade accounts</span>
          <h1 className="mt-4 text-4xl font-black sm:text-5xl">Stock Rekker brands in your shop</h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-white/80">Rekker, Saffron Milan, Cornells and Bio Saff — trade pricing, reliable supply and delivery across Kenya.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 py-10 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-ink">Apply for a wholesale account</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label req>Business name</Label><input className={field} required value={f.businessName} onChange={(e) => set("businessName", e.target.value)} /></div>
            <div><Label req>Your name</Label><input className={field} required value={f.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
            <div><Label req>Phone / WhatsApp</Label><input className={field} required inputMode="tel" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><Label req>Email</Label><input className={field} required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
            <div><Label>Type of business</Label><select className={field} value={f.businessType} onChange={(e) => set("businessType", e.target.value)}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div><Label>KRA PIN <span className="font-normal text-muted-foreground">(optional)</span></Label><input className={field} value={f.kraPin} onChange={(e) => set("kraPin", e.target.value.toUpperCase())} /></div>
            <div>
              <Label>County</Label>
              {counties.length ? (
                <select className={field} value={f.county} onChange={(e) => set("county", e.target.value)}><option value="">Select county</option>{counties.map((c) => <option key={c}>{c}</option>)}</select>
              ) : <input className={field} value={f.county} onChange={(e) => set("county", e.target.value)} />}
            </div>
            <div><Label>Town / area</Label><input className={field} value={f.town} onChange={(e) => set("town", e.target.value)} /></div>
          </div>

          <div>
            <Label>Which brands are you interested in?</Label>
            <div className="flex flex-wrap gap-2">
              {BRANDS.map((b) => (
                <button type="button" key={b} onClick={() => toggleBrand(b)} className={`rounded-full border px-4 py-2 text-sm transition ${f.brandsInterested.includes(b) ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary"}`}>{b}</button>
              ))}
            </div>
          </div>

          <div><Label>Expected monthly order</Label><select className={field} value={f.estimatedMonthlyOrder} onChange={(e) => set("estimatedMonthlyOrder", e.target.value)}>{VOLUMES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><Label>Products you want to stock</Label><textarea rows={2} className={field} placeholder="e.g. Saffron Milan hand wash and dishwashing liquid, Cornells hair care" value={f.productsInterested} onChange={(e) => set("productsInterested", e.target.value)} /></div>
          <div><Label>Anything else?</Label><textarea rows={3} className={field} value={f.message} onChange={(e) => set("message", e.target.value)} /></div>

          {/* honeypot: hidden from people, bots fill it in */}
          <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.website} onChange={(e) => set("website", e.target.value)} />

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-bold text-white transition hover:opacity-90 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Send wholesale request
          </button>
        </form>

        <aside className="space-y-4">
          {[[Percent, "Trade pricing", "Better margins than retail on every brand."], [Truck, "Delivery across Kenya", "Reliable supply straight to your shop."], [BadgeCheck, "Authentic, in-date stock", "Manufactured and distributed by Rekker."], [Store, "Built for retailers", "Supermarkets, salons, chemists and more."]].map(([Icon, t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <div><p className="font-semibold text-ink">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
          <a href="https://wa.me/254796183064?text=Hi%20Rekker%2C%20I%27d%20like%20a%20wholesale%20account" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3.5 font-semibold text-white hover:bg-green-700"><MessageCircle className="h-5 w-5" /> Prefer WhatsApp?</a>
        </aside>
      </div>
    </div>
  );
}
