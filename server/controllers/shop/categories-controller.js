// shop/server/controllers/shop/categories-controller.js
const Category = require("../../models/Category");

const getCategoryTree = async (req, res) => {
  try {
    const { brandId } = req.query;
    const filter = { isActive: true };
    if (brandId) filter.brandIds = brandId;

    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 }).lean();

    const byId = {};
    categories.forEach((cat) => {
      byId[cat._id.toString()] = { ...cat, children: [] };
    });

    const tree = [];
    categories.forEach((cat) => {
      const node = byId[cat._id.toString()];
      if (cat.parentId && byId[cat.parentId.toString()]) {
        byId[cat.parentId.toString()].children.push(node);
      } else {
        tree.push(node);
      }
    });

    res.status(200).json({ success: true, data: tree });
  } catch (error) {
    console.error("Error in getCategoryTree:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getCategoryTree };
