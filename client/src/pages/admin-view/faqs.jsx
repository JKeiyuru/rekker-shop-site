// client/src/pages/admin-view/faqs.jsx — Admin → Chat & FAQs
// What the shop's chat assistant answers. Also shows the questions customers
// typed that it could NOT answer, so you can teach it with one click.
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { HelpCircle, Loader2, MessageCircleQuestion, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/config.js";

const api = `${API_BASE_URL}/api/admin/faqs`;
const errMsg = (e, f) => e?.response?.data?.message || f;
const empty = { question: "", answer: "", keywords: "", link: "", linkLabel: "", isActive: true };

export default function AdminFaqs() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(async () => {
    try { const { data } = await axios.get(`${api}/get`); setFaqs(data.data || []); setUnanswered(data.unanswered || []); }
    catch (e) { toast({ title: "Could not load", description: errMsg(e, ""), variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const openNew = (question = "") => { setEditId(null); setForm({ ...empty, question }); setOpen(true); };
  const openEdit = (f) => { setEditId(f._id); setForm({ ...empty, ...f, keywords: (f.keywords || []).join(", ") }); setOpen(true); };

  async function save() {
    setSaving(true);
    try {
      if (editId) await axios.put(`${api}/edit/${editId}`, form); else await axios.post(`${api}/add`, form);
      toast({ title: "Saved" });
      // if this answered a customer question, clear it from the unanswered list
      if (!editId) await axios.post(`${api}/dismiss`, { text: form.question }).catch(() => {});
      setOpen(false); load();
    } catch (e) { toast({ title: "Couldn't save", description: errMsg(e, ""), variant: "destructive" }); }
    finally { setSaving(false); }
  }
  async function remove(f) { if (!window.confirm("Delete this answer?")) return; await axios.delete(`${api}/delete/${f._id}`).catch(() => {}); load(); }
  async function toggle(f) { await axios.put(`${api}/edit/${f._id}`, { ...f, keywords: f.keywords, isActive: !f.isActive }).catch(() => {}); load(); }
  async function dismiss(text) { await axios.post(`${api}/dismiss`, { text }).catch(() => {}); load(); }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold"><HelpCircle className="h-7 w-7" /> Chat &amp; FAQs</h1>
          <p className="mt-1 text-gray-600">The answers your shop's chat assistant gives. Customers can always switch to WhatsApp for a real person.</p>
        </div>
        <Button onClick={() => openNew()} className="gap-2"><Plus className="h-4 w-4" /> New answer</Button>
      </div>

      {unanswered.length > 0 && (
        <section className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="flex items-center gap-2 font-semibold text-amber-900"><MessageCircleQuestion className="h-5 w-5" /> Questions the assistant couldn't answer</p>
          <p className="mb-3 text-sm text-amber-800">Customers asked these. Teach the assistant by adding an answer.</p>
          <div className="space-y-2">
            {unanswered.map((u) => (
              <div key={u._id} className="flex items-center gap-2 rounded-lg bg-white p-2.5 text-sm">
                <span className="flex-1">“{u.text}” {u.count > 1 && <span className="text-xs text-gray-500">· asked {u.count}×</span>}</span>
                <Button size="sm" onClick={() => openNew(u.text)}>Add answer</Button>
                <button onClick={() => dismiss(u.text)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100" title="Ignore"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div> : (
        <div className="space-y-2">
          {faqs.map((f) => (
            <div key={f._id} className={`rounded-xl border bg-white p-4 ${f.isActive ? "" : "opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{f.question}</p>
                  <p className="mt-1 text-sm text-gray-600">{f.answer}</p>
                  <p className="mt-1 text-xs text-gray-400">Shown {f.timesShown || 0}×{f.keywords?.length ? ` · triggers: ${f.keywords.slice(0, 8).join(", ")}` : ""}{f.link ? ` · link: ${f.link}` : ""}</p>
                </div>
                <Switch checked={f.isActive} onCheckedChange={() => toggle(f)} />
                <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(f)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit answer" : "New answer"}</DialogTitle><DialogDescription>Write it the way you'd say it to a customer — short and friendly.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>Question *</Label><Input value={form.question} maxLength={200} placeholder="e.g. Do you deliver outside Nairobi?" onChange={(e) => set("question", e.target.value)} /></div>
            <div><Label>Answer *</Label><Textarea rows={4} value={form.answer} maxLength={1500} onChange={(e) => set("answer", e.target.value)} /></div>
            <div><Label>Extra trigger words <span className="font-normal text-gray-400">(optional)</span></Label><Input value={form.keywords} placeholder="mombasa, upcountry, courier, countrywide" onChange={(e) => set("keywords", e.target.value)} /><p className="mt-1 text-xs text-gray-500">Separate with commas. If a customer types any of these, this answer is shown.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Link (optional)</Label><Input value={form.link} placeholder="/products" onChange={(e) => set("link", e.target.value)} /></div>
              <div><Label>Link button text</Label><Input value={form.linkLabel} placeholder="Browse products" onChange={(e) => set("linkLabel", e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3"><p className="text-sm font-medium">Active</p><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={saving || !form.question.trim() || !form.answer.trim()}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
