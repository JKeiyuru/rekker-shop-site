// shop/server/controllers/shop/brands-controller.js
const Brand = require("../../models/Brand");
const Product = require("../../models/Product");

const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error("Error in getBrands:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({ slug: slug.toLowerCase(), isActive: true });

    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    const products = await Product.find({ brandId: brand._id, status: "active" }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { brand, products } });
  } catch (error) {
    console.error("Error in getBrandBySlug:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getBrands, getBrandBySlug };
