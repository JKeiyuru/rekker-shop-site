const Article = require("../../models/Article");

const createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error("Error in createArticle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    console.error("Error in getAllArticles:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error("Error in updateArticle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.status(200).json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error in deleteArticle:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { createArticle, getAllArticles, updateArticle, deleteArticle };
