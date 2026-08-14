/* eslint-disable react/prop-types */
// client/src/components/admin-view/product-tile.jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brandOptionsMap, categoryOptionsMap, subcategoryOptionsMap } from "@/config";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
  onEdit
}) {
  
  function handleEditClick() {
    console.log("Editing product:", product);
    
    // Create a deep copy of the product data for editing
    const productData = {
      brand: product.brand || "",
      image: product.image || "",
      title: product.title || "",
      description: product.description || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      price: product.price || "",
      salePrice: product.salePrice || "",
      totalStock: product.totalStock || "",
      averageReview: product.averageReview || 0,
      variations: product.variations ? product.variations.map(v => ({
        image: v.image,
        label: v.label,
        _id: v._id
      })) : []
    };
    
    console.log("Setting form data for edit:", productData);
    
    if (onEdit) {
      onEdit(productData);
    } else {
      setFormData(productData);
      setCurrentEditedId(product._id);
      setOpenCreateProductsDialog(true);
    }
  }

  // Determine the display image (main image or first variation)
  const displayImage = product?.image || 
    (product?.variations && product.variations.length > 0 ? product.variations[0].image : null);

  const hasVariations = product?.variations && product.variations.length > 0;
  const variationCount = hasVariations ? product.variations.length : 0;

  // Get brand display name
  const brandDisplay = brandOptionsMap[product?.brand] || product?.brand || "Unknown";
  
  // Get brand color
  const getBrandColor = () => {
    switch(product?.brand) {
      case 'rekker': return 'bg-blue-500';
      case 'saffron': return 'bg-green-500';
      case 'cornells': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Get category and subcategory display
  const categoryDisplay = categoryOptionsMap[product?.category] || product?.category;
  const subcategoryDisplay = product?.subcategory ? 
    (subcategoryOptionsMap[product.subcategory] || product.subcategory) : null;

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product?.title || "Product"}
            className="w-full h-[300px] object-cover rounded-t-lg"
            onError={(e) => {
              // Use a working placeholder image instead of /api/placeholder
              e.target.src = "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop";
              e.target.alt = "Image not available";
            }}
          />
        ) : (
          <div className="w-full h-[300px] bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
        
        {/* Brand badge */}
        <Badge 
          className={`absolute top-2 left-2 ${getBrandColor()} text-white hover:${getBrandColor()}/80`}
        >
          {brandDisplay}
        </Badge>

        {/* Variation count badge */}
        {hasVariations && (
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2 bg-black/70 text-white hover:bg-black/80"
          >
            {variationCount} variation{variationCount > 1 ? 's' : ''}
          </Badge>
        )}

        {/* Sale badge */}
        {product?.salePrice > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute bottom-2 right-2"
          >
            Sale
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h2 className="text-xl font-bold mb-2 line-clamp-2" title={product?.title}>
          {product?.title}
        </h2>
        
        {/* Price section */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-semibold ${
                product?.salePrice > 0 ? "line-through text-gray-500" : "text-primary"
              }`}
            >
              KES {product?.price}
            </span>
            {product?.salePrice > 0 && (
              <span className="text-lg font-bold text-red-600">
                KES {product?.salePrice}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Stock: {product?.totalStock || 0}
          </div>
        </div>

        {/* Category and Subcategory */}
        <div className="mb-3 space-y-1">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-xs">
              {categoryDisplay}
            </Badge>
            {subcategoryDisplay && (
              <Badge variant="outline" className="text-xs bg-gray-50">
                {subcategoryDisplay}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Variations preview */}
        {hasVariations && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700 mb-2">Variations:</p>
            <div className="flex flex-wrap gap-2">
              {product.variations.slice(0, 4).map((variation, index) => (
                <div key={variation._id || index} className="relative group">
                  <img
                    src={variation.image}
                    alt={variation.label}
                    className="w-10 h-10 object-cover rounded border-2 border-gray-200 hover:border-primary transition-colors"
                    title={variation.label}
                    onError={(e) => {
                      // Use a working placeholder image instead of /api/placeholder
                      e.target.src = "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop";
                      e.target.alt = "Variation image not available";
                    }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {variation.label}
                  </div>
                </div>
              ))}
              {variationCount > 4 && (
                <div className="w-10 h-10 bg-gray-100 rounded border-2 border-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{variationCount - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Product stats */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Rating: {product?.averageReview || 0}/5</span>
          <span>ID: {product?._id?.slice(-6) || 'N/A'}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={handleEditClick} 
            className="flex-1"
            variant="outline"
          >
            Edit
          </Button>
          <Button
            onClick={() => handleDelete(product._id)}
            variant="destructive"
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AdminProductTile;