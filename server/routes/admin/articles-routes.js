const express = require("express");
const {
  createArticle,
  getAllArticles,
  updateArticle,
  deleteArticle,
} = require("../../controllers/admin/articles-controller");

const router = express.Router();

router.post("/add", createArticle);
router.get("/get", getAllArticles);
router.put("/edit/:id", updateArticle);
router.delete("/delete/:id", deleteArticle);

module.exports = router;
