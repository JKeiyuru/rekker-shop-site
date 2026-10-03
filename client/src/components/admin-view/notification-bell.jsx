// client/src/components/admin-view/notification-bell.jsx
// The bell in the admin header. Checks for new alerts every 20 seconds and,
// when a new order / wholesale request / message arrives: plays a chime,
// shows a pop-up, can show a desktop notification, and updates the tab title
// so the team notices even when this tab is in the background.
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Bell, ShoppingBag, Store, Mail, AlertTriangle, BellRing, Volume2, VolumeX, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/config.js";

const ICONS = { order: ShoppingBag, wholesale: Store, message: Mail, low_stock: AlertTriangle, system: Bell };
const POLL_MS = 20000;

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.45);
    });
  } catch { /* browsers may block audio until the page has been clicked once */ }
}

const ago = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem("rekker_alert_muted") === "1");
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const seen = useRef(null); // ids already shown, so we only announce NEW ones
  const wrapRef = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/admin/notifications`);
      if (!data?.success) return;
      const list = data.data || [];
      if (seen.current === null) {
        seen.current = new Set(list.map((n) => n._id)); // first load: don't announce history
      } else {
        const fresh = list.filter((n) => !n.isRead && !seen.current.has(n._id));
        fresh.forEach((n) => seen.current.add(n._id));
        if (fresh.length) {
          if (!mutedRef.current) chime();
          const top = fresh[0];
          toast({ title: fresh.length > 1 ? `${fresh.length} new alerts` : top.title, description: fresh.length > 1 ? top.title : top.body });
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            try { new Notification(top.title, { body: top.body, tag: top._id }); } catch { /* ignore */ }
          }
        }
      }
      setItems(list);
      setUnread(data.unread || 0);
    } catch { /* offline or logged out — try again next tick */ }
  }, [toast]);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  useEffect(() => {
    const base = "Rekker Admin";
    document.title = unread > 0 ? `(${unread}) ${base}` : base;
    return () => { document.title = base; };
  }, [unread]);

  useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const openItem = async (n) => {
    setOpen(false);
    if (!n.isRead) {
      setItems((l) => l.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      axios.put(`${API_BASE_URL}/api/admin/notifications/${n._id}/read`).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const readAll = async () => {
    setItems((l) => l.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    axios.put(`${API_BASE_URL}/api/admin/notifications/read-all`).catch(() => {});
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem("rekker_alert_muted", next ? "1" : "0");
    if (!next) chime();
  };

  const enableDesktop = async () => {
    if (typeof Notification === "undefined") return;
    setPerm(await Notification.requestPermission());
  };

  return (
    <div className="relative" ref={wrapRef}>
      <Button variant="ghost" size="icon" onClick={() => setOpen((o) => !o)} aria-label="Alerts" className="relative">
        {unread > 0 ? <BellRing className="w-5 h-5 text-red-600" /> : <Bell className="w-5 h-5 text-gray-500" />}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[92vw] bg-white border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <p className="font-semibold text-sm">Alerts {unread > 0 && <span className="text-red-600">({unread} new)</span>}</p>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMute} title={muted ? "Sound is off" : "Sound is on"}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={readAll} title="Mark all as read">
                <CheckCheck className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {perm === "default" && (
            <button onClick={enableDesktop} className="w-full text-left text-xs bg-amber-50 text-amber-800 px-4 py-2 border-b hover:bg-amber-100">
              🔔 Click to get pop-up alerts on this computer even when you're on another tab
            </button>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-10">No alerts yet. New orders will show up here.</p>
            ) : (
              items.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <button key={n._id} onClick={() => openItem(n)} className={`w-full text-left flex gap-3 px-4 py-3 border-b last:border-0 hover:bg-gray-50 ${n.isRead ? "" : "bg-red-50/50"}`}>
                    <span className={`mt-0.5 h-8 w-8 shrink-0 rounded-full flex items-center justify-center ${n.type === "order" ? "bg-green-100 text-green-700" : n.type === "low_stock" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm ${n.isRead ? "text-gray-700" : "font-semibold text-gray-900"}`}>{n.title}</span>
                      {n.body && <span className="block text-xs text-gray-500 truncate">{n.body}</span>}
                      <span className="block text-[11px] text-gray-400 mt-0.5">{ago(n.createdAt)}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
