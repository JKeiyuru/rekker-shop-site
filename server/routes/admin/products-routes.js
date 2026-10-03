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

// Configure multer for bulk import file uploads (spreadsheet + optional images ZIP)
const bulkUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "file") {
      const isSpreadsheet =
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheet") ||
        file.mimetype === "text/csv" ||
        file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.originalname.match(/\.(xlsx|xls|csv)$/i);
      return isSpreadsheet
        ? cb(null, true)
        : cb(new Error("Only Excel and CSV files are allowed for the product sheet"), false);
    }
    if (file.fieldname === "imagesZip") {
      const isZip =
        file.mimetype === "application/zip" ||
        file.mimetype === "application/x-zip-compressed" ||
        file.originalname.match(/\.zip$/i);
      return isZip
        ? cb(null, true)
        : cb(new Error("Images must be uploaded as a single .zip file"), false);
    }
    cb(new Error("Unexpected file field"), false);
  },
  limits: { fileSize: 40 * 1024 * 1024 } // 40MB — the zip of images is the larger of the two
});

// Image upload
router.post("/upload-image", upload.single("my_file"), handleImageUpload);

// CRUD operations
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/get", fetchAllProducts);

// Bulk import route — accepts the product sheet ("file") and an optional
// ZIP of real product images ("imagesZip")
router.post(
  "/bulk-import",
  bulkUpload.fields([
    { name: "file", maxCount: 1 },
    { name: "imagesZip", maxCount: 1 },
  ]),
  bulkImportProducts
);

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
    // Create template data reflecting the real-image import format
    const templateData = [
      {
        "title": "Brazilian Keratin Shampoo – 1000ML",
        "brand": "cornells",
        "category": "Hair Care",
        "subcategory": "Shampoo",
        "description": "Brazilian Keratin Shampoo – 1000ML (Cornells Series)",
        "sku": "COR-BKS-1000",
        "price": "985.99",
        "salePrice": "",
        "totalStock": "96",
        "image": "cornells-bks-main.jpg",
        "extra_images": "cornells-bks-back.jpg;cornells-bks-angle.jpg",
        "variation_labels": "",
        "variation_images": ""
      },
      {
        "title": "Bio Saff Curl Activator",
        "brand": "biosaff",
        "category": "Hair Care",
        "subcategory": "Styling, Mousse & Edge Care",
        "description": "Defines and holds curls all day",
        "sku": "BS-CA-250",
        "price": "650",
        "salePrice": "",
        "totalStock": "40",
        "image": "https://res.cloudinary.com/example/already-hosted-image.jpg",
        "extra_images": "",
        "variation_labels": "250ml;500ml",
        "variation_images": "bs-curl-250.jpg;bs-curl-500.jpg"
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