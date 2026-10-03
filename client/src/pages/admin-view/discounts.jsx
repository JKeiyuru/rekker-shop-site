// client/src/pages/admin-view/discounts.jsx — Admin → Discount Codes
// For influencer / campaign codes: choose what the code works on (everything,
// or only chosen categories / brands / products), how much it takes off, and
// limits. The table shows how often each code was used and the sales it brought.
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Copy, Loader2, Pencil, Plus, Search, Shuffle, Tag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/config.js";

const api = `${API_BASE_URL}/api/admin/discounts`;
const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const errMsg = (e, f) => e?.response?.data?.message || f;
const toLocalInput = (d) => { if (!d) return ""; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };
const STATE = { live: ["Live", "bg-green-100 text-green-800"], off: ["Off", "bg-gray-100 text-gray-600"], expired: ["Expired", "bg-red-100 text-red-700"], scheduled: ["Scheduled", "bg-blue-100 text-blue-700"], "used-up": ["Used up", "bg-amber-100 text-amber-800"] };
const SCOPES = [["all", "Everything in the shop"], ["categories", "Only certain categories (e.g. Shampoo)"], ["brands", "Only certain brands"], ["products", "Only specific products"]];
const randomCode = (name) => `${(name || "REKKER").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 8) || "REKKER"}${10 + Math.floor(Math.random() * 40)}`;

const empty = { code: "", influencerName: "", description: "", type: "percent", value: "", maxDiscountAmount: "", appliesTo: "all", productIds: [], categoryIds: [], brandIds: [], excludeSaleItems: false, minOrderAmount: "", usageLimit: "", perUserLimit: 1, startsAt: "", endsAt: "", isActive: true };

function Picker({ label, items, selected, onToggle, getLabel, hint }) {
  const [q, setQ] = useState("");
  const shown = items.filter((i) => getLabel(i).toLowerCase().includes(q.toLowerCase())).slice(0, 60);
  return (
    <div>
      <Label>{label}</Label>
      {hint && <p className="mb-1 text-xs text-gray-500">{hint}</p>}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const it = items.find((i) => i._id === id);
            return <span key={id} className="flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">{it ? getLabel(it) : "…"}<button type="button" onClick={() => onToggle(id)}><X className="h-3 w-3" /></button></span>;
          })}
        </div>
      )}
      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><Input className="pl-9" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="mt-1 max-h-40 divide-y overflow-y-auto rounded-lg border">
        {shown.map((i) => (
          <label key={i._id} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50">
            <input type="checkbox" checked={selected.includes(i._id)} onChange={() => onToggle(i._id)} />
            <span className="truncate">{getLabel(i)}</span>
          </label>
        ))}
        {shown.length === 0 && <p className="p-3 text-sm text-gray-500">Nothing found.</p>}
      </div>
    </div>
  );
}

