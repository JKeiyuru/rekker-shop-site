// client/src/components/admin-view/image-picker.jsx
// Small "click to upload" image box for forms (categories, banners, bundles).
// Uploads to the same Cloudinary endpoint the product form uses and reports
// the final URL through onChange(url).
import { useRef, useState } from "react";
import axios from "axios";
import { ImagePlus, Loader2, X } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";

export default function ImagePicker({ value, onChange, label = "Upload image", hint, aspect = "aspect-video", className = "" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose an image file (JPG, PNG or WebP).");
    if (file.size > 8 * 1024 * 1024) return setError("That image is over 8 MB. Please use a smaller one.");
    setError("");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("my_file", file);
      const { data } = await axios.post(`${API_BASE_URL}/api/admin/products/upload-image`, fd);
      if (data?.success && data.result?.url) onChange(data.result.url);
      else setError("Upload failed. Please try again.");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
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
