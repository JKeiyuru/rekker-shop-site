// server/helpers/order-pricing.js
//
// The server — not the browser — decides what an order costs.
// Previously checkout sent prices and totals from the client and the server
// saved them as-is, so anyone could edit the request and pay KES 1 for
// anything. These helpers rebuild every order line from the database:
// current price (sale price if active), live bundle deals, stock checks,
// and the delivery fee from the Delivery Locations table.

const Product = require("../models/Product");
const Bundle = require("../models/Bundle");
const DeliveryLocation = require("../models/DeliveryLocation");

const effectivePrice = (p) => (p.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p.price);
const stockOf = (p) => Number(p.totalStock ?? p.stock ?? 0) || 0;

const bundleIsLive = (b, now = new Date()) =>
  !!b && b.isActive && (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now);

// How many whole bundles can be made from current stock
const bundleAvailability = (bundle, productsById) => {
  let max = Infinity;
  for (const item of bundle.productIds || []) {
    const p = productsById[String(item.productId?._id || item.productId)];
    if (!p || p.status === "archived" || p.status === "draft") return 0;
    max = Math.min(max, Math.floor(stockOf(p) / (item.qty || 1)));
  }
  return Number.isFinite(max) ? max : 0;
};

// requested: [{ productId, quantity }]  (productId may be a product OR a bundle id)
async function priceOrderLines(requested = []) {
  const errors = [];
  const lines = [];

  const ids = [...new Set(requested.map((r) => String(r.productId)).filter(Boolean))];
  const [products, bundles] = await Promise.all([
    Product.find({ _id: { $in: ids } }).populate("brandId", "name"),
    Bundle.find({ _id: { $in: ids } }),
  ]);
  const productsById = Object.fromEntries(products.map((p) => [String(p._id), p]));
  const bundlesById = Object.fromEntries(bundles.map((b) => [String(b._id), b]));

  // components of any bundles (may not be in the cart themselves)
  const componentIds = new Set();
  bundles.forEach((b) => b.productIds.forEach((i) => componentIds.add(String(i.productId))));
  const missingComponentIds = [...componentIds].filter((id) => !productsById[id]);
  if (missingComponentIds.length) {
    (await Product.find({ _id: { $in: missingComponentIds } }).populate("brandId", "name")).forEach((p) => {
      productsById[String(p._id)] = p;
    });
  }

  // Track how much of each product this order consumes so a cart holding both
  // "Shampoo" and a bundle that contains Shampoo can't oversell it.
  const consumed = {};

  for (const req of requested) {
    const id = String(req.productId);
    const qty = Math.max(1, Math.floor(Number(req.quantity) || 1));

    if (bundlesById[id]) {
      const bundle = bundlesById[id];
      if (!bundleIsLive(bundle)) {
        errors.push(`The bundle "${bundle.name}" is no longer available.`);
        continue;
      }
      if (bundle.maxPerOrder && qty > bundle.maxPerOrder) {
        errors.push(`You can order at most ${bundle.maxPerOrder} of "${bundle.name}".`);
        continue;
      }
      const available = bundleAvailability(bundle, productsById);
      if (qty > available) {
        errors.push(available > 0 ? `Only ${available} of "${bundle.name}" left.` : `"${bundle.name}" is out of stock.`);
        continue;
      }
      const items = bundle.productIds.map((i) => {
        const p = productsById[String(i.productId)];
        consumed[String(i.productId)] = (consumed[String(i.productId)] || 0) + i.qty * qty;
        return { productId: String(i.productId), title: p?.title || "Product", qty: i.qty };
      });
      const firstProduct = productsById[String(bundle.productIds[0]?.productId)];
      lines.push({
        productId: String(bundle._id),
        title: bundle.name,
        image: bundle.images?.[0] || firstProduct?.image || firstProduct?.images?.[0] || null,
        price: bundle.price,
        quantity: qty,
        brand: null,
        brandId: null,
        brandName: "Bundle deal",
        isBundle: true,
        bundleId: String(bundle._id),
        bundleItems: items,
      });
      continue;
    }

    const product = productsById[id];
    if (!product || product.status === "archived" || product.status === "draft") {
      errors.push("One of the items in your cart is no longer available.");
      continue;
    }
    consumed[id] = (consumed[id] || 0) + qty;
    if (consumed[id] > stockOf(product)) {
      const left = Math.max(0, stockOf(product));
      errors.push(left > 0 ? `Only ${left} of "${product.title}" left in stock.` : `"${product.title}" is out of stock.`);
      continue;
    }
    lines.push({
      productId: String(product._id),
      title: product.title,
      image: product.image || product.images?.[0] || product.variations?.[0]?.image || null,
      price: effectivePrice(product),
      quantity: qty,
      brand: product.brand || null,
      brandId: product.brandId?._id || product.brandId || null,
      brandName: product.brandId?.name || null,
      isBundle: false,
    });
  }

  // Combined check for products that appear both on their own and inside bundles
  for (const [pid, used] of Object.entries(consumed)) {
    const p = productsById[pid];
    if (p && used > stockOf(p) && !errors.some((e) => e.includes(p.title))) {
      errors.push(`Not enough stock of "${p.title}" for everything in your cart.`);
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  return { lines, subtotal, errors };
}

// Delivery fee from the Delivery Locations table when the address matches one;
// otherwise the (sanitised) figure the checkout sent.
async function resolveDeliveryFee(addressInfo = {}, clientFee = 0) {
  try {
    const { county, subCounty, location } = addressInfo || {};
    if (county && subCounty && location) {
      const loc = await DeliveryLocation.findOne({ county, subCounty, location, isActive: true });
      if (loc) return loc.isFreeDelivery ? 0 : Number(loc.deliveryFee) || 0;
    }
  } catch (e) {
    console.error("resolveDeliveryFee lookup failed:", e.message);
  }
  const fee = Number(clientFee);
  return Number.isFinite(fee) && fee >= 0 ? fee : 0;
}

// Deduct stock for every line (bundles deduct each component). Runs once per
// order — guarded by order.stockDeducted. Returns the touched products so the
// caller can raise low-stock alerts. Caller is responsible for order.save().
async function deductStockForOrder(order) {
  if (order.stockDeducted) return [];
  const touched = [];

  for (const item of order.cartItems || []) {
    const parts = item.isBundle && item.bundleItems?.length
      ? item.bundleItems.map((b) => ({ productId: b.productId, qty: b.qty * item.quantity }))
      : [{ productId: item.productId, qty: item.quantity }];

    for (const part of parts) {
      try {
        const p = await Product.findById(part.productId);
        if (!p) continue;
        const next = Math.max(0, stockOf(p) - part.qty);
        // updateOne (not save) so old products with imperfect data can't block a sale
        await Product.updateOne(
          { _id: p._id },
          { $set: { totalStock: next, stock: next }, $inc: { salesCount: part.qty } }
        );
        p.totalStock = next;
        p.stock = next;
        touched.push(p);
      } catch (e) {
        console.error("Stock deduction error (non-fatal):", e.message);
      }
    }
    if (item.isBundle && item.bundleId) {
      Bundle.updateOne({ _id: item.bundleId }, { $inc: { soldCount: item.quantity } }).catch(() => {});
    }
  }

  order.stockDeducted = true;
  return touched;
}

module.exports = {
  effectivePrice,
  stockOf,
  bundleIsLive,
  bundleAvailability,
  priceOrderLines,
  resolveDeliveryFee,
  deductStockForOrder,
};
