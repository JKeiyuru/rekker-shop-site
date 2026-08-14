// server/routes/admin/products-routes.js - Updated for Rekker with Bulk Import
const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
  getProductsByBrand,
  getProductsByBrandAndCategory,
  getProductsByFullCategory,
  bulkImportProducts
} = require("../../controllers/admin/products-controller");
const { upload } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

// Configure multer for bulk import file uploads
const bulkUpload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || 
        file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel and CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Image upload
router.post("/upload-image", upload.single("my_file"), handleImageUpload);

// CRUD operations
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

// Bulk import route
router.post("/bulk-import", bulkUpload.single("file"), bulkImportProducts);

// Brand-specific routes
router.get("/brand/:brand", getProductsByBrand);
router.get("/brand/:brand/category/:category", getProductsByBrandAndCategory);
router.get("/brand/:brand/category/:category/subcategory/:subcategory", getProductsByFullCategory);

// Test route for variations (can be removed in production)
router.post("/test-variations", async (req, res) => {
  try {
    console.log("Test route hit");
    
    const testProduct = new Product({
      title: "TEST VARIATIONS PRODUCT",
      brand: "rekker",
      price: 100,
      category: "test",
      totalStock: 10,
      variations: [{
        image: "https://test.com/image.jpg", 
        label: "Test Variation"
      }]
    });

    const saved = await testProduct.save();
    const fromDb = await Product.findById(saved._id);

    res.json({
      success: true,
      saved: {
        brand: saved.brand,
        category: saved.category,
        subcategory: saved.subcategory,
        variations: saved.variations
      },
      fromDb: {
        brand: fromDb.brand,
        category: fromDb.category,
        subcategory: fromDb.subcategory,
        variations: fromDb.variations
      },
      match: JSON.stringify(saved.variations) === JSON.stringify(fromDb.variations)
    });
  } catch (e) {
    console.error("Test route error:", e);
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: e.message
    });
  }
});

// Test route for brand validation
router.post("/test-brand", async (req, res) => {
  try {
    const { brand, category, subcategory } = req.body;
    
    const testProduct = new Product({
      title: "TEST BRAND PRODUCT",
      brand: brand,
      category: category,
      subcategory: subcategory,
      price: 100,
      totalStock: 10,
      image: "https://test.com/image.jpg"
    });

    const saved = await testProduct.save();

    res.json({
      success: true,
      product: {
        id: saved._id,
        brand: saved.brand,
        category: saved.category,
        subcategory: saved.subcategory
      }
    });
  } catch (e) {
    console.error("Brand test error:", e);
    res.status(500).json({
      success: false,
      message: "Brand test failed",
      error: e.message
    });
  }
});

// Bulk import template download route
router.get("/bulk-import-template", (req, res) => {
  try {
    // Create template data
    const templateData = [
      {
        "title": "Brazilian Keratin Shampoo Super Foods – 1000ML",
        "brand": "cornells",
        "category": "super-foods",
        "subcategory": "shampoo",
        "description": "Brazilian Keratin Shampoo Super Foods – 1000ML (Cornells Series)",
        "price": "985.99",
        "salePrice": "",
        "totalStock": "96",
        "variations": "[{\"label\": \"1000ml\", \"image\": \"\"}]"
      },
      {
        "title": "Avocado Manuka Honey Shampoo Super Foods – 1000ML",
        "brand": "cornells", 
        "category": "super-foods",
        "subcategory": "shampoo",
        "description": "Avocado Manuka Honey Shampoo Super Foods – 1000ML (Cornells Series)",
        "price": "985.99",
        "salePrice": "",
        "totalStock": "108",
        "variations": "[{\"label\": \"1000ml\", \"image\": \"\"}]"
      }
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products Template");
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="product-import-template.xlsx"');
    
    // Generate and send the file
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);

  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate template",
      error: error.message
    });
  }
});

module.exports = router;