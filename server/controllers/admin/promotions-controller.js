const Promotion = require("../../models/Promotion");

const createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json({ success: true, data: promotion });
  } catch (error) {
    console.error("Error in createPromotion:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error("Error in getAllPromotions:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promotion) return res.status(404).json({ success: false, message: "Promotion not found" });
    res.status(200).json({ success: true, data: promotion });
  } catch (error) {
    console.error("Error in updatePromotion:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    if (!promotion) return res.status(404).json({ success: false, message: "Promotion not found" });
    res.status(200).json({ success: true, message: "Promotion deleted successfully" });
  } catch (error) {
    console.error("Error in deletePromotion:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { createPromotion, getAllPromotions, updatePromotion, deletePromotion };
