// POST /api/shop/discount/validate  { code, cartItems:[{productId,quantity}] }
const { priceOrderLines } = require("../../helpers/order-pricing");
const { evaluateCode } = require("../../helpers/discounts");

const validateDiscount = async (req, res) => {
  try {
    const { code, cartItems } = req.body || {};
    if (!Array.isArray(cartItems) || !cartItems.length) return res.status(400).json({ success: false, message: "Your cart is empty." });
    const priced = await priceOrderLines(cartItems);
    if (!priced.lines.length) return res.status(409).json({ success: false, message: priced.errors[0] || "Your cart is empty." });
    const ev = await evaluateCode({ code, userId: req.user?.id, lines: priced.lines, subtotal: priced.subtotal });
    if (!ev.ok) return res.status(200).json({ success: false, message: ev.error });
    const d = ev.code;
    res.status(200).json({
      success: true,
      code: d.code,
      discountAmount: ev.discountAmount,
      message: d.appliesTo === "all"
        ? `Code ${d.code} applied — you save KES ${ev.discountAmount.toLocaleString("en-KE")}!`
        : `Code ${d.code} applied to ${ev.eligibleTitles.length} item${ev.eligibleTitles.length === 1 ? "" : "s"} — you save KES ${ev.discountAmount.toLocaleString("en-KE")}!`,
      appliesTo: d.appliesTo,
      eligibleTitles: ev.eligibleTitles,
    });
  } catch (e) {
    console.error("validateDiscount:", e);
    res.status(500).json({ success: false, message: "Couldn't check that code. Please try again." });
  }
};
module.exports = { validateDiscount };
