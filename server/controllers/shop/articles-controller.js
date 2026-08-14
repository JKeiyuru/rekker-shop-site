// shop/server/controllers/shop/articles-controller.js
const Article = require("../../models/Article");

const getArticles = async (req, res) => {
  try {
    const { brandId } = req.query;
    const filter = { published: true };
    if (brandId) filter.brandId = brandId;

    const articles = await Article.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    console.error("Error in getArticles:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug: slug.toLowerCase(), published: true })
      .populate("relatedProductIds")
      .populate("brandId");

    if (!article) {
      return res.status(404).json({ success: false, message: "Article not found" });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error("Error in getArticleBySlug:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getArticles, getArticleBySlug };
