// Admin — contact messages from rekker.co.ke (corporate) and shop.rekker.co.ke (shop)
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Trash2, RefreshCcw, Building2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from "@/store/contact-slice";

const SOURCES = [
  { key: "all", label: "All" },
  { key: "corporate", label: "Corporate site" },
  { key: "shop", label: "Shop site" },
];

const STATUSES = ["new", "read", "responded", "archived"];

function SourceBadge({ source }) {
  const isShop = source === "shop";
  const Icon = isShop ? ShoppingBag : Building2;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
        isShop ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      <Icon className="h-3 w-3" />
      {isShop ? "shop.rekker.co.ke" : "rekker.co.ke"}
    </span>
  );
}

export default function AdminMessages() {
  const dispatch = useDispatch();
  const { messages, isLoading, unread } = useSelector((s) => s.contact);
  const [source, setSource] = useState("all");
  const [active, setActive] = useState(null);

  useEffect(() => {
    dispatch(fetchContactMessages({ source }));
  }, [dispatch, source]);

  const list = useMemo(() => messages || [], [messages]);
  const selected = list.find((m) => m._id === active) || null;

  function open(msg) {
    setActive(msg._id);
    if (msg.status === "new") dispatch(updateContactStatus({ id: msg._id, status: "read" }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Contact messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            {list.length} message{list.length === 1 ? "" : "s"} · {unread} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          {SOURCES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSource(s.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                source === s.key ? "bg-red-700 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
          <Button variant="outline" size="sm" onClick={() => dispatch(fetchContactMessages({ source }))}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border bg-white p-2">
          {isLoading && list.length === 0 && (
            <p className="p-6 text-sm text-gray-500">Loading messages…</p>
          )}
          {!isLoading && list.length === 0 && (
            <div className="p-10 text-center">
              <Mail className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No messages yet.</p>
            </div>
          )}
          {list.map((m) => (
            <button
              key={m._id}
              onClick={() => open(m)}
              className={`w-full rounded-xl border p-4 text-left transition-colors ${
                active === m._id ? "border-red-600 bg-red-50" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-bold text-gray-900">{m.name}</span>
                {m.status === "new" && <span className="h-2 w-2 shrink-0 rounded-full bg-red-600" />}
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">{m.subject || m.inquiryType}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <SourceBadge source={m.source} />
                <span className="text-[11px] text-gray-400">
                  {new Date(m.createdAt).toLocaleDateString("en-KE")}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          {!selected ? (
            <p className="py-20 text-center text-sm text-gray-500">Select a message to read it.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <SourceBadge source={selected.source} />
                  <h2 className="mt-3 text-xl font-bold text-gray-900">
                    {selected.subject || selected.inquiryType || "Enquiry"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(selected.createdAt).toLocaleString("en-KE")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-700"
                  onClick={() => {
                    dispatch(deleteContactMessage(selected._id));
                    setActive(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>

              <dl className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{selected.name}</dd></div>
                <div><dt className="text-gray-500">Email</dt><dd className="font-medium"><a className="text-red-700" href={`mailto:${selected.email}`}>{selected.email}</a></dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd className="font-medium">{selected.phone || "—"}</dd></div>
                <div><dt className="text-gray-500">Company</dt><dd className="font-medium">{selected.company || "—"}</dd></div>
                <div><dt className="text-gray-500">Enquiry type</dt><dd className="font-medium">{selected.inquiryType || "—"}</dd></div>
                <div><dt className="text-gray-500">Origin</dt><dd className="font-medium">{selected.source === "shop" ? "Shop site" : "Corporate site"}</dd></div>
              </dl>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">{selected.message}</p>

              <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status</span>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => dispatch(updateContactStatus({ id: selected._id, status: s }))}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      selected.status === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
