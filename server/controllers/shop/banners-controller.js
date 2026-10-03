// Public: active banners, optionally for one placement. Also counts clicks/views.
const Banner = require("../../models/Banner");

const getActiveBanners = async (req, res) => {
  try {
    const now = new Date();
    const q = {
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    };
    if (req.query.placement) q.placement = req.query.placement;
    const data = await Banner.find(q).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.status(200).json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: "Some error occurred" }); }
};

const trackBanner = async (req, res) => {
  try {
    const field = req.params.event === "click" ? "clicks" : "views";
    await Banner.updateOne({ _id: req.params.id }, { $inc: { [field]: 1 } });
    res.status(204).end();
  } catch (e) { res.status(204).end(); }
};

module.exports = { getActiveBanners, trackBanner };
