// server/middleware/admin.js
// Gatekeeper for every /api/admin/* route (and the admin-only contact routes).
//
// Before this existed, the admin API was completely open: anyone who knew a
// URL like DELETE /api/admin/products/delete/<id> could call it without
// logging in. authMiddleware proves who you are (cookie or Bearer token);
// requireAdmin then checks the account's role is "admin".

const { authMiddleware } = require("../controllers/auth/auth-controller");

const requireAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required." });
};

// Use as: router.get("/x", ...adminOnly, handler)  or  app.use("/api/admin", ...adminOnly)
const adminOnly = [authMiddleware, requireAdmin];

module.exports = { requireAdmin, adminOnly };
