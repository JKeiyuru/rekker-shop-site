const AdminNotification = require("../../models/AdminNotification");

// GET /api/admin/notifications?since=<ISO>  → latest 40 + unread count (polled by the bell)
const list = async (req, res) => {
  try {
    const [items, unread] = await Promise.all([
      AdminNotification.find().sort({ createdAt: -1 }).limit(40).lean(),
      AdminNotification.countDocuments({ isRead: false }),
    ]);
    res.status(200).json({ success: true, data: items, unread });
  } catch (e) { res.status(500).json({ success: false, message: "Could not load alerts." }); }
};
const markRead = async (req, res) => {
  try { await AdminNotification.updateOne({ _id: req.params.id }, { isRead: true }); res.status(200).json({ success: true }); }
  catch (e) { res.status(500).json({ success: false }); }
};
const markAllRead = async (req, res) => {
  try { await AdminNotification.updateMany({ isRead: false }, { isRead: true }); res.status(200).json({ success: true }); }
  catch (e) { res.status(500).json({ success: false }); }
};
module.exports = { list, markRead, markAllRead };
