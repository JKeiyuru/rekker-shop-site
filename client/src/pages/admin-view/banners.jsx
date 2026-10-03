// client/src/pages/admin-view/banners.jsx — Admin → Ads & Banners
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Eye, Loader2, Megaphone, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ImagePicker from "@/components/admin-view/image-picker";
import { API_BASE_URL } from "@/config/config.js";

const api = `${API_BASE_URL}/api/admin/banners`;
const errMsg = (e, f) => e?.response?.data?.message || f;
const toLocalInput = (d) => { if (!d) return ""; const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 16); };

const PLACEMENTS = {
  hero: { label: "Home page — big slider", help: "The large rotating banner at the top of the home page. Best image: 1600 × 700 px.", aspect: "aspect-[16/7]" },
  announcement: { label: "Top strip (announcement)", help: "A thin line above the menu, e.g. “Free delivery over KES 3,000”. No image needed.", aspect: "aspect-[16/3]" },
  tile: { label: "Home page — small tiles", help: "3–4 small promo tiles under the slider. Best image: 800 × 600 px.", aspect: "aspect-[4/3]" },
  wide: { label: "Home page — wide banner", help: "A full-width banner between sections. Best image: 1600 × 400 px.", aspect: "aspect-[4/1]" },
  listing: { label: "Products page banner", help: "Shown above the product list. Best image: 1600 × 300 px.", aspect: "aspect-[16/3]" },
};
const STATE = { live: ["Live", "bg-green-100 text-green-800"], off: ["Off", "bg-gray-100 text-gray-600"], expired: ["Ended", "bg-red-100 text-red-700"], scheduled: ["Scheduled", "bg-blue-100 text-blue-700"] };
const empty = { title: "", subtitle: "", placement: "hero", badge: "", ctaLabel: "Shop now", linkUrl: "/products", imageUrl: "", mobileImageUrl: "", bgColor: "#111111", textColor: "#ffffff", startsAt: "", endsAt: "", showCountdown: false, isActive: true };

