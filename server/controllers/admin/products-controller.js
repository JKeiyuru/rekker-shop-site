// server/controllers/admin/products-controller.js - Updated for Rekker with Bulk Import
const XLSX = require("xlsx");
const { imageUploadUtil, friendlyUploadError } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const { resolveProductCatalogRefs, normalizeBrandInput, slugify } = require("../../helpers/catalog-resolver");

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
    res.status(500).json({
      success: false,
      message: friendlyUploadError(error),
    });
  }
};

// ── Bulk import products from Excel/CSV, with a ZIP of real images ─────────
//
// Expected spreadsheet columns (header row):
//   title            - required
//   brand            - required: rekker | saffron | cornells | biosaff
//   category         - required: a slug, e.g. "hair-mousse" (must match the
//                       storefront's category list for that brand — see
//                       client/src/config/index.js for the exact slugs)
//   subcategory      - required for saffron/cornells, optional otherwise
//   description      - optional
//   sku              - optional
//   price            - required, number
//   salePrice        - optional, number
//   totalStock       - required, number
//   image            - main photo: either a filename inside the uploaded ZIP
//                       (e.g. "shampoo-1-main.jpg") or a direct https:// URL
//   extra_images     - additional photos of the SAME product (angles, back,
//                       lifestyle shots) — semicolon-separated filenames or
//                       URLs, e.g. "shampoo-1-b.jpg;shampoo-1-c.jpg"
//   variation_labels - semicolon-separated labels, e.g. "250ml;500ml;1L"
//   variation_images - semicolon-separated filenames/URLs, SAME COUNT AND
//                       ORDER as variation_labels
//
// Images are matched by filename against whatever's inside the ZIP (case-
// insensitive, ignoring any folder structure). The same filename referenced
// by multiple rows/variations is only uploaded to Cloudinary once.
const bulkImportProducts = async (req, res) => {
  try {
    const spreadsheetFile = req.files?.file?.[0];
    const zipFile = req.files?.imagesZip?.[0];

    if (!spreadsheetFile) {
      return res.status(400).json({
        success: false,
        message: "No spreadsheet file uploaded",
      });
    }

    // ---- Build a filename -> Buffer map from the ZIP (if provided) --------
    const imageMap = new Map(); // lowercased basename -> Buffer
    if (zipFile) {
      try {
        const AdmZip = require("adm-zip");
        const zip = new AdmZip(zipFile.buffer);
        const entries = zip.getEntries();
        for (const entry of entries) {
          if (entry.isDirectory) continue;
          const baseName = entry.entryName.split("/").pop().trim().toLowerCase();
          if (!baseName) continue;
          imageMap.set(baseName, entry.getData());
        }
      } catch (zipError) {
        return res.status(400).json({
          success: false,
          message: "Could not read the images ZIP file. Make sure it's a valid .zip archive.",
          error: zipError.message,
        });
      }
    }

    // ---- Parse the spreadsheet --------------------------------------------
    let rows = [];
    const file = spreadsheetFile;
    if (file.originalname.match(/\.(xlsx|xls)$/i)) {
      const workbook = XLSX.read(file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else if (file.originalname.match(/\.csv$/i)) {
      const workbook = XLSX.read(file.buffer.toString(), { type: "string" });
      const sheetName = workbook.SheetNames[0];
      rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported file format. Please upload an Excel (.xlsx, .xls) or CSV file.",
      });
    }

    console.log(`Processing ${rows.length} products for import (ZIP images: ${imageMap.size})`);

    const results = {
      successful: 0,
      failed: 0,
      errors: [],
      warnings: [],
      imagesUploaded: 0,
      newCategories: [],
    };

    // Cache so the same filename referenced across rows/variations is only
    // uploaded to Cloudinary once.
    const uploadedCache = new Map(); // lowercased filename or URL -> hosted URL

    const EXT_MIME = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      webp: "image/webp", gif: "image/gif",
    };

    async function resolveImageRef(ref, rowNumber, warnings) {
      if (!ref) return null;
      const value = String(ref).trim();
      if (!value) return null;

      // Already a hosted URL — use as-is, no upload needed.
      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      const key = value.toLowerCase();
      if (uploadedCache.has(key)) {
        return uploadedCache.get(key);
      }

      const buffer = imageMap.get(key.split("/").pop());
      if (!buffer) {
        warnings.push(`Row ${rowNumber}: image "${value}" was not found in the uploaded ZIP`);
        return null;
      }

      const ext = (value.split(".").pop() || "jpg").toLowerCase();
      const mime = EXT_MIME[ext] || "image/jpeg";
      const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;

      const uploadResult = await imageUploadUtil(dataUri);
      uploadedCache.set(key, uploadResult.secure_url || uploadResult.url);
      results.imagesUploaded += 1;
      return uploadResult.secure_url || uploadResult.url;
    }

    // Process rows sequentially (not in parallel) so Cloudinary uploads
    // don't get rate-limited, and so the image cache above works correctly.
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // header is row 1
      const rowWarningsBefore = results.warnings.length;

      try {
        const title = String(row.title || row.Title || row.ITEMS || "").trim();
        const brand = normalizeBrandInput(row.brand || row.Brand || "");
        // Keep the text exactly as typed ("Hair Care", "hair-care", an old id…);
        // the resolver below matches it to a real category.
        const category = String(row.category || row.Category || "").trim();
        const subcategory = String(row.subcategory || row.Subcategory || "").trim() || null;
        const price = parseFloat(row.price ?? row.Price ?? 0);
        const salePrice = row.salePrice ? parseFloat(row.salePrice) : 0;
        const totalStock = parseInt(row.totalStock ?? row.stock ?? row.Stock ?? 0, 10);

        if (!title) throw new Error("Missing product title");
        if (!brand) throw new Error("Missing brand");
        if (!category) throw new Error("Missing category");
        if (!price || isNaN(price)) throw new Error("Invalid or missing price");
        if (isNaN(totalStock)) throw new Error("Invalid or missing totalStock");

        // Main image
        const mainImageRef = row.image || row.Image || row["Main Image"] || "";
        const image = await resolveImageRef(mainImageRef, rowNumber, results.warnings);

        // Extra gallery images
        const extraImagesRaw = String(row.extra_images || row.extraImages || row["Extra Images"] || "").trim();
        const images = [];
        if (extraImagesRaw) {
          const refs = extraImagesRaw.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
          for (const ref of refs) {
            const url = await resolveImageRef(ref, rowNumber, results.warnings);
            if (url) images.push(url);
          }
        }

        // Variations: label list + image list, same order
        const labelListRaw = String(row.variation_labels || row.variationLabels || row["Variation Labels"] || "").trim();
        const imageListRaw = String(row.variation_images || row.variationImages || row["Variation Images"] || "").trim();
        const variations = [];
        if (labelListRaw) {
          const labels = labelListRaw.split(";").map((s) => s.trim()).filter(Boolean);
          const imageRefs = imageListRaw ? imageListRaw.split(";").map((s) => s.trim()) : [];
          if (imageListRaw && imageRefs.length !== labels.length) {
            results.warnings.push(
              `Row ${rowNumber}: variation_labels has ${labels.length} entries but variation_images has ${imageRefs.length} — extra entries were ignored`
            );
          }
          for (let v = 0; v < labels.length; v++) {
            const variationImageUrl = await resolveImageRef(imageRefs[v], rowNumber, results.warnings);
            if (!variationImageUrl) {
              results.warnings.push(`Row ${rowNumber}: variation "${labels[v]}" has no resolvable image — skipped`);
              continue;
            }
            variations.push({ label: labels[v], image: variationImageUrl });
          }
        }

        if (!image && images.length === 0 && variations.length === 0) {
          throw new Error(
            "No usable image found for this product (main image, extra_images, and variation_images all missing or unresolved — check the ZIP for matching filenames)"
          );
        }

        const productData = {
          title,
          brand,
          category,
          subcategory,
          description: String(row.description || row.Description || "").trim(),
          sku: row.sku ? String(row.sku).trim() : null,
          price,
          salePrice,
          totalStock,
          image,
          images,
          variations,
        };

        // Relational catalogue: auto-resolve (and auto-create, if new) the
        // Brand/Category documents. This is what lets a brand-new category
        // in the sheet (e.g. a "Milan" category that's never existed before
        // under Saffron Milan) get created instead of rejected — the row
        // still imports, and the category shows up in Admin > Categories
        // and in the storefront filter right away.
        try {
          const catalogRefs = await resolveProductCatalogRefs({ brand, category, subcategory, title });
          productData.brandId = catalogRefs.brandId;
          productData.categoryId = catalogRefs.categoryId;
          productData.subcategoryId = catalogRefs.subcategoryId;
          if (catalogRefs.categorySlug) productData.category = catalogRefs.categorySlug;
          productData.subcategory = catalogRefs.subcategorySlug || null;
          if (catalogRefs.productLine) productData.productLine = catalogRefs.productLine;
          productData.stock = totalStock;
          if (catalogRefs.unplacedNotes?.length > 0) {
            results.warnings.push(
              `Row ${rowNumber}: category ${catalogRefs.unplacedNotes.join(", ")} didn't match any shop category — saved under "Uncategorised". Fix it from Admin → Products → Edit.`
            );
          }
        } catch (catalogError) {
          results.warnings.push(
            `Row ${rowNumber}: could not link brand/category records (${catalogError.message}) — product still saved with its text category`
          );
        }

        const newProduct = new Product(productData);
        await newProduct.save(); // full schema validation — no more silent placeholder fallback
        results.successful++;
        console.log(`✅ Imported: ${title}`);
      } catch (error) {
        results.failed++;
        const label = row.title || row.ITEMS || row.Title || "Unknown Product";
        results.errors.push(`Row ${rowNumber}: ${error.message} — "${label}"`);
        console.error(`Import error for row ${rowNumber}:`, error.message);
      }
    }

    // De-dupe newCategories (the same brand-new category can appear across
    // many rows in one import)
    results.newCategories = [...new Set(results.newCategories)];

    res.json({
      success: true,
      data: results,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed, ${results.imagesUploaded} images uploaded, ${results.newCategories.length} new categories created`,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    res.status(500).json({
      success: false,
      message: "Bulk import failed",
      error: error.message,
    });
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    console.log("=== ADD PRODUCT REQUEST ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const {
      image,
      images,
      title,
      description,
      brand,
      category,
      subcategory,
      categoryId,
      subcategoryId,
      productLine,
      status,
      isNewArrival,
      shortDescription,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !brand || (!category && !categoryId) || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, brand, category, price, and totalStock are required",
      });
    }

    // Brand is now open-ended — any brand name is accepted and, via the
    // catalogue resolver below, auto-creates the relational Brand record if
    // it doesn't exist yet. Subcategory is optional for every brand.
    const normalizedBrand = normalizeBrandInput(brand);

    // Parse the extra-images gallery (images[] on the schema) — same
    // JSON-or-array handling as variations, since it travels through the
    // same JSON-stringified-in-formData path from the admin form.
    let parsedImages = [];
    if (images) {
      try {
        if (typeof images === 'string') {
          parsedImages = JSON.parse(images);
        } else if (Array.isArray(images)) {
          parsedImages = images;
        }
        parsedImages = (parsedImages || []).filter((url) => typeof url === 'string' && url.trim().length > 0);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid images format. Must be a JSON array of URLs.",
        });
      }
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

    // Validate that product has either main image, gallery images, or variations
    if (!image && parsedImages.length === 0 && (!parsedVariations || parsedVariations.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Product must have either a main image, gallery images, or at least one variation",
      });
    }

    const productData = {
      image: image || null,
      images: parsedImages,
      title: title.trim(),
      description: description ? description.trim() : "",
      brand: normalizedBrand,
      category: slugify(category || ""),
      subcategory: subcategory ? slugify(subcategory) : null,
      shortDescription: shortDescription ? String(shortDescription).trim() : "",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      stock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations || []
    };
    if (productLine !== undefined) productData.productLine = String(productLine || "").trim();
    if (status && ["draft", "active", "archived"].includes(status)) productData.status = status;
    if (isNewArrival !== undefined) productData.isNewArrival = isNewArrival === true || isNewArrival === "true";

    // Relational catalogue: auto-resolve (and auto-create, if new) the
    // Brand/Category documents so this product shows up correctly in the
    // Admin Categories page and on brand pages, without ever rejecting a
    // category that doesn't exist yet.
    try {
      const catalogRefs = await resolveProductCatalogRefs({
        brand: normalizedBrand,
        category,
        subcategory,
        categoryId,
        subcategoryId,
        title,
      });
      productData.brandId = catalogRefs.brandId;
      productData.categoryId = catalogRefs.categoryId;
      productData.subcategoryId = catalogRefs.subcategoryId;
      // keep the text fields (used by old links) in step with the real category
      if (catalogRefs.categorySlug) productData.category = catalogRefs.categorySlug;
      productData.subcategory = catalogRefs.subcategorySlug || null;
      if (catalogRefs.productLine && productLine === undefined) productData.productLine = catalogRefs.productLine;
    } catch (catalogError) {
      console.error("Catalogue resolve error (continuing without relational refs):", catalogError.message);
    }

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
      images,
      title,
      description,
      brand,
      category,
      subcategory,
      categoryId,
      subcategoryId,
      productLine,
      status,
      isNewArrival,
      shortDescription,
      price,
      salePrice,
      totalStock,
      averageReview,
      variations
    } = req.body;

    // Validate required fields
    if (!title || !brand || (!category && !categoryId) || price === undefined || totalStock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, brand, category, price, and totalStock are required",
      });
    }

    // Brand is now open-ended — any brand name is accepted and, via the
    // catalogue resolver below, auto-creates the relational Brand record if
    // it doesn't exist yet. Subcategory is optional for every brand.
    const normalizedBrand = normalizeBrandInput(brand);

    // Parse the extra-images gallery
    let parsedImages = [];
    if (images) {
      try {
        if (typeof images === 'string') {
          parsedImages = JSON.parse(images);
        } else if (Array.isArray(images)) {
          parsedImages = images;
        }
        parsedImages = (parsedImages || []).filter((url) => typeof url === 'string' && url.trim().length > 0);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid images format. Must be a JSON array of URLs.",
        });
      }
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

    // Validate that product has either main image, gallery images, or variations
    if (!image && parsedImages.length === 0 && (!parsedVariations || parsedVariations.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Product must have either a main image, gallery images, or at least one variation",
      });
    }

    const updateData = {
      image: image || null,
      images: parsedImages,
      title: title.trim(),
      description: description ? description.trim() : "",
      brand: normalizedBrand,
      category: slugify(category || ""),
      subcategory: subcategory ? slugify(subcategory) : null,
      shortDescription: shortDescription ? String(shortDescription).trim() : "",
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : 0,
      totalStock: Number(totalStock),
      stock: Number(totalStock),
      averageReview: averageReview ? Number(averageReview) : 0,
      variations: parsedVariations || []
    };
    if (productLine !== undefined) updateData.productLine = String(productLine || "").trim();
    if (status && ["draft", "active", "archived"].includes(status)) updateData.status = status;
    if (isNewArrival !== undefined) updateData.isNewArrival = isNewArrival === true || isNewArrival === "true";

    try {
      const catalogRefs = await resolveProductCatalogRefs({
        brand: normalizedBrand,
        category,
        subcategory,
        categoryId,
        subcategoryId,
        title,
      });
      updateData.brandId = catalogRefs.brandId;
      updateData.categoryId = catalogRefs.categoryId;
      updateData.subcategoryId = catalogRefs.subcategoryId;
      // keep the text fields (used by old links) in step with the real category
      if (catalogRefs.categorySlug) updateData.category = catalogRefs.categorySlug;
      updateData.subcategory = catalogRefs.subcategorySlug || null;
      if (catalogRefs.productLine && productLine === undefined) updateData.productLine = catalogRefs.productLine;
    } catch (catalogError) {
      console.error("Catalogue resolve error (continuing without relational refs):", catalogError.message);
    }

    // Never blank out the existing category text if it couldn't be worked out
    if (!updateData.category) { delete updateData.category; delete updateData.subcategory; }

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
      message: error.name === "ValidationError" ? `Product could not be saved: ${Object.values(error.errors || {}).map((e) => e.message).join("; ")}` : "Error occurred while editing product",
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
    const normalizedBrand = normalizeBrandInput(brand);

    if (!normalizedBrand) {
      return res.status(400).json({
        success: false,
        message: "Brand is required",
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
    const normalizedBrand = normalizeBrandInput(brand);
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
    const normalizedBrand = normalizeBrandInput(brand);
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