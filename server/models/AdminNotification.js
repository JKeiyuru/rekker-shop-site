// server/models/AdminNotification.js
// In-dashboard alert feed (the bell icon in the admin header).
// Created automatically when something needs the team's attention.

const mongoose = require("mongoose");

const AdminNotificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["order", "wholesale", "message", "low_stock", "system"],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    body: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" }, // admin route to open, e.g. /admin/orders
    refId: { type: String, trim: true, default: "" },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

AdminNotificationSchema.index({ createdAt: -1 });
// Keep the feed tidy: notifications disappear after 60 days.
AdminNotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model("AdminNotification", AdminNotificationSchema);
