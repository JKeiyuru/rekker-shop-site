// client/src/pages/admin-view/bundles.jsx — Admin → Bundle Deals
// A bundle is NOT a product: pick existing products, set one price. Stock is
// worked out from the products inside, so there's nothing extra to maintain.
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2, Package, Pencil, Plus, Search, Trash2, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ImagePicker from "@/components/admin-view/image-picker";
import { API_BASE_URL } from "@/config/config.js";

const api = `${API_BASE_URL}/api/admin/bundles`;
const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;
const unit = (p) => (p?.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p?.price || 0);
const errMsg = (e, f) => e?.response?.data?.message || f;
const toLocalInput = (d) => { if (!d) return ""; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };

const empty = { name: "", description: "", badge: "", items: [], price: "", images: [], startsAt: "", endsAt: "", maxPerOrder: "", isActive: true };
const STATE = { live: ["Live", "bg-green-100 text-green-800"], off: ["Off", "bg-gray-100 text-gray-600"], expired: ["Ended", "bg-red-100 text-red-700"], scheduled: ["Scheduled", "bg-blue-100 text-blue-700"] };

export default function AdminBundles() {
  const { toast } = useToast();
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, p] = await Promise.all([axios.get(`${api}/get`), axios.get(`${API_BASE_URL}/api/admin/products/get`)]);
      setBundles(b.data.data || []);
      setProducts(p.data.data || []);
    } catch (e) {
      toast({ title: "Could not load", description: errMsg(e, "Please refresh."), variant: "destructive" });
    } finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p._id, p])), [products]);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const separate = form.items.reduce((s, i) => s + unit(byId[i.productId]) * i.qty, 0);
  const price = Number(form.price) || 0;
  const saving$ = separate - price;
  const pct = separate > 0 && price > 0 ? Math.round((saving$ / separate) * 100) : 0;
  const totalUnits = form.items.reduce((n, i) => n + i.qty, 0);
  const canSave = form.name.trim() && totalUnits >= 2 && price > 0 && price < separate;

  function openNew() { setEditId(null); setForm(empty); setQ(""); setOpen(true); }
  function openEdit(b) {
    setEditId(b._id);
    setForm({
      name: b.name, description: b.description || "", badge: b.badge || "",
      items: b.productIds.map((i) => ({ productId: i.productId?._id || i.productId, qty: i.qty })),
      price: b.price, images: b.images || [], startsAt: toLocalInput(b.startsAt), endsAt: toLocalInput(b.endsAt),
      maxPerOrder: b.maxPerOrder || "", isActive: b.isActive,
    });
    setQ(""); setOpen(true);
  }

  const addItem = (p) => setForm((f) => {
    const ex = f.items.find((i) => i.productId === p._id);
    return { ...f, items: ex ? f.items.map((i) => (i.productId === p._id ? { ...i, qty: i.qty + 1 } : i)) : [...f.items, { productId: p._id, qty: 1 }] };
  });
  const setQty = (id, qty) => setForm((f) => ({ ...f, items: qty < 1 ? f.items.filter((i) => i.productId !== id) : f.items.map((i) => (i.productId === id ? { ...i, qty } : i)) }));

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => p.status !== "archived" && (!t || p.title?.toLowerCase().includes(t) || p.brand?.toLowerCase().includes(t))).slice(0, 30);
  }, [products, q]);

  async function save() {
    setSaving(true);
    try {
      const body = {
        ...form, price: Number(form.price), productIds: form.items,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        maxPerOrder: Number(form.maxPerOrder) || 0,
      };
      if (editId) await axios.put(`${api}/edit/${editId}`, body); else await axios.post(`${api}/add`, body);
      toast({ title: editId ? "Bundle saved" : "Bundle created" });
      setOpen(false); load();
    } catch (e) {
      toast({ title: "Couldn't save the bundle", description: errMsg(e, "Please try again."), variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function toggle(b) {
    try { await axios.put(`${api}/toggle/${b._id}`, { isActive: !b.isActive }); load(); }
    catch (e) { toast({ title: "Couldn't update", description: errMsg(e, ""), variant: "destructive" }); }
  }
  async function remove(b) {
    if (!window.confirm(`Delete the bundle "${b.name}"? The products inside are not affected.`)) return;
    try { await axios.delete(`${api}/delete/${b._id}`); load(); } catch (e) { toast({ title: "Couldn't delete", description: errMsg(e, ""), variant: "destructive" }); }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Package className="w-7 h-7" /> Bundle Deals</h1>
          <p className="text-gray-600 mt-1">Sell products together at one special price — no need to create a new product. Stock updates automatically.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New bundle</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        : bundles.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-xl">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="font-medium">No bundles yet</p>
            <p className="text-sm text-gray-500 mb-4">Example: "Family Care Pack" — 2 shampoos + 1 conditioner for KES 1,499 instead of KES 1,850.</p>
            <Button onClick={openNew}>Create your first bundle</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            {bundles.map((b) => {
              const [label, cls] = STATE[b.state] || STATE.off;
              const save = b.savings ?? Math.max(0, (b.compareAtPrice || 0) - b.price);
              return (
                <div key={b._id} className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-center">
                  <div className="flex -space-x-3">
                    {b.productIds.slice(0, 3).map((i, k) => (
                      <div key={k} className="h-14 w-14 rounded-lg border-2 border-white bg-gray-100 overflow-hidden">
                        {(i.productId?.image || i.productId?.images?.[0]) && <img src={i.productId.image || i.productId.images[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-[200px] flex-1">
                    <p className="font-semibold flex items-center gap-2 flex-wrap">{b.name} <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span></p>
                    <p className="text-xs text-gray-500 truncate">{b.productIds.map((i) => `${i.qty}× ${i.productId?.title || "removed product"}`).join(" + ")}</p>
                    <p className="text-sm mt-1"><b>{kes(b.price)}</b> <span className="text-gray-400 line-through">{kes(b.compareAtPrice)}</span> <span className="text-green-700 text-xs">save {kes(save)}</span></p>
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    <p className="text-lg font-bold text-gray-900">{b.available}</p>can be made
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    <p className="text-lg font-bold text-gray-900">{b.soldCount || 0}</p>sold
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={b.isActive} onCheckedChange={() => toggle(b)} />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(b)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit bundle" : "New bundle deal"}</DialogTitle>
            <DialogDescription>Pick the products, then set one price that's lower than buying them separately.</DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2"><Label>Bundle name *</Label><Input value={form.name} placeholder="e.g. Family Care Pack" onChange={(e) => set("name", e.target.value)} /></div>
              <div><Label>Badge</Label><Input value={form.badge} placeholder="e.g. Best value" maxLength={30} onChange={(e) => set("badge", e.target.value)} /></div>
            </div>

            <div>
              <Label>1. Add products *</Label>
              <div className="relative mt-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input className="pl-9" placeholder="Search products by name or brand…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="border rounded-lg mt-2 max-h-44 overflow-y-auto divide-y">
                {matches.length === 0 && <p className="text-sm text-gray-500 p-3">No products match.</p>}
                {matches.map((p) => (
                  <button type="button" key={p._id} onClick={() => addItem(p)} className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50">
                    <div className="h-9 w-9 rounded bg-gray-100 overflow-hidden shrink-0">{(p.image || p.images?.[0]) && <img src={p.image || p.images[0]} alt="" className="h-full w-full object-cover" />}</div>
                    <span className="flex-1 text-sm truncate">{p.title}</span>
                    <span className="text-xs text-gray-500">{kes(unit(p))}</span>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {form.items.length > 0 && (
              <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
                <p className="text-sm font-medium">In this bundle</p>
                {form.items.map((i) => {
                  const p = byId[i.productId];
                  return (
                    <div key={i.productId} className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2">
                      <span className="flex-1 text-sm truncate">{p?.title || "Product"}</span>
                      <span className="text-xs text-gray-500 w-24 text-right">{kes(unit(p) * i.qty)}</span>
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(i.productId, i.qty - 1)}>{i.qty === 1 ? <X className="w-3 h-3" /> : <Minus className="w-3 h-3" />}</Button>
                      <span className="w-6 text-center text-sm font-medium">{i.qty}</span>
                      <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => setQty(i.productId, i.qty + 1)}><Plus className="w-3 h-3" /></Button>
                    </div>
                  );
                })}
                <p className="text-sm text-right">Bought separately: <b>{kes(separate)}</b></p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 items-start">
              <div>
                <Label>2. Bundle price (KES) *</Label>
                <Input type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="What the customer pays" />
                {price > 0 && separate > 0 && (
                  price < separate
                    ? <p className="text-xs text-green-700 mt-1">Customer saves {kes(saving$)} ({pct}% off) 🎉</p>
                    : <p className="text-xs text-red-600 mt-1">Must be lower than {kes(separate)}, otherwise it isn't a deal.</p>
                )}
              </div>
              <div>
                <Label>Limit per order <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input type="number" min="0" value={form.maxPerOrder} onChange={(e) => set("maxPerOrder", e.target.value)} placeholder="Leave empty for no limit" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Starts <span className="text-gray-400 font-normal">(optional)</span></Label><Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></div>
              <div><Label>Ends <span className="text-gray-400 font-normal">(optional)</span></Label><Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} /></div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} placeholder="Why this bundle is great" onChange={(e) => set("description", e.target.value)} />
            </div>

            <div>
              <Label>Picture <span className="text-gray-400 font-normal">(optional — we use the product photos if empty)</span></Label>
              <ImagePicker aspect="aspect-[16/7]" value={form.images[0] || ""} onChange={(u) => set("images", u ? [u] : [])} label="Upload a bundle picture" />
              {form.items.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs text-gray-500">Or use one of the product photos:</p>
                  <div className="flex flex-wrap gap-2">
                    {form.items.map((i) => {
                      const p = byId[i.productId]; const src = p?.image || p?.images?.[0];
                      return src ? <button type="button" key={i.productId} onClick={() => set("images", [src])} title={p.title} className="h-14 w-14 overflow-hidden rounded-lg border-2 border-transparent hover:border-gray-900"><img src={src} alt="" className="h-full w-full object-cover" /></button> : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="text-sm font-medium">Active</p><p className="text-xs text-gray-500">Switch off to hide it from the shop.</p></div>
              <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!canSave || saving}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editId ? "Save bundle" : "Create bundle"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
