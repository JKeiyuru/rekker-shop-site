// client/src/pages/admin-view/categories.jsx
// Admin → Categories. Built so someone on their first day can use it:
// plain-language labels, examples everywhere, a Google preview for the SEO
// fields, and a one-click "Tidy up" for the old per-brand categories.
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDown, ArrowUp, ChevronDown, ChevronRight, Eye, EyeOff, FolderTree, HelpCircle, Home,
  Loader2, Pencil, Plus, Sparkles, Trash2, Wand2,
} from "lucide-react";
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

const api = `${API_BASE_URL}/api/admin/categories`;
const slugify = (v) => String(v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

const emptyForm = { name: "", slug: "", parentId: "", description: "", image: "", seoTitle: "", seoDescription: "", isActive: true, showOnHome: false };

function Counter({ value, max }) {
  const n = (value || "").length;
  return <span className={`text-xs ${n > max ? "text-red-600" : "text-gray-400"}`}>{n}/{max}</span>;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [showOld, setShowOld] = useState(false);

  const [dialog, setDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tidyOpen, setTidyOpen] = useState(false);
  const [tidy, setTidy] = useState(null);
  const [tidyBusy, setTidyBusy] = useState(false);
  const [tidyNeeded, setTidyNeeded] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${api}/get`);
      setCats(data.data || []);
    } catch (e) {
      toast({ title: "Could not load categories", description: errMsg(e, "Please refresh."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkTidy = useCallback(async () => {
    try {
      const { data } = await axios.get(`${api}/tidy/preview`);
      setTidy(data.data);
      setTidyNeeded(!!data.data?.needed);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { load(); checkTidy(); }, [load, checkTidy]);

  const live = useMemo(() => cats.filter((c) => c.source !== "legacy"), [cats]);
  const old = useMemo(() => cats.filter((c) => c.source === "legacy"), [cats]);
  const mains = live.filter((c) => !c.parentId).sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
  const subsOf = (id) => live.filter((c) => String(c.parentId) === String(id)).sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name));
  const totalProductsIn = (main) => (main.productCount || 0);

  function openNew(parentId = "") {
    setEditId(null);
    setForm({ ...emptyForm, parentId });
    setSlugTouched(false);
    setDialog(true);
  }
  function openEdit(c) {
    setEditId(c._id);
    setForm({
      name: c.name || "", slug: c.slug || "", parentId: c.parentId || "", description: c.description || "",
      image: c.image || "", seoTitle: c.seoTitle || "", seoDescription: c.seoDescription || "",
      isActive: c.isActive !== false, showOnHome: !!c.showOnHome,
    });
    setSlugTouched(true);
    setDialog(true);
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name.trim()) return toast({ title: "Please type a name", description: "For example: Hair Care", variant: "destructive" });
    setSaving(true);
    try {
      const body = { ...form, slug: form.slug || slugify(form.name), parentId: form.parentId || null };
      if (editId) await axios.put(`${api}/edit/${editId}`, body);
      else await axios.post(`${api}/add`, body);
      toast({ title: editId ? "Category saved" : "Category added" });
      setDialog(false);
      await load();
      checkTidy();
    } catch (e) {
      toast({ title: "Couldn't save", description: errMsg(e, "Please try again."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    try {
      await axios.put(`${api}/edit/${c._id}`, { isActive: !c.isActive });
      load();
    } catch (e) {
      toast({ title: "Couldn't update", description: errMsg(e, ""), variant: "destructive" });
    }
  }

  async function remove(c) {
    if (!window.confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    try {
      await axios.delete(`${api}/delete/${c._id}`);
      toast({ title: "Category deleted" });
      load();
    } catch (e) {
      toast({ title: `Can't delete "${c.name}"`, description: errMsg(e, "Please try again."), variant: "destructive" });
    }
  }

  async function move(list, index, dir) {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const ids = list.map((c) => c._id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    // optimistic
    setCats((prev) => prev.map((c) => (ids.includes(c._id) ? { ...c, sortOrder: (ids.indexOf(c._id) + 1) * 10 } : c)));
    try { await axios.put(`${api}/reorder`, { order: ids }); } catch { load(); }
  }

  async function applyTidy() {
    setTidyBusy(true);
    try {
      const { data } = await axios.post(`${api}/tidy/apply`);
      toast({ title: "Catalogue tidied up", description: `${data.data.productsMoved} products moved onto the new categories.` });
      setTidyOpen(false);
      await load();
      checkTidy();
    } catch (e) {
      toast({ title: "Tidy-up didn't finish", description: errMsg(e, "Nothing was deleted. You can safely try again."), variant: "destructive" });
    } finally {
      setTidyBusy(false);
    }
  }

  async function addStandard() {
    try { await axios.post(`${api}/standard/add`); toast({ title: "Standard categories added" }); load(); }
    catch (e) { toast({ title: "Couldn't add", description: errMsg(e, ""), variant: "destructive" }); }
  }

  const parent = live.find((c) => c._id === form.parentId);
  const previewTitle = form.seoTitle || (form.name ? `${form.name} — Shop Online in Kenya | Rekker` : "Page title");
  const previewDesc = form.seoDescription || form.description || "Add a short description so shoppers know what they'll find here.";
  const previewUrl = `shop.rekker.co.ke › products › ${form.slug || slugify(form.name) || "category-name"}`;

  const moves = tidy?.report?.moves ? Object.entries(tidy.report.moves).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><FolderTree className="w-7 h-7" /> Categories</h1>
          <p className="text-gray-600 mt-1">The shelves shoppers browse — like "Hair Care" or "Home Care & Hygiene".</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowHelp((v) => !v)} className="gap-2"><HelpCircle className="w-4 h-4" /> How this works</Button>
          <Button onClick={() => openNew("")} className="gap-2"><Plus className="w-4 h-4" /> Add category</Button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 space-y-2">
          <p className="font-semibold">Categories in 30 seconds</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b>A category is a type of product, not a brand.</b> "Shampoo" is a category. "Cornells" is a brand — brands have their own page and their own filter.</li>
            <li><b>Two levels only.</b> A main category (Hair Care) can hold subcategories (Shampoo, Conditioner). Shoppers filter by main category, and can narrow to a subcategory.</li>
            <li><b>Every product lives in exactly one category.</b> Choose it when you add or edit a product.</li>
            <li><b>Can't delete a category that still has products?</b> Move the products first (Products → Edit), or just switch the category off with the eye icon — it disappears from the shop but nothing is lost.</li>
            <li><b>Use the arrows</b> to change the order categories appear on the website.</li>
            <li><b>SEO title &amp; description</b> are what Google shows in search results. Leave them empty and we'll make a good one for you.</li>
          </ul>
        </div>
      )}

      {tidyNeeded && (
        <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-5 flex flex-wrap items-center gap-4">
          <Wand2 className="w-8 h-8 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-[240px]">
            <p className="font-semibold text-amber-900">Your categories need a tidy-up</p>
            <p className="text-sm text-amber-800">
              There are old categories tied to individual brands (e.g. "Shampoo" four separate times, and ranges like "Super Foods" listed as categories).
              One click moves every product onto proper shared categories. Nothing is deleted.
            </p>
          </div>
          <Button onClick={() => { checkTidy(); setTidyOpen(true); }} className="gap-2 bg-amber-600 hover:bg-amber-700"><Sparkles className="w-4 h-4" /> Review &amp; tidy up</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : mains.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <FolderTree className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="font-medium">No categories yet</p>
          <p className="text-sm text-gray-500 mb-4">Start with our ready-made set (Hair Care, Body Care, Baby &amp; Kids…) or add your own.</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={addStandard} className="gap-2"><Sparkles className="w-4 h-4" /> Add the standard categories</Button>
            <Button variant="outline" onClick={() => openNew("")}>Add my own</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {mains.map((c, i) => {
            const subs = subsOf(c._id);
            const open = expanded[c._id] ?? false;
            return (
              <div key={c._id} className={`bg-white border rounded-xl overflow-hidden ${c.isActive ? "" : "opacity-60"}`}>
                <div className="flex items-center gap-3 p-3">
                  <button onClick={() => setExpanded((e) => ({ ...e, [c._id]: !open }))} className="p-1 text-gray-500 hover:text-gray-900" aria-label="Show subcategories">
                    {open ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {c.image ? <img src={c.image} alt="" className="h-full w-full object-cover" /> : <FolderTree className="w-5 h-5 text-gray-300" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate flex items-center gap-2">
                      {c.name}
                      {c.showOnHome && <Badge variant="secondary" className="gap-1"><Home className="w-3 h-3" />On home page</Badge>}
                      {!c.isActive && <Badge variant="outline">Hidden</Badge>}
                    </p>
                    <p className="text-xs text-gray-500">{totalProductsIn(c)} product{totalProductsIn(c) === 1 ? "" : "s"} · {subs.length} subcategor{subs.length === 1 ? "y" : "ies"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => move(mains, i, -1)} title="Move up"><ArrowUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" disabled={i === mains.length - 1} onClick={() => move(mains, i, 1)} title="Move down"><ArrowDown className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleActive(c)} title={c.isActive ? "Hide from website" : "Show on website"}>{c.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)} title="Edit"><Pencil className="w-4 h-4" /></Button>
                    {!c.isSystem && <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => remove(c)} title="Delete"><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                </div>

                {open && (
                  <div className="border-t bg-gray-50 px-3 py-2">
                    {subs.length === 0 && <p className="text-sm text-gray-500 py-2 pl-10">No subcategories yet.</p>}
                    {subs.map((s, j) => (
                      <div key={s._id} className={`flex items-center gap-3 py-2 pl-10 ${s.isActive ? "" : "opacity-60"}`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{s.name} {!s.isActive && <Badge variant="outline" className="ml-1">Hidden</Badge>}</p>
                          <p className="text-xs text-gray-500">{s.productCount || 0} product{s.productCount === 1 ? "" : "s"}</p>
                        </div>
                        <Button variant="ghost" size="icon" disabled={j === 0} onClick={() => move(subs, j, -1)}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" disabled={j === subs.length - 1} onClick={() => move(subs, j, 1)}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(s)}>{s.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                        {!s.isSystem && <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(s)}><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                    ))}
                    <div className="pl-10 py-2">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => openNew(c._id)}><Plus className="w-3.5 h-3.5" /> Add subcategory to {c.name}</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {old.length > 0 && (
        <div className="mt-8">
          <button onClick={() => setShowOld((v) => !v)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
            {showOld ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Old categories kept for reference ({old.length}) — hidden from the shop
          </button>
          {showOld && (
            <div className="mt-2 bg-white border rounded-xl divide-y">
              {old.map((c) => (
                <div key={c._id} className="flex items-center gap-3 px-4 py-2 text-sm">
                  <span className="flex-1 text-gray-600">{c.name} <span className="text-xs text-gray-400">({c.productCount || 0} products)</span></span>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => remove(c)}>Delete</Button>
                </div>
              ))}
              <p className="px-4 py-2 text-xs text-gray-500">Only empty ones can be deleted. Nothing here appears on the website.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / edit */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit category" : form.parentId ? "Add subcategory" : "Add category"}</DialogTitle>
            <DialogDescription>
              {form.parentId ? `This will sit inside "${parent?.name || "the main category"}".` : "A main category shoppers can click, like Hair Care."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input value={form.name} placeholder="e.g. Hair Care" onChange={(e) => { set("name", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
              <p className="text-xs text-gray-500 mt-1">What shoppers see. Keep it short and use words shoppers would search for.</p>
            </div>

            <div>
              <Label>Where does it go?</Label>
              <select className="w-full h-10 rounded-md border bg-white px-3 text-sm" value={form.parentId || ""} onChange={(e) => set("parentId", e.target.value)}
                disabled={editId && subsOf(editId).length > 0}>
                <option value="">Main category (top level)</option>
                {mains.filter((m) => m._id !== editId).map((m) => <option key={m._id} value={m._id}>Inside: {m.name}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Choose "Main category" for things like Hair Care. Choose a main category to make this a subcategory, like Shampoo inside Hair Care.</p>
            </div>

            <div>
              <Label>Short description</Label>
              <Textarea rows={2} value={form.description} placeholder="e.g. Shampoos, conditioners and treatments for every hair type." onChange={(e) => set("description", e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Shown at the top of the category page.</p>
            </div>

            <div>
              <Label>Picture</Label>
              <ImagePicker value={form.image} onChange={(u) => set("image", u)} aspect="aspect-[16/7]" label="Upload a category picture" hint="Wide photo, at least 800 px across" />
              <p className="text-xs text-gray-500 mt-1">Used as the tile on the home page and the category page header.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="text-sm font-medium">Show on website</p><p className="text-xs text-gray-500">Switch off to hide without deleting.</p></div>
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
              </div>
              {!form.parentId && (
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium">Feature on home page</p><p className="text-xs text-gray-500">Adds a picture tile on the home page.</p></div>
                  <Switch checked={form.showOnHome} onCheckedChange={(v) => set("showOnHome", v)} />
                </div>
              )}
            </div>

            <div className="rounded-xl border p-4 space-y-3 bg-gray-50">
              <p className="font-medium text-sm">Google search appearance (SEO) <span className="text-gray-400 font-normal">— optional</span></p>
              <div className="bg-white rounded-lg border p-3">
                <p className="text-xs text-green-700 truncate">{previewUrl}</p>
                <p className="text-blue-700 text-base leading-snug truncate">{previewTitle}</p>
                <p className="text-sm text-gray-600 line-clamp-2">{previewDesc}</p>
              </div>
              <div>
                <div className="flex justify-between"><Label>SEO title</Label><Counter value={form.seoTitle} max={60} /></div>
                <Input value={form.seoTitle} placeholder={`${form.name || "Hair Care"} — Shop Online in Kenya | Rekker`} onChange={(e) => set("seoTitle", e.target.value)} />
              </div>
              <div>
                <div className="flex justify-between"><Label>SEO description</Label><Counter value={form.seoDescription} max={160} /></div>
                <Textarea rows={2} value={form.seoDescription} placeholder="One or two sentences that make people want to click." onChange={(e) => set("seoDescription", e.target.value)} />
              </div>
              <div>
                <Label>Web address ending (slug)</Label>
                <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} />
                <p className="text-xs text-gray-500 mt-1">Filled in automatically. Only change it if you know why — changing it breaks old links to this category.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{editId ? "Save changes" : "Add category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tidy-up */}
      <Dialog open={tidyOpen} onOpenChange={setTidyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5" /> Tidy up my categories</DialogTitle>
            <DialogDescription>Here's exactly what will happen. Nothing is deleted — old categories are only hidden.</DialogDescription>
          </DialogHeader>
          {!tidy ? <Loader2 className="w-6 h-6 animate-spin mx-auto my-8" /> : (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-3"><p className="text-2xl font-bold">{tidy.report.totalProducts}</p><p className="text-gray-500 text-xs">products</p></div>
                <div className="rounded-lg border p-3"><p className="text-2xl font-bold text-amber-600">{tidy.report.productsMoved}</p><p className="text-gray-500 text-xs">will be moved</p></div>
                <div className="rounded-lg border p-3"><p className="text-2xl font-bold text-green-600">{tidy.report.productsAlreadyCorrect}</p><p className="text-gray-500 text-xs">already correct</p></div>
              </div>
              {moves.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Moves</p>
                  <div className="border rounded-lg divide-y max-h-56 overflow-y-auto">
                    {moves.map(([k, n]) => <div key={k} className="px-3 py-1.5 flex justify-between gap-3"><span className="text-gray-700">{k}</span><span className="text-gray-500 shrink-0">{n}</span></div>)}
                  </div>
                </div>
              )}
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>{tidy.report.legacyCategoriesHidden} old brand-specific categories will be hidden from the shop.</li>
                {tidy.report.newCategories.length > 0 && <li>{tidy.report.newCategories.length} new standard categories will be created.</li>}
                <li>Cornells ranges like "Super Foods" are kept on each product as a "Range" label.</li>
              </ul>
              {tidy.report.unplaced.length > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <p className="font-medium text-amber-900">{tidy.report.unplaced.length} product(s) couldn't be placed automatically</p>
                  <p className="text-amber-800 text-xs mb-1">They'll go to "Uncategorised" — open each one in Products → Edit and pick the right category.</p>
                  <p className="text-xs text-amber-900">{tidy.report.unplaced.slice(0, 8).join(" · ")}{tidy.report.unplaced.length > 8 ? " …" : ""}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTidyOpen(false)}>Not now</Button>
            <Button onClick={applyTidy} disabled={tidyBusy || !tidy}>{tidyBusy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Tidy up now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
