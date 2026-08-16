// shop/server/controllers/common/contact-controller.js
const ContactMessage = require("../../models/ContactMessage");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: submit a contact form from either rekker.co.ke or shop.rekker.co.ke
const createContactMessage = async (req, res) => {
  try {
    const {
      source,
      name,
      email,
      phone = "",
      company = "",
      subject = "",
      inquiryType = "general",
      message,
      pageUrl = "",
    } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email and message are required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    const doc = await ContactMessage.create({
      source: source === "shop" ? "shop" : "corporate",
      name: String(name).slice(0, 200),
      email: String(email).slice(0, 200),
      phone: String(phone).slice(0, 60),
      company: String(company).slice(0, 200),
      subject: String(subject).slice(0, 250),
      inquiryType: String(inquiryType).slice(0, 80),
      message: String(message).slice(0, 5000),
      pageUrl: String(pageUrl).slice(0, 500),
    });

    return res.status(201).json({ success: true, message: "Message received.", data: { id: doc._id } });
  } catch (error) {
    console.error("createContactMessage error:", error);
    return res.status(500).json({ success: false, message: "Could not submit your message." });
  }
};

// Admin: list messages, optionally filtered by source/status
const getContactMessages = async (req, res) => {
  try {
    const { source, status, limit = 200 } = req.query;
    const query = {};
    if (source && source !== "all") query.source = source;
    if (status && status !== "all") query.status = status;

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    const unread = await ContactMessage.countDocuments({ status: "new" });

    return res.status(200).json({ success: true, data: messages, unread });
  } catch (error) {
    console.error("getContactMessages error:", error);
    return res.status(500).json({ success: false, message: "Could not load messages." });
  }
};

const updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!["new", "read", "responded", "archived"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }
    const doc = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Message not found." });
    return res.status(200).json({ success: true, data: doc });
  } catch (error) {
    console.error("updateContactMessageStatus error:", error);
    return res.status(500).json({ success: false, message: "Could not update message." });
  }
};

const deleteContactMessage = async (req, res) => {
  try {
    const doc = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Message not found." });
    return res.status(200).json({ success: true, message: "Message deleted." });
  } catch (error) {
    console.error("deleteContactMessage error:", error);
    return res.status(500).json({ success: false, message: "Could not delete message." });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
};
