const Brand = require("../../models/Brand");

const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    console.error("Error in createBrand:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ sortOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    console.error("Error in getAllBrands:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    console.error("Error in updateBrand:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBrand:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { createBrand, getAllBrands, updateBrand, deleteBrand };
