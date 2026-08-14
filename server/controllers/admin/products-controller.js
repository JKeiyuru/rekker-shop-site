// server/controllers/admin/products-controller.js - Updated for Rekker with Bulk Import
const XLSX = require("xlsx");
const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Upload image to Cloudinary
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.json({
      success: false,
      message: "Error occurred during image upload",
    });
  }
};

// Bulk import products from Excel/CSV
const bulkImportProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    let products = [];
    const file = req.file;

    // Parse Excel or CSV file
    if (file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      products = XLSX.utils.sheet_to_json(worksheet);
    } else if (file.originalname.endsWith('.csv')) {
      const csvData = file.buffer.toString();
      const workbook = XLSX.read(csvData, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      products = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file format. Please upload Excel (.xlsx, .xls) or CSV file."
      });
    }

    console.log(`Processing ${products.length} products for import`);

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    // Process products in batches to avoid memory issues
    const batchSize = 10;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (let j = 0; j < batch.length; j++) {
        const productData = batch[j];
        const rowNumber = i + j + 2; // +2 because Excel rows start at 1 and header is row 1
        
        try {
          // Transform Excel data to match your schema
          const transformedProduct = transformProductData(productData);
          
          // Validate required fields
          if (!transformedProduct.title) {
            throw new Error("Missing product title");
          }
          if (!transformedProduct.brand) {
            throw new Error("Missing brand");
          }
          if (!transformedProduct.category) {
            throw new Error("Missing category");
          }
          if (!transformedProduct.price || isNaN(transformedProduct.price)) {
            throw new Error("Invalid or missing price");
          }

          // Validate brand
          const validBrands = ['rekker', 'saffron', 'cornells'];
          if (!validBrands.includes(transformedProduct.brand.toLowerCase())) {
            throw new Error(`Invalid brand. Must be one of: ${validBrands.join(', ')}`);
          }

          // Validate subcategory requirement for Saffron and Cornells
          if ((transformedProduct.brand === 'saffron' || transformedProduct.brand === 'cornells') && !transformedProduct.subcategory) {
            throw new Error(`Subcategory is required for ${transformedProduct.brand} products`);
          }

          // Create new product and bypass image validation for bulk import
          const newProduct = new Product(transformedProduct);
          await newProduct.save({ validateBeforeSave: false }); // THIS IS THE KEY LINE
          results.successful++;
          console.log(`✅ Successfully imported: ${transformedProduct.title}`);
          
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: ${error.message} - "${productData.title || productData.ITEMS || 'Unknown Product'}"`);
          console.error(`Import error for row ${rowNumber}:`, error.message);
        }
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`
    });

  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({
      success: false,
      message: "Bulk import failed",
      error: error.message
    });
  }
};

// Helper function to transform Excel data to your schema
const transformProductData = (excelData) => {
  // Map Excel columns to your schema - handle different column name variations
  const product = {
    title: excelData.title || excelData.ITEMS || excelData['Product Name'] || excelData.Name || '',
    brand: (excelData.brand || 'cornells').toLowerCase().trim(),
    category: mapCategory(excelData.category || excelData.Category || excelData.Collection),
    subcategory: mapSubcategory(excelData.subcategory || excelData.Subcategory || excelData.Type),
    description: excelData.description || excelData.Description || excelData.ITEMS || excelData.title || '',
    price: parseFloat(excelData.price || excelData.Price || excelData['SP+VAT'] || excelData.Cost || 0),
    salePrice: excelData.salePrice ? parseFloat(excelData.salePrice) : 0,
    totalStock: parseInt(excelData.totalStock || excelData.stock || excelData['TOTAL NO. OF PCs'] || excelData.Quantity || 0),
    // ADD THE PLACEHOLDER IMAGE HERE:
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop", // Add this line

    variations: []
  };

  // Handle variations based on pack size and quantity
  const packSize = excelData.pack || excelData.PACKG || excelData.Packaging;
  const piecesPerPack = excelData.pieces || excelData['NO OF PCS/ CTN'] || excelData.Quantity;
  
  if (packSize && piecesPerPack) {
    product.variations.push({
      label: `${packSize} - ${piecesPerPack}pcs`,
      // ADD PLACEHOLDER FOR VARIATIONS TOO:
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop" // Add this line // Images will be added via admin panel later
    });
  } else if (packSize) {
    product.variations.push({
      label: packSize,
      // ADD PLACEHOLDER FOR VARIATIONS TOO:
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop" // Add this line
    });
  }

  // If no variations were added but we have size information, create a default variation
  if (product.variations.length === 0) {
    const size = excelData.size || excelData.Size || excelData.Capacity;
    if (size) {
      product.variations.push({
        label: size,
        // ADD PLACEHOLDER FOR VARIATIONS TOO:
        image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop" // Add this line
      });
    }
  }

  // If still no variations, create a default one to ensure validation passes when manually editing
  if (product.variations.length === 0 && excelData.variations) {
    product.variations.push({
      label: excelData.variations.toString().trim(),
      // ADD PLACEHOLDER FOR VARIATIONS TOO:
      image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&h=400&fit=crop" // Add this line
    });
  }

  return product;
};

