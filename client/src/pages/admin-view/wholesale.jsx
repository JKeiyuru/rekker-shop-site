// client/src/pages/admin-view/wholesale.jsx — Admin → Wholesale Requests
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Mail, MapPin, MessageCircle, Phone, Store, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/config.js";

const api = `${API_BASE_URL}/api/wholesale/requests`;
const STATUSES = [
  ["new", "New", "bg-red-100 text-red-700"],
  ["contacted", "Contacted", "bg-blue-100 text-blue-700"],
  ["quoted", "Quote sent", "bg-purple-100 text-purple-700"],
  ["approved", "Approved", "bg-green-100 text-green-700"],
  ["declined", "Declined", "bg-gray-200 text-gray-700"],
  ["archived", "Archived", "bg-gray-100 text-gray-500"],
];
const VOLUME = { "under-50k": "Under KES 50k", "50k-200k": "KES 50k–200k", "200k-500k": "KES 200k–500k", "above-500k": "Above KES 500k", "not-sure": "Not sure yet" };
const TYPE = { supermarket: "Supermarket", "retail-shop": "Retail shop", wholesaler: "Wholesaler", "salon-barber": "Salon / barber", pharmacy: "Pharmacy", institution: "Institution", "online-seller": "Online seller", other: "Other" };
const waLink = (phone, name) => `https://wa.me/${String(phone).replace(/\D/g, "").replace(/^0/, "254")}?text=${encodeURIComponent(`Hello ${name}, this is Rekker following up on your wholesale request.`)}`;

export default function AdminWholesale() {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(api, { params: { status: filter } });
      setList(data.data || []);
      setNotes(Object.fromEntries((data.data || []).map((r) => [r._id, r.adminNotes || ""])));
    } catch { toast({ title: "Could not load requests", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [filter, toast]);
  useEffect(() => { setLoading(true); load(); }, [load]);

  const patch = async (id, body, msg) => {
    try { await axios.put(`${api}/${id}`, body); if (msg) toast({ title: msg }); load(); }
    catch { toast({ title: "Couldn't update", variant: "destructive" }); }
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete the request from ${r.businessName}?`)) return;
    try { await axios.delete(`${api}/${r._id}`); load(); } catch { toast({ title: "Couldn't delete", variant: "destructive" }); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Store className="w-7 h-7" /> Wholesale Requests</h1>
      <p className="text-gray-600 mt-1 mb-4">Businesses that want to stock Rekker brands. Work through them from "New" to "Approved".</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["all", "All"], ...STATUSES.map(([k, l]) => [k, l])].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-sm border ${filter === k ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"}`}>{l}</button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        : list.length === 0 ? <div className="text-center py-16 border-2 border-dashed rounded-xl text-gray-500">No requests here yet.</div> : (
          <div className="space-y-3">
            {list.map((r) => {
              const st = STATUSES.find((s) => s[0] === r.status) || STATUSES[0];
              return (
                <div key={r._id} className={`bg-white border rounded-xl p-4 ${r.status === "new" ? "border-red-300 shadow-sm" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-lg">{r.businessName} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${st[2]}`}>{st[1]}</span></p>
                      <p className="text-sm text-gray-600">{r.contactName} · {TYPE[r.businessType] || r.businessType} · {new Date(r.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${r.phone}`}><Button variant="outline" size="sm" className="gap-1"><Phone className="w-3.5 h-3.5" />Call</Button></a>
                      <a href={waLink(r.phone, r.contactName)} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="gap-1 text-green-700"><MessageCircle className="w-3.5 h-3.5" />WhatsApp</Button></a>
                      <a href={`mailto:${r.email}?subject=${encodeURIComponent("Your Rekker wholesale request")}`}><Button variant="outline" size="sm" className="gap-1"><Mail className="w-3.5 h-3.5" />Email</Button></a>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mt-3">
                    <p><span className="text-gray-500">Phone:</span> {r.phone}</p>
                    <p><span className="text-gray-500">Email:</span> {r.email}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{[r.town, r.county].filter(Boolean).join(", ") || "—"}</p>
                    <p><span className="text-gray-500">Monthly volume:</span> {VOLUME[r.estimatedMonthlyOrder] || "—"}</p>
                    {r.kraPin && <p><span className="text-gray-500">KRA PIN:</span> {r.kraPin}</p>}
                    {r.brandsInterested?.length > 0 && <p><span className="text-gray-500">Brands:</span> {r.brandsInterested.join(", ")}</p>}
                  </div>
                  {r.productsInterested && <p className="text-sm mt-2"><span className="text-gray-500">Interested in:</span> {r.productsInterested}</p>}
                  {r.message && <p className="text-sm mt-2 bg-gray-50 rounded-lg p-3">{r.message}</p>}

                  <div className="mt-3 flex flex-wrap items-start gap-3">
                    <select className="h-9 rounded-md border bg-white px-2 text-sm" value={r.status} onChange={(e) => patch(r._id, { status: e.target.value }, "Status updated")}>
                      {STATUSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                    <Textarea rows={1} className="flex-1 min-w-[220px] text-sm" placeholder="Internal notes (only your team sees this)" value={notes[r._id] ?? ""} onChange={(e) => setNotes((n) => ({ ...n, [r._id]: e.target.value }))} onBlur={() => notes[r._id] !== (r.adminNotes || "") && patch(r._id, { adminNotes: notes[r._id] }, "Note saved")} />
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => remove(r)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
