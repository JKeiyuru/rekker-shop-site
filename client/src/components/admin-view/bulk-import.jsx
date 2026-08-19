/* eslint-disable react/prop-types */
// client/src/components/admin-view/bulk-import.jsx
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload, Download, FileSpreadsheet, FolderArchive, CheckCircle,
  AlertCircle, AlertTriangle, ImageIcon, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { API_BASE_URL } from "@/config/config.js";

function BulkImport({ onImportComplete }) {
  const [sheetFile, setSheetFile] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const sheetInputRef = useRef(null);
  const zipInputRef = useRef(null);
  const { toast } = useToast();

  function handleSheetChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx/.xls) or CSV file",
        variant: "destructive",
      });
      return;
    }
    setSheetFile(file);
    setImportResults(null);
  }

  function handleZipChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.zip$/i)) {
      toast({
        title: "Invalid file type",
        description: "Product images must be zipped into a single .zip file",
        variant: "destructive",
      });
      return;
    }
    setZipFile(file);
  }

  async function handleImport() {
    if (!sheetFile) {
      toast({ title: "Choose a product sheet first", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setImportResults(null);

    const formData = new FormData();
    formData.append("file", sheetFile);
    if (zipFile) formData.append("imagesZip", zipFile);

    // Uploading + uploading-to-Cloudinary-per-image can take a while for a
    // real import with many photos, so this progress bar is indicative
    // (creeps toward 90%) rather than a precise byte count.
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 800);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/products/bulk-import`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setImportResults(result.data);
        toast({
          title: "Import finished",
          description: `${result.data.successful} added, ${result.data.failed} failed, ${result.data.imagesUploaded} images uploaded`,
        });
        if (onImportComplete) onImportComplete();
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }

  function downloadTemplate() {
    window.open(`${API_BASE_URL}/api/admin/products/bulk-import-template`, "_blank");
  }

  function resetFiles() {
    setSheetFile(null);
    setZipFile(null);
    setImportResults(null);
    if (sheetInputRef.current) sheetInputRef.current.value = "";
    if (zipInputRef.current) zipInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Product Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              {/* Spreadsheet picker */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={sheetInputRef}
                  type="file"
                  id="bulk-sheet-upload"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleSheetChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <label
                  htmlFor="bulk-sheet-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center h-24 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FileSpreadsheet className="w-7 h-7 text-gray-400 mb-1" />
                  <p className="text-sm font-medium">
                    {sheetFile ? sheetFile.name : "1. Choose product sheet"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">.xlsx, .xls, or .csv — required</p>
                </label>
              </div>

              {/* Images ZIP picker */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  ref={zipInputRef}
                  type="file"
                  id="bulk-zip-upload"
                  accept=".zip"
                  onChange={handleZipChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <label
                  htmlFor="bulk-zip-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center h-24 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <FolderArchive className="w-7 h-7 text-gray-400 mb-1" />
                  <p className="text-sm font-medium">
                    {zipFile ? zipFile.name : "2. Choose images .zip (optional)"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Main photos, extra photos & variation photos — matched by filename
                  </p>
                </label>
              </div>

              {isUploading && (
                <div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress < 100 ? "Uploading & processing images…" : "Done"}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleImport} disabled={isUploading || !sheetFile} className="flex-1 gap-2">
                  <Upload className="w-4 h-4" />
                  {isUploading ? "Importing…" : "Run Import"}
                </Button>
                {(sheetFile || zipFile) && !isUploading && (
                  <Button onClick={resetFiles} variant="outline" size="icon" aria-label="Clear files">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="w-full"
                disabled={isUploading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Sheet Template
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="font-medium">How real images work:</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    In your sheet, the <code className="bg-secondary px-1 rounded">image</code>,{" "}
                    <code className="bg-secondary px-1 rounded">extra_images</code> and{" "}
                    <code className="bg-secondary px-1 rounded">variation_images</code> columns
                    hold <strong>filenames</strong> — e.g. <code className="bg-secondary px-1 rounded">shampoo1-main.jpg</code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Put every photo those filenames reference into one .zip (no folders needed) and upload it alongside the sheet</span>
                </li>
                <li className="flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Already have images hosted somewhere? Paste the full https:// URL instead of a filename — no zip needed for those</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Brand must be: rekker, saffron, cornells, or biosaff</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Multiple photos or variations: separate filenames with{" "}
                    <code className="bg-secondary px-1 rounded">;</code> — e.g.{" "}
                    <code className="bg-secondary px-1 rounded">a.jpg;b.jpg</code>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>
                    <code className="bg-secondary px-1 rounded">variation_labels</code> and{" "}
                    <code className="bg-secondary px-1 rounded">variation_images</code> must have
                    the same number of entries, in the same order
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Results */}
          {importResults && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Import Results:</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Successful: {importResults.successful}
                </Badge>
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Failed: {importResults.failed}
                </Badge>
                <Badge variant="secondary">
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Images uploaded: {importResults.imagesUploaded}
                </Badge>
              </div>

              {importResults.errors?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-600">Errors:</p>
                  <ul className="text-xs text-red-500 mt-1 space-y-1 max-h-40 overflow-y-auto">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResults.warnings?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warnings (products still saved, but check these):
                  </p>
                  <ul className="text-xs text-amber-600 mt-1 space-y-1 max-h-40 overflow-y-auto">
                    {importResults.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BulkImport;