// Helper functions to map your Excel categories to your config
const mapCategory = (excelCategory) => {
  if (!excelCategory) return 'super-foods';
  
  const categoryMap = {
    'super foods': 'super-foods',
    'superfoods': 'super-foods',
    'dark & beautiful': 'dark-beautiful',
    'dark and beautiful': 'dark-beautiful',
    'bold & beautiful': 'bold-beautiful', 
    'bold and beautiful': 'bold-beautiful',
    'cute & pretty': 'cute-pretty',
    'cute and pretty': 'cute-pretty',
    'estiara passion': 'estiara-passion'
  };
  
  const normalizedCategory = excelCategory.toLowerCase().trim();
  return categoryMap[normalizedCategory] || normalizedCategory;
};

const mapSubcategory = (excelSubcategory) => {
  if (!excelSubcategory) return null;
  
  const subcategoryMap = {
    // Super Foods subcategories
    'shampoo': 'shampoo',
    'conditioner': 'conditioner',
    'hair mask': 'hair-mask',
    'hair serum': 'hair-serum',
    'shower gel': 'shower-gel',
    'body lotion': 'body-lotion',
    'body scrub': 'body-scrub',
    'facial scrub': 'facial-scrub',
    'facial mask': 'facial-mask',
    'face wash': 'face-wash',
    'facial cream': 'facial-cream',
    'baby care': 'baby-care',
    'gift sets': 'gift-sets',
    
    // Dark & Beautiful subcategories
    'styling products': 'styling-products',
    'hair treatments': 'hair-treatments',
    'oils serums': 'oils-serums',
    'kids hair care': 'kids-hair-care',
    
    // Bold & Beautiful subcategories
    'body cream': 'body-cream',
    'shower scrub': 'shower-scrub',
    'hand body lotion': 'hand-body-lotion',
    'body butter': 'body-butter',
    'body oil': 'body-oil',
    'moisturizer': 'moisturizer',
    'sugar scrub': 'sugar-scrub',
    'facial care': 'facial-care',
    'serums': 'serums',
    'deodorant': 'deodorant',
    'day night cream': 'day-night-cream',
    
    // Cute & Pretty subcategories
    'baby wash shampoo': 'baby-wash-shampoo',
    'baby lotion': 'baby-lotion',
    'baby oil': 'baby-oil',
    'baby cream': 'baby-cream',
    'nappy rash cream': 'nappy-rash-cream',
    'kids shampoo': 'kids-shampoo',
    'kids conditioner': 'kids-conditioner',
    'kids styling': 'kids-styling',
    'kids treatments': 'kids-treatments'
  };
  
  const normalizedSubcategory = excelSubcategory.toLowerCase().trim();
  return subcategoryMap[normalizedSubcategory] || normalizedSubcategory;
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    console.log("=== ADD PRODUCT REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      image,
      title,
      description,
      brand,
      category,
      subcategory,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !brand || !category || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, brand, category, price, and totalStock are required",
      });
    }

    // Validate brand
    const validBrands = ['rekker', 'saffron', 'cornells'];
    const normalizedBrand = brand.toLowerCase().trim();
    if (!validBrands.includes(normalizedBrand)) {
      return res.status(400).json({
        success: false,
        message: `Invalid brand. Must be one of: ${validBrands.join(', ')}`,
      });
    }

    // Validate subcategory requirement for Saffron and Cornells
    if ((normalizedBrand === 'saffron' || normalizedBrand === 'cornells') && !subcategory) {
      return res.status(400).json({
        success: false,
        message: `Subcategory is required for ${brand} products`,
      });
    }

    // Initialize parsedVariations as an empty array
    let parsedVariations = [];
    
    // Parse variations if it exists
    if (variations) {
      try {
        if (typeof variations === 'string') {
          parsedVariations = JSON.parse(variations);
        } else if (Array.isArray(variations)) {
          parsedVariations = variations;
        } else {
          parsedVariations = [];
        }
        
        // Validate variations structure
        if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
          for (let i = 0; i < parsedVariations.length; i++) {
            const variation = parsedVariations[i];
            if (!variation.image || !variation.label) {
              return res.status(400).json({
                success: false,
                message: `Variation ${i + 1} is missing image or label`,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to parse variations:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid variations format. Must be a valid JSON array.",
        });
      }
    }

    // Validate that product has either main image or variations
    if (!image && (!parsedVariations || parsedVariations.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Product must have either a main image or at least one variation",
      });
    }

    const productData = {
      image: image || null,
      title: title.trim(),
      description: description ? description.trim() : "",
      brand: normalizedBrand,
      category: category.trim().toLowerCase(),
      subcategory: subcategory ? subcategory.trim().toLowerCase() : null,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations || []
    };

    console.log("Creating product with data:", {
      ...productData,
      variations: productData.variations.map(v => ({
        label: v.label,
        hasImage: !!v.image
      }))
    });

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();

    console.log("Product saved successfully:", {
      id: savedProduct._id,
      brand: savedProduct.brand,
      category: savedProduct.category,
      subcategory: savedProduct.subcategory,
      variationsCount: savedProduct.variations.length
    });

    res.status(201).json({
      success: true,
      data: savedProduct,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
      error: error.message,
    });
  }
};

