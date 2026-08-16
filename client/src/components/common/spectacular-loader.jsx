// Premium Rekker loader.
// Truthful by design: it shows only while something is actually loading and
// fades out the moment it unmounts — no fixed timers pretending to be progress.
import { useEffect, useState } from "react";

export default function LuxuryLoader({ label = "Preparing your experience" }) {
  const [visible, setVisible] = useState(false);

  // Tiny delay avoids a flash on instant loads.
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 90);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="status"
      aria-live="polite"
    >
      {/* soft brand glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-red-600/20 blur-[120px]" />
        <div className="absolute -bottom-48 right-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center">
        {/* monogram with sweeping arc */}
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
            <circle
              cx="50" cy="50" r="46" fill="none"
              stroke="url(#rk-arc)" strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray="70 220"
              className="rk-arc"
            />
            <defs>
              <linearGradient id="rk-arc" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e11d2e" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rk-mono text-4xl font-bold tracking-[0.1em] text-white">R</span>
          </div>
        </div>

        {/* wordmark */}
        <div className="mt-8 overflow-hidden">
          <p className="rk-shimmer text-[0.7rem] font-semibold uppercase tracking-[0.55em] text-white/90">
            Rekker
          </p>
        </div>
        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.28em] text-white/35">{label}</p>

        {/* indeterminate hairline */}
        <div className="mt-7 h-px w-52 overflow-hidden bg-white/10">
          <div className="rk-sweep h-full w-1/3 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes rkSpin { to { transform: rotate(360deg); } }
        @keyframes rkSweep { 0% { transform: translateX(-120%); } 100% { transform: translateX(420%); } }
        @keyframes rkBreathe { 0%,100% { opacity:.85; transform:scale(1);} 50% { opacity:1; transform:scale(1.06);} }
        @keyframes rkShimmer { 0% { background-position: -180% 0; } 100% { background-position: 180% 0; } }
        .rk-arc { transform-origin: 50% 50%; animation: rkSpin 1.5s cubic-bezier(.6,.05,.3,.95) infinite; }
        .rk-sweep { animation: rkSweep 1.4s cubic-bezier(.4,0,.2,1) infinite; }
        .rk-mono { animation: rkBreathe 2.4s ease-in-out infinite; }
        .rk-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,.35) 0%, #fff 45%, rgba(255,255,255,.35) 90%);
          background-size: 220% 100%;
          -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: rkShimmer 2.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .rk-arc, .rk-sweep, .rk-mono, .rk-shimmer { animation: none; }
        }
      `}</style>
    </div>
  );
}
