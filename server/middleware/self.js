// server/middleware/self.js
// Logged-in users may only touch THEIR OWN cart, addresses, wishlist and
// orders. Compares the userId in the URL/body with the logged-in account
// (admins are allowed through). Use after authMiddleware.

const { authMiddleware } = require("../controllers/auth/auth-controller");

const requireSelf = (req, res, next) => {
  const id = String(req.params?.userId || req.body?.userId || req.query?.userId || "");
  if (!id) return next();
  if (req.user?.role === "admin" || String(req.user?.id) === id) return next();
  return res.status(403).json({ success: false, message: "You can only access your own account data." });
};

const selfOnly = [authMiddleware, requireSelf];

module.exports = { requireSelf, selfOnly };
