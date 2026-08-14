/* eslint-disable no-unused-vars */
// client/src/pages/admin-view/products.jsx
import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import VariationUploader from "@/components/admin-view/variation-uploader";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BulkImport from "@/components/admin-view/bulk-import";
import { Upload } from "lucide-react";

const initialFormData = {
  brand: "",
  image: null,
  title: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  variations: [],
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { productList, isLoading } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Debug logging
  useEffect(() => {
    console.log("FormData updated:", {
      ...formData,
      variations: formData.variations?.map(v => ({
        label: v.label,
        imagePreview: v.image?.substring(0, 50) + "...",
        hasId: !!v._id
      }))
    });
  }, [formData]);

  function resetForm() {
    setFormData(initialFormData);
    setImageFile(null);
    setUploadedImageUrl("");
    setCurrentEditedId(null);
  }

  function handleCloseDialog() {
    setOpenCreateProductsDialog(false);
    resetForm();
  }

  function onSubmit(event) {
    event.preventDefault();

    // Prepare the payload
    const payload = {
      ...formData,
      image: uploadedImageUrl || formData.image || null,
      price: Number(formData.price),
      salePrice: formData.salePrice ? Number(formData.salePrice) : 0,
      totalStock: Number(formData.totalStock),
      averageReview: formData.averageReview ? Number(formData.averageReview) : 0,
      variations: formData.variations?.map(v => ({
        image: v.image,
        label: v.label
      })) || []
    };

    console.log("Submitting payload:", {
      ...payload,
      variations: payload.variations.map(v => ({
        label: v.label,
        hasImage: !!v.image
      }))
    });

    const action = currentEditedId 
      ? dispatch(editProduct({ id: currentEditedId, formData: payload }))
      : dispatch(addNewProduct(payload));

    action.then((data) => {
      console.log("Submit response:", data);
      
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ 
          title: currentEditedId 
            ? "Product updated successfully" 
            : "Product added successfully",
          description: `Product "${payload.title}" has been ${currentEditedId ? 'updated' : 'added'} with ${payload.variations.length} variations.`
        });
        handleCloseDialog();
      } else {
        const errorMessage = data?.payload?.message || data?.error?.message || "Unknown error occurred";
        console.error("Submit error:", errorMessage);
        toast({ 
          title: currentEditedId 
            ? "Failed to update product" 
            : "Failed to add product",
          description: errorMessage,
          variant: "destructive" 
        });
      }
    }).catch((error) => {
      console.error("Submit catch error:", error);
      toast({ 
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive" 
      });
    });
  }

  function handleDelete(getCurrentProductId) {
    if (!getCurrentProductId) {
      toast({
        title: "Error",
        description: "Invalid product ID",
        variant: "destructive"
      });
      return;
    }

    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({ 
          title: "Product deleted successfully",
          description: "The product has been removed from your inventory."
        });
      } else {
        toast({
          title: "Failed to delete product",
          description: data?.payload?.message || "An error occurred",
          variant: "destructive"
        });
      }
    });
  }

  function isFormValid() {
    // Check required fields based on brand
    const requiredFields = ['brand', 'title', 'category', 'price', 'totalStock'];
    
    // Add subcategory as required for Saffron and Cornells
    if (formData.brand === 'saffron' || formData.brand === 'cornells') {
      requiredFields.push('subcategory');
    }

    const areRequiredFieldsFilled = requiredFields.every(field => {
      const value = formData[field];
      return value !== "" && value !== null && value !== undefined;
    });

    // Check if there's at least one image (main image or variations)
    const hasMainImage = uploadedImageUrl || formData.image;
    const hasVariations = formData.variations?.length > 0;
    const hasImage = hasMainImage || hasVariations;

    // Validate price values
    const priceValid = formData.price && !isNaN(Number(formData.price)) && Number(formData.price) >= 0;
    const stockValid = formData.totalStock && !isNaN(Number(formData.totalStock)) && Number(formData.totalStock) >= 0;

    return areRequiredFieldsFilled && hasImage && priceValid && stockValid;
  }

  function handleEdit(productData) {
    console.log("Handling edit with data:", productData);
    
    setFormData(productData);
    setUploadedImageUrl(productData.image || "");
    setCurrentEditedId(productData._id || null);
    setOpenCreateProductsDialog(true);
  }

  function handleAddNewProduct() {
    resetForm();
    setOpenCreateProductsDialog(true);
  }

  // Fetch products on component mount
  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Filter products by brand
  const filteredProducts = activeTab === "all" 
    ? productList 
    : productList?.filter(product => product.brand === activeTab);

  // Count products by brand
  const productCounts = {
    all: productList?.length || 0,
    rekker: productList?.filter(p => p.brand === "rekker")?.length || 0,
    saffron: productList?.filter(p => p.brand === "saffron")?.length || 0,
    cornells: productList?.filter(p => p.brand === "cornells")?.length || 0,
  };

  const isEditMode = !!currentEditedId;

  return (
    <Fragment>
      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Bulk Product Import</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowBulkImport(false)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
              <BulkImport 
                onImportComplete={() => {
                  setShowBulkImport(false);
                  dispatch(fetchAllProducts()); // Refresh the list
                }} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-5 w-full flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-gray-600 mt-1">
            Manage products across Rekker, Saffron, and Cornells brands
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBulkImport(true)} 
            variant="outline" 
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button onClick={handleAddNewProduct} className="gap-2">
            <span>+</span>
            Add New Product
          </Button>
        </div>
      </div>

      {/* Brand Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4 max-w-[600px]">
          <TabsTrigger value="all" className="relative">
            All Products
            <Badge variant="secondary" className="ml-2 bg-gray-600 text-white">
              {productCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rekker" className="relative">
            Rekker
            <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
              {productCounts.rekker}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="saffron" className="relative">
            Saffron
            <Badge variant="secondary" className="ml-2 bg-green-600 text-white">
              {productCounts.saffron}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cornells" className="relative">
            Cornells
            <Badge variant="secondary" className="ml-2 bg-purple-600 text-white">
              {productCounts.cornells}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="w-full max-w-sm mx-auto">
              <div className="animate-pulse">
                <div className="h-[300px] bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                    <div className="h-8 bg-gray-300 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              product={productItem}
              handleDelete={handleDelete}
              onEdit={handleEdit}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l3 3 3-3"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab !== "all" ? activeTab : ""} products yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first product to the inventory.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowBulkImport(true)} variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Import
              </Button>
              <Button onClick={handleAddNewProduct}>
                Add Single Product
              </Button>
            </div>
          </div>
        </div>
      )}

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseDialog();
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto w-full sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="text-2xl">
              {isEditMode ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            {isEditMode && (
              <p className="text-sm text-gray-600">
                Updating product with ID: {currentEditedId?.slice(-8)}
              </p>
            )}
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Brand Info Banner */}
            {formData.brand && (
              <div className={`p-4 rounded-lg border-2 ${
                formData.brand === 'rekker' ? 'bg-blue-50 border-blue-200' :
                formData.brand === 'saffron' ? 'bg-green-50 border-green-200' :
                'bg-purple-50 border-purple-200'
              }`}>
                <p className="font-medium">
                  {formData.brand === 'rekker' && '🏢 Rekker Products'}
                  {formData.brand === 'saffron' && '🧼 Saffron Products (Manufactured by Rekker)'}
                  {formData.brand === 'cornells' && '💄 Cornells Products (Distributed by Rekker)'}
                </p>
              </div>
            )}

            {/* Main Product Image Upload */}
            <div>
              <h3 className="text-lg font-medium mb-3">Main Product Image</h3>
              <ProductImageUpload
                imageFile={imageFile}
                setImageFile={setImageFile}
                uploadedImageUrl={uploadedImageUrl}
                setUploadedImageUrl={setUploadedImageUrl}
                imageLoadingState={imageLoadingState}
                setImageLoadingState={setImageLoadingState}
                isEditMode={false}
                isCustomStyling={true}
              />
              <p className="text-sm text-gray-600 mt-2">
                This will be the main image shown for your product. You can also add variations below.
              </p>
            </div>

            <Separator />

            {/* Product Variations */}
            <div>
              <VariationUploader 
                formData={formData} 
                setFormData={setFormData} 
              />
            </div>

            <Separator />

            {/* Product Details Form */}
            <div>
              <h3 className="text-lg font-medium mb-3">Product Details</h3>
              <CommonForm
                onSubmit={onSubmit}
                formData={formData}
                setFormData={setFormData}
                buttonText={isEditMode ? "Update Product" : "Add Product"}
                formControls={addProductFormElements}
                isBtnDisabled={!isFormValid()}
              />
            </div>

            {/* Form Validation Status */}
            {!isFormValid() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Form Requirements:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Brand is required</li>
                  <li>• Title is required</li>
                  <li>• Category is required</li>
                  {(formData.brand === 'saffron' || formData.brand === 'cornells') && (
                    <li>• Subcategory is required for {formData.brand}</li>
                  )}
                  <li>• Price must be a valid number ≥ 0</li>
                  <li>• Stock must be a valid number ≥ 0</li>
                  <li>• At least one image (main image or variation) is required</li>
                </ul>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;