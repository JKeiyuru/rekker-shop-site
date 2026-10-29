/* eslint-disable react/prop-types */
// client/src/components/shopping-view/ad-banners.jsx
// Storefront side of Admin → Ads & Banners. Each component asks the API for
// the banners in its slot and renders nothing at all if there are none, so
// an empty slot never leaves a gap on the page.
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Check, ChevronLeft, ChevronRight, Copy, X } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";

const cache = {};
function useBannerState(placement) {
  const [state, setState] = useState({ banners: cache[placement] || [], loaded: !!cache[placement] });
  useEffect(() => {
    let alive = true;
    axios.get(`${API_BASE_URL}/api/shop/banners`, { params: { placement } })
      .then(({ data }) => { cache[placement] = data.data || []; if (alive) setState({ banners: cache[placement], loaded: true }); })
      .catch(() => { if (alive) setState((s) => ({ ...s, loaded: true })); });
    return () => { alive = false; };
  }, [placement]);
  return state;
}
const useBanners = (placement) => useBannerState(placement).banners;

const track = (id, event) => { try { axios.post(`${API_BASE_URL}/api/shop/banners/${id}/${event}`).catch(() => {}); } catch { /* ignore */ } };
const viewed = new Set();
function useViewOnce(id) {
  useEffect(() => {
    if (id && !viewed.has(id)) { viewed.add(id); track(id, "view"); }
  }, [id]);
}

function useCountdown(endsAt, enabled) {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    if (!enabled || !endsAt) return;
    const tick = () => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt, enabled]);
  if (left === null) return null;
  const d = Math.floor(left / 86400000), h = Math.floor((left % 86400000) / 3600000), m = Math.floor((left % 3600000) / 60000), s = Math.floor((left % 60000) / 1000);
  return d > 0 ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m` : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// internal paths use <Link>, full URLs open normally
function SmartLink({ to, onClick, className, style, children }) {
  const url = to || "/products";
  if (/^https?:\/\//i.test(url)) return <a href={url} target="_blank" rel="noreferrer" onClick={onClick} className={className} style={style}>{children}</a>;
  return <Link to={url} onClick={onClick} className={className} style={style}>{children}</Link>;
}

function Countdown({ b }) {
  const text = useCountdown(b.endsAt, b.showCountdown);
  if (!text) return null;
  return <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">⏱ Ends in {text}</span>;
}

// ── Thin strip above the header ─────────────────────────────────────────────
export function AnnouncementBar() {
  const banners = useBanners("announcement");
  const [i, setI] = useState(0);
  const [closed, setClosed] = useState(() => sessionStorage.getItem("ann_closed") === "1");
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);
  const b = banners[i % (banners.length || 1)];
  useViewOnce(b?._id);
  const text = useCountdown(b?.endsAt, b?.showCountdown);
  if (!b || closed) return null;
  return (
    <div className="relative text-center text-sm py-2 px-10" style={{ background: b.bgColor, color: b.textColor }}>
      <SmartLink to={b.linkUrl} onClick={() => track(b._id, "click")} className="hover:underline">
        {b.badge && <span className="mr-2 rounded bg-white/20 px-1.5 py-0.5 text-xs font-bold">{b.badge}</span>}
        <span className="font-medium">{b.title}</span>
        {b.subtitle && <span className="opacity-90"> — {b.subtitle}</span>}
        {text && <span className="ml-2 font-semibold">· ends in {text}</span>}
        {b.ctaLabel && <span className="ml-2 underline underline-offset-2">{b.ctaLabel} →</span>}
      </SmartLink>
      <button aria-label="Dismiss" onClick={() => { sessionStorage.setItem("ann_closed", "1"); setClosed(true); }} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"><X className="h-4 w-4" /></button>
    </div>
  );
}

// ── Big rotating slider ─────────────────────────────────────────────────────
// `fallback` is shown only when no hero banner is scheduled, so the home page
// is never empty (it keeps the original static hero until ads are added).
export function HeroSlider({ fallback = null }) {
  const { banners, loaded } = useBannerState("hero");
  const [i, setI] = useState(0);
  const paused = useRef(false);
  const touchX = useRef(null);
  const go = useCallback((n) => setI((x) => (x + n + banners.length) % banners.length), [banners.length]);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => { if (!paused.current) go(1); }, 6000);
    return () => clearInterval(t);
  }, [banners.length, go]);
  const current = banners[i];
  useViewOnce(current?._id);
  if (!loaded) return null;
  if (!banners.length) return fallback;

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => { if (touchX.current === null) return; const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touchX.current = null; }}
    >
      <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {banners.map((b, idx) => (
          <div key={b._id} className="relative w-full shrink-0 min-h-[260px] sm:min-h-[340px] lg:min-h-[420px]" style={{ background: b.bgColor, color: b.textColor }}>
            {b.imageUrl && (
              <picture>
                {b.mobileImageUrl && <source media="(max-width: 640px)" srcSet={b.mobileImageUrl} />}
                <img src={b.imageUrl} alt={b.title} loading={idx === 0 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" />
              </picture>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
            <div className="relative mx-auto flex h-full min-h-[260px] sm:min-h-[340px] lg:min-h-[420px] max-w-7xl flex-col justify-center gap-3 px-6 sm:px-10 py-8">
              {b.badge && <span className="w-fit rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{b.badge}</span>}
              <h2 className="max-w-xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl" style={{ color: b.textColor }}>{b.title}</h2>
              {b.subtitle && <p className="max-w-lg text-base sm:text-lg opacity-90" style={{ color: b.textColor }}>{b.subtitle}</p>}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <SmartLink to={b.linkUrl} onClick={() => track(b._id, "click")} className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-lg transition hover:scale-[1.03]">{b.ctaLabel || "Shop now"}</SmartLink>
                <Countdown b={b} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <>
          <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white sm:block"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Next" onClick={() => go(1)} className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white sm:block"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, k) => <button key={b._id} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-white" : "w-2 bg-white/50"}`} />)}
          </div>
        </>
      )}
    </section>
  );
}

