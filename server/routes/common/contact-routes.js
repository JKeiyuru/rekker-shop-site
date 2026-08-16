const express = require("express");
const {
  createContactMessage,
  getContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} = require("../../controllers/common/contact-controller");

const router = express.Router();

// Public submission (corporate site + shop site)
router.post("/submit", createContactMessage);

// Admin panel
router.get("/messages", getContactMessages);
router.put("/messages/:id/status", updateContactMessageStatus);
router.delete("/messages/:id", deleteContactMessage);

module.exports = router;
