// shop/server/controllers/shop/promotions-controller.js
const Promotion = require("../../models/Promotion");

const getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: promotions });
  } catch (error) {
    console.error("Error in getActivePromotions:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getActivePromotions };