// ── Small tiles ─────────────────────────────────────────────────────────────
function Tile({ b }) {
  useViewOnce(b._id);
  return (
    <SmartLink to={b.linkUrl} onClick={() => track(b._id, "click")} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl" style={{ background: b.bgColor, color: b.textColor }}>
      {b.imageUrl && <img src={b.imageUrl} alt={b.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      {b.badge && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-white">{b.badge}</span>}
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <p className="text-lg font-bold leading-tight">{b.title}</p>
        {b.subtitle && <p className="text-sm opacity-90">{b.subtitle}</p>}
        <span className="mt-1 inline-block text-sm font-semibold underline underline-offset-4">{b.ctaLabel || "Shop now"} →</span>
      </div>
    </SmartLink>
  );
}
export function PromoTiles() {
  const banners = useBanners("tile");
  if (!banners.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${banners.length >= 3 ? "lg:grid-cols-3" : ""} ${banners.length >= 4 ? "xl:grid-cols-4" : ""}`}>
        {banners.map((b) => <Tile key={b._id} b={b} />)}
      </div>
    </section>
  );
}

// ── Full width strips (home "wide" and products-page "listing") ─────────────
function Wide({ b }) {
  useViewOnce(b._id);
  return (
    <SmartLink to={b.linkUrl} onClick={() => track(b._id, "click")} className="group relative flex min-h-[110px] sm:min-h-[150px] items-center overflow-hidden rounded-2xl" style={{ background: b.bgColor, color: b.textColor }}>
      {b.imageUrl && <img src={b.imageUrl} alt={b.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
      <div className="relative flex flex-1 flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-5 text-white">
        <div>
          {b.badge && <span className="mb-1 inline-block rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold">{b.badge}</span>}
          <p className="text-xl sm:text-2xl font-black leading-tight" style={{ color: b.textColor }}>{b.title}</p>
          {b.subtitle && <p className="text-sm sm:text-base opacity-90" style={{ color: b.textColor }}>{b.subtitle}</p>}
        </div>
        <div className="flex items-center gap-3"><Countdown b={b} /><span className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 group-hover:scale-105 transition">{b.ctaLabel || "Shop now"}</span></div>
      </div>
    </SmartLink>
  );
}
export function WideBanner({ placement = "wide", className = "mx-auto max-w-7xl px-4 sm:px-6 py-6" }) {
  const banners = useBanners(placement);
  if (!banners.length) return null;
  return <section className={`${className} space-y-4`}>{banners.map((b) => <Wide key={b._id} b={b} />)}</section>;
}

// ── Centre-screen pop-up ────────────────────────────────────────────────────
// Admin → Ads & Banners → Pop-up. Two layouts:
//   • "image" — the banner artwork itself with a call-to-action button under it
//   • "card"  — headline, message and (optionally) a discount code with Copy
// How often it appears, the delay and the pages are all set in the admin form.
// A copied/used code is remembered and pre-filled in the checkout code box.
const POPUP_SKIP = [/^\/checkout/, /^\/cart/, /^\/payment/, /^\/auth/, /^\/admin/];
const FREQ_MS = { day: 864e5, week: 6048e5 };
const shownThisLoad = new Set();

const popupStore = (freq) => { try { return freq === "session" ? window.sessionStorage : window.localStorage; } catch { return null; } };
// the timestamp is part of the key, so editing a pop-up in the admin shows it again
const popupKey = (b) => `rk_popup_${b._id}_${new Date(b.updatedAt || 0).getTime()}`;
function popupDue(b) {
  if (b.popupFrequency === "always") return true;
  const st = popupStore(b.popupFrequency);
  if (!st) return true;
  try {
    const last = Number(st.getItem(popupKey(b)) || 0);
    if (!last) return true;
    if (b.popupFrequency === "session") return false;
    return Date.now() - last > (FREQ_MS[b.popupFrequency] || FREQ_MS.day);
  } catch { return true; }
}
function markPopupSeen(b) {
  const st = popupStore(b.popupFrequency);
  try { st?.setItem(popupKey(b), String(Date.now())); } catch { /* private mode */ }
}
function rememberCode(code) {
  if (!code) return;
  try { localStorage.setItem("rk_promo_code", code); } catch { /* ignore */ }
}

export function PromoPopup() {
  const { banners } = useBannerState("popup");
  const { pathname } = useLocation();
  const [active, setActive] = useState(null);
  const [copied, setCopied] = useState(false);
  useViewOnce(active?._id);
  const countdown = useCountdown(active?.endsAt, active?.showCountdown);

  useEffect(() => {
    if (active || POPUP_SKIP.some((rx) => rx.test(pathname))) return;
    const next = banners.find((b) => !shownThisLoad.has(b._id) && (b.popupPages === "all" || pathname === "/") && popupDue(b));
    if (!next) return;
    const t = setTimeout(() => { shownThisLoad.add(next._id); markPopupSeen(next); setActive(next); }, Math.max(0, Number(next.popupDelay ?? 3)) * 1000);
    return () => clearTimeout(t);
  }, [banners, pathname, active]);

  const close = useCallback(() => { setActive(null); setCopied(false); }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [active, close]);

  if (!active) return null;
  const b = active;
  const link = b.linkUrl || (b.brandSlug ? `/products?brand=${b.brandSlug}` : "/products");
  const isImage = b.popupLayout === "image" && b.imageUrl;

  async function copyCode() {
    rememberCode(b.couponCode);
    try { await navigator.clipboard.writeText(b.couponCode); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ }
  }
  const onCta = () => { rememberCode(b.couponCode); track(b._id, "click"); close(); };

  const codeBox = b.couponCode && (
    <button type="button" onClick={copyCode} className="group flex items-center gap-3 rounded-xl border-2 border-dashed border-current px-4 py-2.5 text-left" aria-label={`Copy discount code ${b.couponCode}`}>
      <span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">Your code</span>
        <span className="block font-mono text-xl font-black tracking-[0.18em]">{b.couponCode}</span>
      </span>
      <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold opacity-80 group-hover:opacity-100">
        {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
      </span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] animate-in fade-in duration-200" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div role="dialog" aria-modal="true" aria-label={b.title} className={`relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 ${isImage ? "max-w-2xl" : "max-w-md"}`}>
        <button type="button" aria-label="Close" onClick={close} autoFocus className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75">
          <X className="h-4 w-4" />
        </button>

        {isImage ? (
          <>
            <SmartLink to={link} onClick={onCta} className="block">
              <img src={b.imageUrl} alt={b.title} className="block h-auto w-full" />
            </SmartLink>
            <div className="flex flex-col items-stretch gap-3 bg-white p-4 text-gray-900 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              {codeBox ? <div className="sm:max-w-[55%]">{codeBox}</div> : <p className="text-sm text-gray-600">{b.subtitle}</p>}
              <SmartLink to={link} onClick={onCta} className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow transition hover:scale-[1.03]">
                {b.ctaLabel || "Shop now"}
              </SmartLink>
            </div>
          </>
        ) : (
          <>
            {b.imageUrl && <img src={b.imageUrl} alt="" className="block aspect-[16/8] w-full object-cover" />}
            <div className="space-y-4 p-6 text-center sm:p-8" style={{ background: b.bgColor, color: b.textColor }}>
              {b.badge && <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{b.badge}</span>}
              <h2 className="text-2xl font-black leading-tight sm:text-3xl">{b.title}</h2>
              {b.subtitle && <p className="text-sm opacity-90 sm:text-base">{b.subtitle}</p>}
              {codeBox && <div className="mx-auto max-w-xs text-left">{codeBox}</div>}
              {countdown && <p className="text-xs font-semibold opacity-90">⏱ Ends in {countdown}</p>}
              <SmartLink to={link} onClick={onCta} className="inline-flex w-full items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-bold text-gray-900 shadow-lg transition hover:scale-[1.02] sm:w-auto">
                {b.ctaLabel || "Shop now"}
              </SmartLink>
            </div>
          </>
        )}
        <button type="button" onClick={close} className="block w-full bg-white pb-3 pt-0 text-center text-xs text-gray-500 hover:text-gray-800">No thanks</button>
      </div>
    </div>
  );
}