export default function AdminBanners() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    try { const { data } = await axios.get(`${api}/get`); setItems(data.data || []); }
    catch (e) { toast({ title: "Could not load banners", description: errMsg(e, ""), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  function openNew(placement = "hero") { setEditId(null); setForm({ ...empty, placement }); setOpen(true); }
  function openEdit(b) {
    setEditId(b._id);
    setForm({ ...empty, ...b, startsAt: toLocalInput(b.startsAt), endsAt: toLocalInput(b.endsAt) });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...form, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null, endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
      if (editId) await axios.put(`${api}/edit/${editId}`, body); else await axios.post(`${api}/add`, body);
      toast({ title: editId ? "Banner saved" : "Banner created" });
      setOpen(false); load();
    } catch (e) { toast({ title: "Couldn't save", description: errMsg(e, "Please try again."), variant: "destructive" }); }
    finally { setSaving(false); }
  }
  async function toggle(b) { try { await axios.put(`${api}/edit/${b._id}`, { isActive: !b.isActive }); load(); } catch (e) { toast({ title: "Couldn't update", description: errMsg(e, ""), variant: "destructive" }); } }
  async function remove(b) {
    if (!window.confirm(`Delete the banner "${b.title}"?`)) return;
    try { await axios.delete(`${api}/delete/${b._id}`); load(); } catch (e) { toast({ title: "Couldn't delete", description: errMsg(e, ""), variant: "destructive" }); }
  }

  const P = PLACEMENTS[form.placement];
  const grouped = Object.keys(PLACEMENTS).map((k) => ({ key: k, list: items.filter((b) => b.placement === k) }));

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Megaphone className="w-7 h-7" /> Ads &amp; Banners</h1>
          <p className="text-gray-600 mt-1">Promote offers, new arrivals and campaigns on the shop. Schedule them ahead and they switch on and off by themselves.</p>
        </div>
        <Button onClick={() => openNew()} className="gap-2"><Plus className="w-4 h-4" /> New banner</Button>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div> : (
        <div className="space-y-6">
          {grouped.map(({ key, list }) => (
            <section key={key}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="font-semibold">{PLACEMENTS[key].label}</h2>
                  <p className="text-xs text-gray-500">{PLACEMENTS[key].help}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openNew(key)} className="gap-1"><Plus className="w-3.5 h-3.5" /> Add</Button>
              </div>
              {list.length === 0 ? <p className="text-sm text-gray-400 border border-dashed rounded-lg px-4 py-4">Nothing here yet.</p> : (
                <div className="grid gap-2">
                  {list.map((b) => {
                    const [label, cls] = STATE[b.state] || STATE.off;
                    const ctr = b.views ? ((b.clicks / b.views) * 100).toFixed(1) : "0.0";
                    return (
                      <div key={b._id} className="bg-white border rounded-xl p-3 flex flex-wrap items-center gap-3">
                        <div className="h-14 w-28 rounded-md overflow-hidden border shrink-0 flex items-center justify-center text-[10px] text-center px-1" style={{ background: b.bgColor, color: b.textColor }}>
                          {b.imageUrl ? <img src={b.imageUrl} alt="" className="h-full w-full object-cover" /> : b.title}
                        </div>
                        <div className="min-w-[180px] flex-1">
                          <p className="font-medium text-sm flex items-center gap-2 flex-wrap">{b.title}<span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>{label}</span></p>
                          <p className="text-xs text-gray-500 truncate">{b.subtitle || b.linkUrl}</p>
                        </div>
                        <div className="text-xs text-gray-500 flex gap-4">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{b.views || 0}</span>
                          <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" />{b.clicks || 0} <span className="text-gray-400">({ctr}%)</span></span>
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
            </section>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit banner" : "New banner"}</DialogTitle>
            <DialogDescription>{P.help}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Where should it appear?</Label>
              <select className="w-full h-10 rounded-md border bg-white px-3 text-sm" value={form.placement} onChange={(e) => set("placement", e.target.value)}>
                {Object.entries(PLACEMENTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2"><Label>Headline *</Label><Input value={form.title} placeholder="e.g. Weekend Sale — up to 30% off" onChange={(e) => set("title", e.target.value)} /></div>
              <div><Label>Badge</Label><Input value={form.badge} maxLength={30} placeholder="-30%" onChange={(e) => set("badge", e.target.value)} /></div>
            </div>
            {form.placement !== "announcement" && <div><Label>Sub-headline</Label><Input value={form.subtitle} placeholder="One short line of detail" onChange={(e) => set("subtitle", e.target.value)} /></div>}

            {form.placement !== "announcement" && (
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label>Image</Label>
                  <ImagePicker aspect={P.aspect} value={form.imageUrl} onChange={(u) => set("imageUrl", u)} label="Upload banner image" />
                </div>
                {form.placement === "hero" && (
                  <div>
                    <Label>Phone version <span className="text-gray-400 font-normal">(optional)</span></Label>
                    <ImagePicker aspect="aspect-square" value={form.mobileImageUrl} onChange={(u) => set("mobileImageUrl", u)} label="Square crop" hint="1000 × 1000" />
                  </div>
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Button text</Label><Input value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} /></div>
              <div>
                <Label>Where does it link to?</Label>
                <Input value={form.linkUrl} placeholder="/products?category=hair-care" onChange={(e) => set("linkUrl", e.target.value)} />
                <div className="flex flex-wrap gap-1 mt-1">
                  {[["All products", "/products"], ["Bundle deals", "/deals"], ["Wholesale", "/wholesale"]].map(([l, u]) => (
                    <button type="button" key={u} onClick={() => set("linkUrl", u)} className="text-xs px-2 py-0.5 rounded-full border hover:bg-gray-100">{l}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Background colour</Label><div className="flex gap-2"><input type="color" value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="h-10 w-12 rounded border" /><Input value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} /></div></div>
              <div><Label>Text colour</Label><div className="flex gap-2"><input type="color" value={form.textColor} onChange={(e) => set("textColor", e.target.value)} className="h-10 w-12 rounded border" /><Input value={form.textColor} onChange={(e) => set("textColor", e.target.value)} /></div></div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Starts <span className="text-gray-400 font-normal">(optional)</span></Label><Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} /></div>
              <div><Label>Ends <span className="text-gray-400 font-normal">(optional)</span></Label><Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Show countdown</p><p className="text-xs text-gray-500">“Ends in 2d 04h” (needs an end date)</p></div><Switch checked={form.showCountdown} onCheckedChange={(v) => set("showCountdown", v)} /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><div><p className="text-sm font-medium">Active</p><p className="text-xs text-gray-500">Switch off to hide.</p></div><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editId ? "Save banner" : "Create banner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
