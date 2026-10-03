const Product = require("../../models/Product");
const { NOT_HIDDEN, escapeRegex } = require("../../helpers/catalog-query");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    if (!keyword || typeof keyword !== "string" || !keyword.trim()) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    // escape so typing "(" or "+" can't crash the search
    const regEx = new RegExp(escapeRegex(keyword.trim()), "i");

    const searchResults = await Product.find({
      status: NOT_HIDDEN,
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { subcategory: regEx },
        { brand: regEx },
        { productLine: regEx },
        { sku: regEx },
      ],
    })
      .limit(100)
      .populate([
        { path: "brandId", select: "name slug" },
        { path: "categoryId", select: "name slug" },
      ]);

    res.status(200).json({ success: true, data: searchResults });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = { searchProducts };
