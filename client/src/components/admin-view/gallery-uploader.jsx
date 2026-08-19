/* eslint-disable react/prop-types */
// client/src/components/admin-view/gallery-uploader.jsx
// Lets an admin attach several extra photos to a product (front, back, angle,
// lifestyle shot, etc.) — separate from "variations", which represent
// different sellable options (sizes/colors). These are just more photos of
// the SAME product. Stored on formData.images (an array of Cloudinary URLs),
// matching the Product schema's `images: [String]` field.
import { useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Label } from "../ui/label";
import { UploadCloudIcon, XIcon, GripVertical, ImagePlus } from "lucide-react";

const MAX_IMAGES = 8;
const VALID_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function GalleryUploader({ formData, setFormData }) {
  const inputRef = useRef(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState(null);

  const images = formData.images || [];
  const remainingSlots = MAX_IMAGES - images.length;

  async function uploadOne(file) {
    const data = new FormData();
    data.append("my_file", file);
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/products/upload-image`,
      data,
      { timeout: 30000, headers: { "Content-Type": "multipart/form-data" } }
    );
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Upload failed");
    }
    return response.data.result.url;
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    setError("");

    if (files.length > remainingSlots) {
      setError(`You can add ${remainingSlots} more photo${remainingSlots === 1 ? "" : "s"} (max ${MAX_IMAGES}).`);
    }
    const toUpload = files.slice(0, Math.max(remainingSlots, 0));

    const valid = [];
    for (const file of toUpload) {
      if (!VALID_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WEBP images are allowed");
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError("Each image must be under 5MB");
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setUploadingCount(valid.length);
    try {
      // Upload sequentially to stay under the same rate limiter the main
      // image uploader respects (Cloudinary/backend both throttle rapid calls).
      const uploadedUrls = [];
      for (const file of valid) {
        const url = await uploadOne(file);
        uploadedUrls.push(url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (err) {
      setError(err.message || "One or more uploads failed");
    } finally {
      setUploadingCount(0);
    }
  }

  function handleInputChange(event) {
    handleFiles(event.target.files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function removeImage(index) {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  }

  function moveImage(from, to) {
    if (to < 0 || to >= images.length) return;
    setFormData((prev) => {
      const next = [...(prev.images || [])];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...prev, images: next };
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-lg font-semibold block">
          Extra Photos <span className="text-sm font-normal text-muted-foreground">(front, back, angle, etc.)</span>
        </Label>
        <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES}</span>
      </div>

      {error && (
        <div className="mb-3 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {images.map((url, index) => (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== index) moveImage(dragIndex, index);
                setDragIndex(null);
              }}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary cursor-move"
            >
              <img src={url} alt={`Product photo ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-3 h-3" /> #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-lg p-4"
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            disabled={uploadingCount > 0}
            className="hidden"
            id="gallery-upload"
          />
          <Label
            htmlFor="gallery-upload"
            className={`${uploadingCount > 0 ? "cursor-not-allowed" : "cursor-pointer"} flex flex-col items-center justify-center h-24`}
          >
            {uploadingCount > 0 ? (
              <>
                <UploadCloudIcon className="w-8 h-8 text-muted-foreground mb-1 animate-pulse" />
                <span className="text-sm">Uploading {uploadingCount} photo{uploadingCount > 1 ? "s" : ""}…</span>
              </>
            ) : (
              <>
                <ImagePlus className="w-8 h-8 text-muted-foreground mb-1" />
                <span className="text-sm">Drag & drop or click to add photos</span>
                <span className="text-xs text-gray-500 mt-1">Up to {remainingSlots} more, JPG/PNG/WEBP, max 5MB each</span>
              </>
            )}
          </Label>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        These are extra photos of this exact product — not different sizes/colors. Drag a thumbnail to reorder; the first photo after the main image shows next in the gallery.
      </p>
    </div>
  );
}

export default GalleryUploader;
