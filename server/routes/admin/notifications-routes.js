const express = require("express");
const c = require("../../controllers/admin/notifications-controller");
const router = express.Router();
router.get("/", c.list);
router.put("/read-all", c.markAllRead);
router.put("/:id/read", c.markRead);
module.exports = router;
