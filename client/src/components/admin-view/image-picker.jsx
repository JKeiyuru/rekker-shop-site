// client/src/components/admin-view/image-picker.jsx
// Small "click to upload" image box for forms (categories, banners, bundles).
// Photos are shrunk in the browser first (max 1600px, ~85% quality) so phone
// photos never hit Cloudinary's size limit, then uploaded to the same endpoint
// the product form uses. The real error from the server is shown if it fails.
import { useRef, useState } from "react";
import axios from "axios";
import { ImagePlus, Loader2, X } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";

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
    const ext = keepPng ? "png" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
  } catch { return file; } // very old browsers: upload the original
}

export default function ImagePicker({ value, onChange, label = "Upload image", hint, aspect = "aspect-video", className = "" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      const { data } = await axios.post(`${API_BASE_URL}/api/admin/products/upload-image`, fd, { timeout: 60000 });
      if (data?.success && (data.result?.secure_url || data.result?.url)) onChange(data.result.secure_url || data.result.url);
      else setError(data?.message || "Upload failed. Please try again.");
    } catch (err) {
      const status = err.response?.status;
      setError(
        status === 401 || status === 403 ? "Your session expired — please log in again."
        : err.code === "ECONNABORTED" ? "The upload took too long. Check your connection and try again."
        : err.response?.data?.message || "Upload failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
      {value ? (
        <div className={`relative ${aspect} rounded-lg overflow-hidden border bg-gray-50`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          {busy && <div className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="w-6 h-6 animate-spin" /></div>}
          <button type="button" onClick={() => onChange("")} className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black" aria-label="Remove image">
            <X className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-white/90 hover:bg-white border">
            Change
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className={`${aspect} w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 bg-gray-50 flex flex-col items-center justify-center gap-1 text-gray-500 text-sm transition`}>
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
          <span>{busy ? "Uploading…" : label}</span>
          {hint && !busy && <span className="text-xs text-gray-400">{hint}</span>}
        </button>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
