/* eslint-disable react/prop-types */
//client/src/components/admin-view/image-upload.jsx
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { API_BASE_URL } from "@/config/config.js";

// Shared rate limiter with variation uploader
const rateLimiter = {
  lastUploadTime: 0,
  minInterval: 2000, // 2 seconds between uploads
  
  canUpload() {
    const now = Date.now();
    if (now - this.lastUploadTime < this.minInterval) {
      return false;
    }
    return true;
  },
  
  recordUpload() {
    this.lastUploadTime = Date.now();
  },
  
  getWaitTime() {
    const elapsed = Date.now() - this.lastUploadTime;
    const remaining = this.minInterval - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000));
  }
};

function ProductImageUpload({
  imageFile,
  setImageFile,
  imageLoadingState,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  isEditMode,
  isCustomStyling = false,
}) {
  const inputRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  console.log(isEditMode, "isEditMode");

  function handleImageFileChange(event) {
    console.log(event.target.files, "event.target.files");
    const selectedFile = event.target.files?.[0];
    console.log(selectedFile);

    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(selectedFile.type)) {
        setUploadError('Only JPG, PNG, and WEBP images are allowed');
        return;
      }

      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }

      setImageFile(selectedFile);
      setUploadError("");
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(droppedFile.type)) {
        setUploadError('Only JPG, PNG, and WEBP images are allowed');
        return;
      }

      // Validate file size
      if (droppedFile.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }

      setImageFile(droppedFile);
      setUploadError("");
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setUploadError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    // Check if already uploading
    if (imageLoadingState) {
      console.log("Upload already in progress");
      return;
    }

    // Check rate limit
    if (!rateLimiter.canUpload()) {
      const waitTime = rateLimiter.getWaitTime();
      setUploadError(`Please wait ${waitTime} seconds before uploading again`);
      console.log(`Rate limit: wait ${waitTime} seconds`);
      return;
    }

    setImageLoadingState(true);
    setUploadError("");

    try {
      const data = new FormData();
      data.append("my_file", imageFile);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/upload-image`,
        data,
        {
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      console.log(response, "response");

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
        rateLimiter.recordUpload();
      } else {
        throw new Error(response?.data?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response?.status === 429) {
        setUploadError("Upload rate limit exceeded. Please wait a moment and try again.");
      } else {
        setUploadError(error.response?.data?.message || error.message || "Failed to upload image");
      }
    } finally {
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null && !isEditMode) {
      uploadImageToCloudinary();
    }
  }, [imageFile]);

  return (
    <div
      className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}
    >
      <Label className="text-lg font-semibold mb-2 block">Upload Image</Label>
      
      {/* Error Message */}
      {uploadError && (
        <div className="mb-3 text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
          {uploadError}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`${
          isEditMode ? "opacity-60" : ""
        } border-2 border-dashed rounded-lg p-4`}
      >
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode || imageLoadingState}
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
        {!imageFile ? (
          <Label
            htmlFor="image-upload"
            className={`${
              isEditMode || imageLoadingState ? "cursor-not-allowed" : "cursor-pointer"
            } flex flex-col items-center justify-center h-32`}
          >
            <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
            <span>
              {imageLoadingState 
                ? "Uploading..." 
                : "Drag & drop or click to upload image"
              }
            </span>
            <span className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP (max 5MB)
            </span>
          </Label>
        ) : imageLoadingState ? (
          <div className="space-y-2">
            <Skeleton className="h-10 bg-gray-100" />
            <p className="text-sm text-center text-gray-600">
              Uploading image, please wait...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="w-8 text-primary mr-2 h-8" />
            </div>
            <p className="text-sm font-medium">{imageFile.name}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleRemoveImage}
              disabled={imageLoadingState}
            >
              <XIcon className="w-4 h-4" />
              <span className="sr-only">Remove File</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Upload status */}
      {uploadedImageUrl && !imageLoadingState && (
        <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Image uploaded successfully
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;