export default function AdminDiscounts() {
  const { toast } = useToast();
  const [codes, setCodes] = useState([]);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    try {
      const [c, p, k, b] = await Promise.all([
        axios.get(`${api}/get`),
        axios.get(`${API_BASE_URL}/api/admin/products/get`),
        axios.get(`${API_BASE_URL}/api/admin/categories/get`),
        axios.get(`${API_BASE_URL}/api/admin/brands/get`).catch(() => ({ data: { data: [] } })),
      ]);
      setCodes(c.data.data || []); setProducts(p.data.data || []);
      setCats((k.data.data || []).filter((x) => x.source !== "legacy" && x.isActive !== false));
      setBrands(b.data.data || []);
    } catch (e) { toast({ title: "Could not load", description: errMsg(e, "Please refresh."), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const catName = useMemo(() => { const m = Object.fromEntries(cats.map((c) => [c._id, c])); return (c) => (c.parentId && m[c.parentId] ? `${m[c.parentId].name} › ${c.name}` : c.name); }, [cats]);
  const toggleIn = (key) => (id) => setForm((f) => ({ ...f, [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] }));

  function openNew() { setEditId(null); setForm(empty); setOpen(true); }
  function openEdit(d) {
    setEditId(d._id);
    setForm({ ...empty, ...d, value: d.value, maxDiscountAmount: d.maxDiscountAmount || "", minOrderAmount: d.minOrderAmount || "", usageLimit: d.usageLimit || "",
      productIds: (d.productIds || []).map((x) => x._id || x), categoryIds: (d.categoryIds || []).map((x) => x._id || x), brandIds: (d.brandIds || []).map((x) => x._id || x),
      startsAt: toLocalInput(d.startsAt), endsAt: toLocalInput(d.endsAt) });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...form, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
      if (editId) await axios.put(`${api}/edit/${editId}`, body); else await axios.post(`${api}/add`, body);
      toast({ title: editId ? "Code saved" : "Code created" }); setOpen(false); load();
    } catch (e) { toast({ title: "Couldn't save", description: errMsg(e, "Please try again."), variant: "destructive" }); }
    finally { setSaving(false); }
  }
  async function toggle(d) { try { await axios.put(`${api}/toggle/${d._id}`, { isActive: !d.isActive }); load(); } catch (e) { toast({ title: "Couldn't update", description: errMsg(e, ""), variant: "destructive" }); } }
  async function remove(d) {
    if (!window.confirm(`Delete the code ${d.code}?`)) return;
    try { await axios.delete(`${api}/delete/${d._id}`); load(); } catch (e) { toast({ title: `Can't delete ${d.code}`, description: errMsg(e, ""), variant: "destructive" }); }
  }
  function copy(d) {
    const text = `Use code ${d.code} at checkout on shop.rekker.co.ke and get ${d.type === "percent" ? `${d.value}% off` : `KES ${d.value} off`}${d.appliesTo === "all" ? "" : " selected products"}!${d.endsAt ? ` Valid until ${new Date(d.endsAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}.` : ""}`;
    navigator.clipboard?.writeText(text).then(() => toast({ title: "Copied — ready to send to the influencer", description: text }));
  }
  const scopeText = (d) => d.appliesTo === "all" ? "Everything" : d.appliesTo === "categories" ? (d.categoryIds || []).map((c) => c.name).join(", ") : d.appliesTo === "brands" ? (d.brandIds || []).map((b) => b.name).join(", ") : `${(d.productIds || []).length} product(s)`;

  const valid = form.code.trim().length >= 3 && Number(form.value) > 0 && (form.appliesTo === "all" || (form.appliesTo === "products" && form.productIds.length) || (form.appliesTo === "categories" && form.categoryIds.length) || (form.appliesTo === "brands" && form.brandIds.length));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold"><Tag className="h-7 w-7" /> Discount Codes</h1>
          <p className="mt-1 text-gray-600">Give a code to an influencer or run a campaign. Choose what it applies to and track what it earns you.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> New code</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
        : codes.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed py-16 text-center">
            <Tag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="font-medium">No codes yet</p>
            <p className="mb-4 text-sm text-gray-500">Example: code WANJIRU15 gives 15% off shampoos only — for an influencer who advertised shampoos.</p>
            <Button onClick={openNew}>Create your first code</Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Works on</th><th className="px-4 py-3">Used</th><th className="px-4 py-3">Sales / discount given</th><th className="px-4 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y">
                {codes.map((d) => {
                  const [label, cls] = STATE[d.state] || STATE.off;
                  return (
                    <tr key={d._id}>
                      <td className="px-4 py-3"><p className="font-mono font-bold">{d.code}</p><p className="text-xs text-gray-500">{d.influencerName || d.description || "—"}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span></td>
                      <td className="px-4 py-3 font-semibold">{d.type === "percent" ? `${d.value}%` : kes(d.value)}{d.maxDiscountAmount > 0 && <span className="block text-xs font-normal text-gray-500">max {kes(d.maxDiscountAmount)}</span>}</td>
                      <td className="max-w-[200px] px-4 py-3 text-gray-700"><p className="truncate">{scopeText(d)}</p>{d.minOrderAmount > 0 && <p className="text-xs text-gray-500">min order {kes(d.minOrderAmount)}</p>}</td>
                      <td className="px-4 py-3">{d.usedCount}{d.usageLimit > 0 ? ` / ${d.usageLimit}` : ""}</td>
                      <td className="px-4 py-3"><p>{kes(d.totalSalesValue)}</p><p className="text-xs text-gray-500">{kes(d.totalDiscountGiven)} given</p></td>
                      <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                        <Switch checked={d.isActive} onCheckedChange={() => toggle(d)} />
                        <Button variant="ghost" size="icon" title="Copy message to send" onClick={() => copy(d)}><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(d)}><Trash2 className="h-4 w-4" /></Button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit discount code" : "New discount code"}</DialogTitle>
            <DialogDescription>Customers type this code at checkout. Everything is checked on the server, so it can't be cheated.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Code *</Label>
                <div className="flex gap-2"><Input value={form.code} className="font-mono uppercase" placeholder="WANJIRU15" onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))} /><Button type="button" variant="outline" size="icon" title="Make one up" onClick={() => set("code", randomCode(form.influencerName))}><Shuffle className="h-4 w-4" /></Button></div>
                <p className="mt-1 text-xs text-gray-500">Letters and numbers, easy to say out loud.</p>
              </div>
              <div><Label>Given to (influencer / campaign)</Label><Input value={form.influencerName} placeholder="e.g. Wanjiru — TikTok" onChange={(e) => set("influencerName", e.target.value)} /></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Discount type</Label>
                <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={form.type} onChange={(e) => set("type", e.target.value)}><option value="percent">Percentage off (%)</option><option value="fixed">Fixed amount off (KES)</option></select>
              </div>
              <div><Label>{form.type === "percent" ? "Percent off *" : "KES off *"}</Label><Input type="number" min="0" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder={form.type === "percent" ? "15" : "200"} /></div>
              {form.type === "percent" && <div><Label>Max discount (KES)</Label><Input type="number" min="0" value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)} placeholder="No limit" /></div>}
            </div>

            <div className="space-y-3 rounded-xl border bg-gray-50 p-4">
              <div>
                <Label>What does this code work on?</Label>
                <select className="h-10 w-full rounded-md border bg-white px-3 text-sm" value={form.appliesTo} onChange={(e) => set("appliesTo", e.target.value)}>{SCOPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                <p className="mt-1 text-xs text-gray-500">The discount is taken only off the matching items in the cart — other items stay full price.</p>
              </div>
              {form.appliesTo === "categories" && <Picker label="Categories *" hint="Pick a main category to include everything inside it, or a subcategory (e.g. Shampoo) to be specific." items={cats} selected={form.categoryIds} onToggle={toggleIn("categoryIds")} getLabel={catName} />}
              {form.appliesTo === "brands" && <Picker label="Brands *" items={brands} selected={form.brandIds} onToggle={toggleIn("brandIds")} getLabel={(b) => b.name} />}
              {form.appliesTo === "products" && <Picker label="Products *" items={products} selected={form.productIds} onToggle={toggleIn("productIds")} getLabel={(p) => p.title} />}
              {form.appliesTo !== "all" || true ? (
                <div className="flex items-center justify-between rounded-lg border bg-white p-3"><div><p className="text-sm font-medium">Skip items already on sale</p><p className="text-xs text-gray-500">Don't stack this code on top of a sale price.</p></div><Switch checked={form.excludeSaleItems} onCheckedChange={(v) => set("excludeSaleItems", v)} /></div>
              ) : null}
              <p className="text-xs text-gray-500">Bundle deals are never discounted again by a code — they already have their own price.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div><Label>Minimum order (KES)</Label><Input type="number" min="0" value={form.minOrderAmount} onChange={(e) => set("minOrderAmount", e.target.value)} placeholder="None" /></div>
              <div><Label>Total uses allowed</Label><Input type="number" min="0" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Unlimited" /></div>
              <div><Label>Uses per customer</Label><Input type="number" min="0" value={form.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} /><p className="mt-1 text-xs text-gray-500">0 = unlimited</p></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Starts (optional)</Label><Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></div>
              <div><Label>Ends (optional)</Label><Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} /></div>
            </div>
            <div><Label>Internal note</Label><Input value={form.description} placeholder="Only your team sees this" onChange={(e) => set("description", e.target.value)} /></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Active</p><p className="text-xs text-gray-500">Switch off to stop the code working.</p></div><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!valid || saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editId ? "Save code" : "Create code"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
