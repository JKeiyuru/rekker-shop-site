/* eslint-disable react/prop-types */
// TradeRequestForm — stockist / wholesaler / distributor application.
// Used on the shop (/wholesale) and the corporate site (/partnerships#apply).
// Brands and each brand's minimum order quantity (MOQ) come from the API
// (Admin → Brands → "Trade MOQ"); the server re-checks everything.
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

const COUNTIES = ["Baringo","Bomet","Bungoma","Busia","Elgeyo-Marakwet","Embu","Garissa","Homa Bay","Isiolo","Kajiado","Kakamega","Kericho","Kiambu","Kilifi","Kirinyaga","Kisii","Kisumu","Kitui","Kwale","Laikipia","Lamu","Machakos","Makueni","Mandera","Marsabit","Meru","Migori","Mombasa","Murang'a","Nairobi","Nakuru","Nandi","Narok","Nyamira","Nyandarua","Nyeri","Samburu","Siaya","Taita-Taveta","Tana River","Tharaka-Nithi","Trans Nzoia","Turkana","Uasin Gishu","Vihiga","Wajir","West Pokot"];
const KINDS = [["stockist", "Stockist / retailer", "I sell to shoppers from a shop, salon, pharmacy or online store."], ["wholesaler", "Wholesaler", "I buy in bulk and sell on to other traders."], ["distributor", "Regional distributor", "I want to cover a territory with my own warehouse, stock and delivery."]];
const BUSINESS = [["retail-shop", "Retail shop"], ["supermarket", "Supermarket / chain"], ["wholesaler", "Wholesale business"], ["salon-barber", "Salon / barbershop"], ["pharmacy", "Pharmacy / chemist"], ["institution", "School / hotel / institution"], ["online-seller", "Online seller"], ["other", "Other"]];
const FREQ = [["one-off", "One-off order"], ["weekly", "Weekly"], ["fortnightly", "Every two weeks"], ["monthly", "Monthly"]];
const PAY = [["prepay", "Pay before delivery (M-Pesa / bank)"], ["cash-on-delivery", "Cash on delivery"], ["credit-request", "I'd like to request credit terms"]];

const init = { requestType: "stockist", businessName: "", businessType: "retail-shop", kraPin: "", yearsInBusiness: "", contactName: "", phone: "", email: "", county: "", town: "", physicalAddress: "", deliveryAddress: "", sameDelivery: true, mapLink: "", orderFrequency: "monthly", paymentPreference: "prepay", currentSuppliers: "", territoryCounties: [], outletsServed: "", hasWarehouse: false, hasDeliveryVehicles: false, message: "", consent: false, website: "" };
let rowId = 1;
const newRow = () => ({ key: rowId++, brandSlug: "", productId: "", productName: "", quantity: "" });

const Label = ({ children, req }) => <label className="mb-1 block text-sm font-medium">{children}{req && <span className="text-primary"> *</span>}</label>;
// defined outside the form component so inputs keep focus while typing
const Section = ({ n, title, square, children }) => (
  <fieldset className="space-y-4">
    <legend className="mb-1 flex items-center gap-3 font-display text-lg font-bold"><span className={`grid h-7 w-7 place-items-center bg-primary text-xs text-primary-foreground ${square ? "" : "rounded-full"}`}>{n}</span>{title}</legend>
    {children}
  </fieldset>
);

