/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// client/src/components/admin-view/bulk-import.jsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function BulkImport({ onImportComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const { toast } = useToast();

  // Template data structure matching your Excel
  const templateData = {
    columns: [
      "title", "brand", "category", "subcategory", "description", 
      "price", "salePrice", "totalStock", "variations"
    ],
    sample: {
      title: "Brazilian Keratin Shampoo Super Foods – 1000ML",
      brand: "cornells",
      category: "super-foods", 
      subcategory: "shampoo",
      description: "Brazilian Keratin Shampoo Super Foods – 1000ML (Cornells Series)",
      price: 985.99,
      salePrice: "",
      totalStock: 96,
      variations: JSON.stringify([{ label: "1000ml", image: "" }])
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Excel (.xlsx) or CSV file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setImportResults(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/admin/products/bulk-import", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();
      
      if (result.success) {
        setImportResults(result.data);
        toast({
          title: "Import successful",
          description: `Imported ${result.data.successful} products, ${result.data.failed} failed`
        });
        if (onImportComplete) onImportComplete();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const downloadTemplate = () => {
    // Create and download template file
    const csvContent = Object.values(templateData.columns).join(",") + "\n" +
      Object.values(templateData.sample).join(",");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Bulk Product Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Section */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="bulk-upload"
                  accept=".xlsx,.csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
                <label
                  htmlFor="bulk-upload"
                  className={`cursor-pointer flex flex-col items-center justify-center h-32 ${
                    isUploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">
                    {isUploading ? "Uploading..." : "Upload Excel/CSV File"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports .xlsx and .csv formats
                  </p>
                </label>
                
                {isUploading && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress}% complete
                    </p>
                  </div>
                )}
              </div>

              <Button 
                onClick={downloadTemplate} 
                variant="outline" 
                className="w-full"
                disabled={isUploading}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h4 className="font-medium">Import Instructions:</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use the template to ensure proper formatting</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Brand must be: rekker, saffron, or cornells</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Categories and subcategories must match your config</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Variations should be JSON format: [{"{label: 'Size', image: ''}"}]</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Results */}
          {importResults && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Import Results:</h4>
              <div className="flex gap-4 text-sm">
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Successful: {importResults.successful}
                </Badge>
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Failed: {importResults.failed}
                </Badge>
              </div>
              
              {importResults.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-600">Errors:</p>
                  <ul className="text-xs text-red-500 mt-1 space-y-1">
                    {importResults.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {importResults.errors.length > 5 && (
                      <li>... and {importResults.errors.length - 5} more errors</li>
                    )}
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