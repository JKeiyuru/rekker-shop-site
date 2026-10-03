// server/helpers/discounts.js — validating codes and working out the discount.
// Everything is calculated here, on the server, from the real cart lines.
const DiscountCode = require("../models/DiscountCode");
const DiscountRedemption = require("../models/DiscountRedemption");
const Product = require("../models/Product");

const normCode = (c) => String(c || "").trim().toUpperCase().replace(/\s+/g, "");
const onSale = (p) => p.salePrice > 0 && p.salePrice < p.price;

// lines: output of priceOrderLines().lines  |  returns { ok, error, discountAmount, eligibleSubtotal, eligibleTitles, code }
async function evaluateCode({ code, userId, lines, subtotal }) {
  const clean = normCode(code);
  if (!clean) return { ok: false, error: "Enter a discount code." };

  const doc = await DiscountCode.findOne({ code: clean });
  const now = new Date();
  if (!doc || !doc.isActive) return { ok: false, error: "That code isn't valid." };
  if (doc.startsAt && doc.startsAt > now) return { ok: false, error: "That code isn't active yet." };
  if (doc.endsAt && doc.endsAt < now) return { ok: false, error: "That code has expired." };
  if (doc.usageLimit > 0 && doc.usedCount >= doc.usageLimit) return { ok: false, error: "That code has reached its usage limit." };
  if (doc.perUserLimit > 0 && userId) {
    const used = await DiscountRedemption.countDocuments({ codeId: doc._id, userId: String(userId) });
    if (used >= doc.perUserLimit) return { ok: false, error: "You've already used this code." };
  }
  if (doc.minOrderAmount > 0 && subtotal < doc.minOrderAmount) {
    return { ok: false, error: `Spend at least KES ${doc.minOrderAmount.toLocaleString("en-KE")} to use this code.` };
  }

  // which cart lines qualify
  const productLines = lines.filter((l) => !l.isBundle); // bundles are already discounted deals
  const products = await Product.find({ _id: { $in: productLines.map((l) => l.productId) } }).select("price salePrice categoryId subcategoryId brandId title");
  const byId = Object.fromEntries(products.map((p) => [String(p._id), p]));
  const idsIn = (arr, v) => v && arr.some((x) => String(x) === String(v));

  let eligibleSubtotal = 0;
  const eligibleTitles = [];
  const perLine = {};
  for (const l of productLines) {
    const p = byId[String(l.productId)];
    if (!p) continue;
    if (doc.excludeSaleItems && onSale(p)) continue;
    let ok = doc.appliesTo === "all";
    if (doc.appliesTo === "products") ok = idsIn(doc.productIds, p._id);
    if (doc.appliesTo === "categories") ok = idsIn(doc.categoryIds, p.categoryId) || idsIn(doc.categoryIds, p.subcategoryId);
    if (doc.appliesTo === "brands") ok = idsIn(doc.brandIds, p.brandId);
    if (!ok) continue;
    const lineTotal = l.price * l.quantity;
    eligibleSubtotal += lineTotal;
    perLine[String(l.productId)] = lineTotal;
    eligibleTitles.push(p.title);
  }

  if (eligibleSubtotal <= 0) {
    return { ok: false, error: doc.appliesTo === "all" ? "This code can't be applied to the items in your cart." : "This code doesn't apply to any item in your cart — it only works on selected products." };
  }

  let amount = doc.type === "percent" ? (eligibleSubtotal * doc.value) / 100 : doc.value;
  if (doc.type === "percent" && doc.maxDiscountAmount > 0) amount = Math.min(amount, doc.maxDiscountAmount);
  amount = Math.min(Math.round(amount), eligibleSubtotal);
  if (amount <= 0) return { ok: false, error: "This code gives no discount on your cart." };

  return { ok: true, discountAmount: amount, eligibleSubtotal, eligibleTitles, code: doc, perLine };
}

// Records the use of a code exactly once per order.
async function redeemForOrder(order) {
  if (!order.discountCode || !(order.discountAmount > 0) || order.discountRedeemed) return;
  try {
    const doc = await DiscountCode.findOne({ code: order.discountCode });
    if (!doc) return;
    await DiscountRedemption.create({
      codeId: doc._id, code: doc.code, userId: String(order.userId), orderId: String(order._id),
      discountAmount: order.discountAmount, orderTotal: order.totalAmount,
    });
    await DiscountCode.updateOne({ _id: doc._id }, { $inc: { usedCount: 1, totalDiscountGiven: order.discountAmount, totalSalesValue: order.totalAmount } });
    order.discountRedeemed = true;
  } catch (e) {
    if (e.code !== 11000) console.error("redeemForOrder failed:", e.message); // 11000 = already recorded
    else order.discountRedeemed = true;
  }
}

module.exports = { evaluateCode, redeemForOrder, normCode };