export default function TradeRequestForm({ apiBase, source = "shop", square = false }) {
  const r = square ? "" : "rounded-lg";
  const field = `w-full ${r} border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`;
  const [cfg, setCfg] = useState({ brands: [], defaultMoq: 12 });
  const [f, setF] = useState(init);
  const [rows, setRows] = useState([newRow()]);
  const [products, setProducts] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    axios.get(`${apiBase}/api/wholesale/config`).then(({ data }) => setCfg(data.data)).catch(() => {});
  }, [apiBase]);

  async function loadProducts(slug) {
    if (!slug || products[slug]) return;
    setProducts((p) => ({ ...p, [slug]: [] }));
    try {
      const { data } = await axios.get(`${apiBase}/api/shop/products`, { params: { brand: slug, page: 1, limit: 100, sortBy: "newest" } });
      setProducts((p) => ({ ...p, [slug]: (data.data || []).map((x) => ({ id: x._id, title: x.title })) }));
    } catch { /* free-text fallback below */ }
  }
  const setRow = (key, patch) => setRows((rs) => rs.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  const moq = (slug) => cfg.brands.find((b) => b.slug === slug)?.moq || cfg.defaultMoq;
  const totals = useMemo(() => {
    const t = {};
    rows.forEach((x) => { if (x.brandSlug) t[x.brandSlug] = (t[x.brandSlug] || 0) + (Math.floor(Number(x.quantity)) || 0); });
    return t;
  }, [rows]);
  const brandsUsed = Object.keys(totals);
  const short = brandsUsed.filter((s) => totals[s] < moq(s));

  const problems = [];
  if (!brandsUsed.length) problems.push("Add at least one brand and quantity.");
  short.forEach((s) => problems.push(`${cfg.brands.find((b) => b.slug === s)?.name}: add ${moq(s) - totals[s]} more unit(s) to reach the minimum of ${moq(s)}.`));
  if (f.requestType === "distributor" && !f.territoryCounties.length) problems.push("Choose the counties you want to cover.");
  if (!f.consent) problems.push("Please tick the box to confirm your details are correct.");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (problems.length) { setError(problems[0]); return; }
    setBusy(true);
    try {
      const { sameDelivery, consent, ...rest } = f; // eslint-disable-line no-unused-vars
      const body = {
        ...rest, source,
        deliveryAddress: sameDelivery ? f.physicalAddress : f.deliveryAddress,
        yearsInBusiness: f.yearsInBusiness === "" ? null : Number(f.yearsInBusiness),
        outletsServed: f.outletsServed === "" ? null : Number(f.outletsServed),
        items: rows.filter((x) => x.brandSlug && Number(x.quantity) > 0).map((x) => ({ brandSlug: x.brandSlug, productId: x.productId, productName: x.productName, quantity: Number(x.quantity) })),
        pageUrl: window.location.href,
      };
      await axios.post(`${apiBase}/api/wholesale/submit`, body);
      setDone({ name: f.contactName.split(" ")[0], email: f.email });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  if (done) {
    return (
      <div className={`border border-border bg-background p-10 text-center ${r}`}>
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />
        <h3 className="mt-4 font-display text-2xl font-bold">Request received</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Thank you, {done.name}. Our trade team will review your order against stock and your area and contact you within 1–2 working days with pricing and delivery terms. A confirmation is on its way to {done.email}.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`space-y-9 border border-border bg-background p-5 sm:p-8 ${r}`}>
      <Section square={square} n="1" title="What kind of partner are you?">
        <div className="grid gap-3 sm:grid-cols-3">
          {KINDS.map(([v, t, d]) => (
            <button type="button" key={v} onClick={() => set("requestType", v)} className={`border p-4 text-left transition ${r} ${f.requestType === v ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary"}`}>
              <p className="font-semibold">{t}</p><p className="mt-1 text-xs text-muted-foreground">{d}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section square={square} n="2" title="Your business">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label req>Business name</Label><input className={field} required value={f.businessName} onChange={(e) => set("businessName", e.target.value)} /></div>
          <div><Label>Type of business</Label><select className={field} value={f.businessType} onChange={(e) => set("businessType", e.target.value)}>{BUSINESS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><Label>KRA PIN <span className="font-normal text-muted-foreground">(optional)</span></Label><input className={field} value={f.kraPin} onChange={(e) => set("kraPin", e.target.value.toUpperCase())} /></div>
          <div><Label>Years in business</Label><input className={field} type="number" min="0" max="100" value={f.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)} /></div>
          <div><Label req>Your name</Label><input className={field} required value={f.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
          <div><Label req>Phone / WhatsApp</Label><input className={field} required inputMode="tel" placeholder="07XX XXX XXX" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label req>Email</Label><input className={field} required type="email" value={f.email} onChange={(e) => set("email", e.target.value)} /></div>
        </div>
      </Section>

      <Section square={square} n="3" title="Where are you?">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label req>County</Label><select className={field} required value={f.county} onChange={(e) => set("county", e.target.value)}><option value="">Select county</option>{COUNTIES.map((c) => <option key={c}>{c}</option>)}</select></div>
          <div><Label req>Town / area</Label><input className={field} required value={f.town} onChange={(e) => set("town", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label req>Physical address (street, building, landmark)</Label><input className={field} required value={f.physicalAddress} onChange={(e) => set("physicalAddress", e.target.value)} /></div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={f.sameDelivery} onChange={(e) => set("sameDelivery", e.target.checked)} /> Deliver to this address</label>
          {!f.sameDelivery && <div className="sm:col-span-2"><Label req>Delivery address</Label><input className={field} required value={f.deliveryAddress} onChange={(e) => set("deliveryAddress", e.target.value)} /></div>}
          <div className="sm:col-span-2"><Label>Google Maps link <span className="font-normal text-muted-foreground">(optional, helps our drivers)</span></Label><input className={field} placeholder="https://maps.google.com/…" value={f.mapLink} onChange={(e) => set("mapLink", e.target.value)} /></div>
        </div>
      </Section>

      {f.requestType === "distributor" && (
        <Section square={square} n="4" title="Your distribution capacity">
          <div><Label req>Counties you want to cover</Label>
            <div className={`grid max-h-44 grid-cols-2 gap-1 overflow-y-auto border border-border p-3 text-sm sm:grid-cols-3 ${r}`}>
              {COUNTIES.map((c) => (
                <label key={c} className="flex items-center gap-2"><input type="checkbox" checked={f.territoryCounties.includes(c)} onChange={(e) => set("territoryCounties", e.target.checked ? [...f.territoryCounties, c] : f.territoryCounties.filter((x) => x !== c))} />{c}</label>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Outlets you currently serve</Label><input className={field} type="number" min="0" value={f.outletsServed} onChange={(e) => set("outletsServed", e.target.value)} /></div>
            <div className="space-y-2 pt-6 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.hasWarehouse} onChange={(e) => set("hasWarehouse", e.target.checked)} /> I have a warehouse / storage</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={f.hasDeliveryVehicles} onChange={(e) => set("hasDeliveryVehicles", e.target.checked)} /> I have delivery vehicles</label>
            </div>
          </div>
        </Section>
      )}

      <Section square={square} n={f.requestType === "distributor" ? "5" : "4"} title="What do you want to order?">
        <p className="text-sm text-muted-foreground">Each brand has a minimum order quantity (MOQ). Add the products and how many units of each.</p>
        <div className="space-y-3">
          {rows.map((x) => (
            <div key={x.key} className={`grid gap-2 border border-border p-3 sm:grid-cols-[1fr_1.4fr_110px_auto] ${r}`}>
              <select className={field} value={x.brandSlug} onChange={(e) => { setRow(x.key, { brandSlug: e.target.value, productId: "", productName: "" }); loadProducts(e.target.value); }}>
                <option value="">Brand…</option>
                {cfg.brands.map((b) => <option key={b.slug} value={b.slug}>{b.name} (min {b.moq})</option>)}
              </select>
              {(products[x.brandSlug] || []).length > 0 ? (
                <select className={field} value={x.productId} onChange={(e) => { const p = products[x.brandSlug].find((y) => y.id === e.target.value); setRow(x.key, { productId: e.target.value, productName: p?.title || "" }); }}>
                  <option value="">Any / whole range</option>
                  {products[x.brandSlug].map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              ) : <input className={field} placeholder="Product (optional)" value={x.productName} onChange={(e) => setRow(x.key, { productName: e.target.value })} />}
              <input className={field} type="number" min="1" placeholder="Units" value={x.quantity} onChange={(e) => setRow(x.key, { quantity: e.target.value })} />
              <button type="button" aria-label="Remove line" disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((y) => y.key !== x.key))} className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-primary disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setRows((rs) => [...rs, newRow()])} className={`inline-flex items-center gap-2 border border-border px-4 py-2 text-sm font-medium hover:border-primary ${r}`}><Plus className="h-4 w-4" /> Add another product</button>
        {brandsUsed.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {brandsUsed.map((s) => {
              const ok = totals[s] >= moq(s);
              return (
                <li key={s} className={`flex items-center justify-between px-3 py-2 text-sm ${r} ${ok ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
                  <span className="font-medium">{cfg.brands.find((b) => b.slug === s)?.name}</span>
                  <span>{totals[s]} / {moq(s)} min {ok ? "✓" : `— add ${moq(s) - totals[s]} more`}</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>How often will you order?</Label><select className={field} value={f.orderFrequency} onChange={(e) => set("orderFrequency", e.target.value)}>{FREQ.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><Label>Payment preference</Label><select className={field} value={f.paymentPreference} onChange={(e) => set("paymentPreference", e.target.value)}>{PAY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div className="sm:col-span-2"><Label>Who do you buy from today? <span className="font-normal text-muted-foreground">(optional)</span></Label><input className={field} value={f.currentSuppliers} onChange={(e) => set("currentSuppliers", e.target.value)} /></div>
          <div className="sm:col-span-2"><Label>Anything else we should know?</Label><textarea rows={3} className={field} value={f.message} onChange={(e) => set("message", e.target.value)} /></div>
        </div>
      </Section>

      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.website} onChange={(e) => set("website", e.target.value)} />
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} /> I confirm these details are correct and agree to be contacted by Rekker's trade team.</label>

      {(error || (problems.length > 0 && rows.some((x) => x.brandSlug))) && <p className={`bg-red-50 px-4 py-3 text-sm text-red-700 ${r}`}>{error || problems[0]}</p>}
      <button disabled={busy} className={`flex w-full items-center justify-center gap-2 bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-primary-foreground transition hover:opacity-90 disabled:opacity-60 ${square ? "" : "rounded-full"}`}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit trade request
      </button>
    </form>
  );
}
