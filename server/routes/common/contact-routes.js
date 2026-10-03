const express = require("express");
const {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../../controllers/common/contact-controller");

const { adminOnly } = require("../../middleware/admin");
const router = express.Router();

// Public submission (corporate site + shop site)
router.post("/submit", createContactMessage);

// Admin panel
router.get("/messages", ...adminOnly, getContactMessages);
router.put("/messages/:id/status", ...adminOnly, updateContactMessageStatus);
router.delete("/messages/:id", ...adminOnly, deleteContactMessage);

module.exports = router;
