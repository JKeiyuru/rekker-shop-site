const Product = require("../../models/Product");

// Legacy endpoint kept for backward compatibility with existing client code
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category,
      brand,
      subcategory,
      sortBy = "price-lowtohigh"
    } = req.query;

    let filters = {};

    if (brand && brand !== '[]' && brand !== '') {
      const brandArray = Array.isArray(brand) ? brand : brand.split(",");
      filters.brand = { $in: brandArray };
    }

    if (category && category !== '[]' && category !== '') {
      const categoryArray = Array.isArray(category) ? category : category.split(",");
      filters.category = { $in: categoryArray };
    }

    if (subcategory && subcategory !== '[]' && subcategory !== '') {
      const subcategoryArray = Array.isArray(subcategory) ? subcategory : subcategory.split(",");
      filters.subcategory = { $in: subcategoryArray };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
      error: error.message
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
      error: error.message
    });
  }
};

// New multi-brand catalogue endpoint: rich filtering, sorting, pagination
const listShopProducts = async (req, res) => {
  try {
    const {
      brandId,
      categoryId,
      subcategoryId,
      minPrice,
      maxPrice,
      size,
      inStock,
      newArrivals,
      bestSellers,
      onPromotion,
      search,
      sortBy = "createdAt-desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filters = { status: "active" };

    if (brandId) {
      const brandArray = brandId.split(",");
      filters.brandId = { $in: brandArray };
    }

    if (categoryId) {
      const categoryArray = categoryId.split(",");
      filters.categoryId = { $in: categoryArray };
    }

    if (subcategoryId) {
      const subArray = subcategoryId.split(",");
      filters.subcategoryId = { $in: subArray };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (size) {
      const sizeArray = size.split(",");
      filters["variants.size"] = { $in: sizeArray };
    }

    if (inStock === "true") {
      filters.totalStock = { $gt: 0 };
    }

    if (newArrivals === "true") {
      filters.isNewArrival = true;
    }

    if (search) {
      filters.$text = { $search: search };
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      case "bestsellers":
        sort.salesCount = -1;
        break;
      case "createdAt-desc":
      default:
        sort.createdAt = -1;
        break;
    }

    let query = Product.find(filters);

    if (bestSellers === "true") {
      query = query.sort({ salesCount: -1 });
    } else {
      query = query.sort(sort);
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      query.skip(skip).limit(limitNum).populate("brandId").populate("categoryId"),
      Product.countDocuments(filters),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in listShopProducts:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug: slug.toLowerCase(), status: "active" })
      .populate("brandId")
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("relatedProductIds");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found!" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getProductBySlug:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = {
  getFilteredProducts,
  getProductDetails,
  listShopProducts,
  getProductBySlug,
};
