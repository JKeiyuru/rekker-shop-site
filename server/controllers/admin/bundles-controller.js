const Bundle = require("../../models/Bundle");

const createBundle = async (req, res) => {
  try {
    const bundle = new Bundle(req.body);
    await bundle.save();
    res.status(201).json({ success: true, data: bundle });
  } catch (error) {
    console.error("Error in createBundle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getAllBundles = async (req, res) => {
  try {
    const bundles = await Bundle.find().populate("productIds.productId").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bundles });
  } catch (error) {
    console.error("Error in getAllBundles:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const updateBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bundle) return res.status(404).json({ success: false, message: "Bundle not found" });
    res.status(200).json({ success: true, data: bundle });
  } catch (error) {
    console.error("Error in updateBundle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const deleteBundle = async (req, res) => {
  try {
    const bundle = await Bundle.findByIdAndDelete(req.params.id);
    if (!bundle) return res.status(404).json({ success: false, message: "Bundle not found" });
    res.status(200).json({ success: true, message: "Bundle deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBundle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { createBundle, getAllBundles, updateBundle, deleteBundle };
