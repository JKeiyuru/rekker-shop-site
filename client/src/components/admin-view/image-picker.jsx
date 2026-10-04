// client/src/components/admin-view/image-picker.jsx
// "Click to upload" image box for admin forms (categories, banners, bundles).
//  • photos are shrunk in the browser first (max 1600px) so they never exceed Cloudinary's limit
//  • uploads with fetch + the login token, and shows the REAL reason if anything fails
//  • "paste an image link" fallback so work is never blocked by an upload problem
import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, X } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import { authHeaders } from "@/lib/auth-token";

async function shrink(file, maxSide = 1600, quality = 0.85) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const keepPng = file.type === "image/png" && file.size < 1.5 * 1024 * 1024;
    const blob = await new Promise((res) => canvas.toBlob(res, keepPng ? "image/png" : "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + (keepPng ? ".png" : ".jpg"), { type: blob.type });
  } catch { return file; }
}

export default function ImagePicker({ value, onChange, label = "Upload image", hint, aspect = "aspect-video", className = "" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [linkMode, setLinkMode] = useState(false);
  const [link, setLink] = useState("");

  async function pick(e) {
    const original = e.target.files?.[0];
    e.target.value = "";
    if (!original) return;
    if (!original.type.startsWith("image/")) return setError("Please choose an image file (JPG, PNG or WebP).");
    if (original.size > 25 * 1024 * 1024) return setError("That image is over 25 MB. Please choose a smaller one.");
    setError("");
    setBusy(true);
    try {
      const file = await shrink(original);
      const fd = new FormData();
      fd.append("my_file", file);
      const res = await fetch(`${API_BASE_URL}/api/admin/products/upload-image`, {
        method: "POST", body: fd, credentials: "include", headers: { ...authHeaders() },
      });
      const text = await res.text();
      let data = null;
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      const url = data?.result?.secure_url || data?.result?.url;
      if (res.ok && data?.success && url) onChange(url);
      else {
        setError(
          data?.message ||
          (res.status === 401 || res.status === 403 ? "Your session expired — please log in again."
            : res.status === 429 ? "Too many requests right now — wait a minute and try again."
            : `Upload failed (${res.status}). ${text.replace(/<[^>]+>/g, " ").slice(0, 120)}`)
        );
        setLinkMode(true); // offer the fallback straight away
      }
    } catch (err) {
      setError(`Couldn't reach the server (${err.message}). Check your connection and try again.`);
      setLinkMode(true);
    } finally { setBusy(false); }
  }

  function applyLink() {
    const u = link.trim();
    if (!/^https?:\/\//i.test(u)) return setError("The link must start with https://");
    setError(""); onChange(u); setLink(""); setLinkMode(false);
  }

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      {value ? (
        <div className={`relative ${aspect} rounded-lg overflow-hidden border bg-gray-50`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          {busy && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="w-6 h-6 animate-spin" /></div>}
          <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black" aria-label="Remove image"><X className="w-4 h-4" /></button>
          <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-white/90 hover:bg-white border">Change</button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={`${aspect} w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-500 text-sm transition`}>
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
          <span>{busy ? "Uploading…" : label}</span>
          {hint && !busy && <span className="text-xs text-gray-400">{hint}</span>}
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!value && !linkMode && (
        <button type="button" onClick={() => setLinkMode(true)} className="mt-1.5 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Link2 className="h-3 w-3" /> or paste an image link</button>
      )}
      {!value && linkMode && (
        <div className="mt-1.5 flex gap-2">
          <input value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyLink())} placeholder="https://…" className="h-9 min-w-0 flex-1 rounded-md border px-3 text-sm" />
          <button type="button" onClick={applyLink} className="rounded-md bg-gray-900 px-3 text-sm font-medium text-white">Use</button>
        </div>
      )}
    </div>
  );
}