// Fetch all products
const fetchAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// Edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("=== EDIT PRODUCT REQUEST ===");
    console.log("Product ID:", id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      image,
      title,
      description,
      brand,
      category,
      subcategory,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !brand || !category || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, brand, category, price, and totalStock are required",
      });
    }

    // Validate brand
    const validBrands = ['rekker', 'saffron', 'cornells'];
    const normalizedBrand = brand.toLowerCase().trim();
    if (!validBrands.includes(normalizedBrand)) {
      return res.status(400).json({
        success: false,
        message: `Invalid brand. Must be one of: ${validBrands.join(', ')}`,
      });
    }

    // Validate subcategory requirement for Saffron and Cornells
    if ((normalizedBrand === 'saffron' || normalizedBrand === 'cornells') && !subcategory) {
      return res.status(400).json({
        success: false,
        message: `Subcategory is required for ${brand} products`,
      });
    }

    // Initialize parsedVariations as an empty array
    let parsedVariations = [];
    
    // Parse variations if it exists
    if (variations) {
      try {
        if (typeof variations === "string") {
          parsedVariations = JSON.parse(variations);
        } else if (Array.isArray(variations)) {
          parsedVariations = variations;
        } else {
          parsedVariations = [];
        }
      } catch (err) {
        console.error("Failed to parse variations:", err);
        return res.status(400).json({
          success: false,
          message: "Invalid variations format. Must be a valid JSON array.",
        });
      }
    }

    // Validate variations structure
    if (parsedVariations && parsedVariations.length > 0) {
      for (let i = 0; i < parsedVariations.length; i++) {
        const variation = parsedVariations[i];
        if (!variation.image || !variation.label) {
          return res.status(400).json({
            success: false,
            message: `Variation ${i + 1} is missing image or label`,
          });
        }
      }
    }

    // Validate that product has either main image or variations
    if (!image && (!parsedVariations || parsedVariations.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Product must have either a main image or at least one variation",
      });
    }

    const updateData = {
      image: image || null,
      title: title.trim(),
      description: description ? description.trim() : "",
      brand: normalizedBrand,
      category: category.trim().toLowerCase(),
      subcategory: subcategory ? subcategory.trim().toLowerCase() : null,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations || []
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product updated successfully:", {
      id: updatedProduct._id,
      brand: updatedProduct.brand,
      category: updatedProduct.category,
      subcategory: updatedProduct.subcategory,
      variationsCount: updatedProduct.variations.length
    });

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Edit Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
      error: error.message,
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting product",
    });
  }
};

// Get products by brand
const getProductsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const normalizedBrand = brand.toLowerCase().trim();
    
    const validBrands = ['rekker', 'saffron', 'cornells'];
    if (!validBrands.includes(normalizedBrand)) {
      return res.status(400).json({
        success: false,
        message: `Invalid brand. Must be one of: ${validBrands.join(', ')}`,
      });
    }

    const products = await Product.findByBrand(normalizedBrand).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products by brand error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products by brand",
    });
  }
};

// Get products by brand and category
const getProductsByBrandAndCategory = async (req, res) => {
  try {
    const { brand, category } = req.params;
    const normalizedBrand = brand.toLowerCase().trim();
    const normalizedCategory = category.toLowerCase().trim();

    const products = await Product.findByBrandAndCategory(normalizedBrand, normalizedCategory)
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products by brand and category error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

// Get products by full category (brand, category, subcategory)
const getProductsByFullCategory = async (req, res) => {
  try {
    const { brand, category, subcategory } = req.params;
    const normalizedBrand = brand.toLowerCase().trim();
    const normalizedCategory = category.toLowerCase().trim();
    const normalizedSubcategory = subcategory ? subcategory.toLowerCase().trim() : null;

    const products = await Product.findByFullCategory(
      normalizedBrand, 
      normalizedCategory, 
      normalizedSubcategory
    ).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products by full category error:", error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching products",
    });
  }
};

module.exports = {
  handleImageUpload,
  bulkImportProducts,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
  getProductsByBrand,
  getProductsByBrandAndCategory,
  getProductsByFullCategory,
};