// shop/server/controllers/shop/bundles-controller.js
const Bundle = require("../../models/Bundle");

const getBundles = async (req, res) => {
  try {
    const bundles = await Bundle.find({ isActive: true })
      .populate("productIds.productId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bundles });
  } catch (error) {
    console.error("Error in getBundles:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getBundles };
