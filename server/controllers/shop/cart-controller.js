// server/controllers/shop/cart-controller.js
// Cart supports normal products AND bundle deals. To the storefront a bundle
// line looks like any other line (productId = the bundle's id, isBundle: true),
// so quantity +/- and remove keep working with one set of endpoints.

const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Bundle = require("../../models/Bundle");
const { bundleIsLive, bundleAvailability, stockOf } = require("../../helpers/order-pricing");

const lineKey = (item) => String(item.bundleId || item.productId);

// Turns raw cart lines into the display shape, dropping anything that no
// longer exists / is no longer sellable. Saves the cart if lines were dropped.
async function buildCartResponse(cart) {
  const productIds = cart.items.filter((i) => i.productId).map((i) => i.productId);
  const bundleIds = cart.items.filter((i) => i.bundleId).map((i) => i.bundleId);

  const [products, bundles] = await Promise.all([
    Product.find({ _id: { $in: productIds } }).select("image images title price salePrice totalStock stock status"),
    Bundle.find({ _id: { $in: bundleIds } }),
  ]);
  const productsById = Object.fromEntries(products.map((p) => [String(p._id), p]));
  const bundlesById = Object.fromEntries(bundles.map((b) => [String(b._id), b]));

  // components for bundle availability + display
  const componentIds = [...new Set(bundles.flatMap((b) => b.productIds.map((i) => String(i.productId))))];
  const missing = componentIds.filter((id) => !productsById[id]);
  if (missing.length) {
    (await Product.find({ _id: { $in: missing } }).select("image images title price salePrice totalStock stock status")).forEach((p) => {
      productsById[String(p._id)] = p;
    });
  }

  const items = [];
  const validRaw = [];
  for (const raw of cart.items) {
    if (raw.bundleId) {
      const b = bundlesById[String(raw.bundleId)];
      if (!b || !bundleIsLive(b)) continue;
      const first = productsById[String(b.productIds[0]?.productId)];
      validRaw.push(raw);
      items.push({
        productId: b._id,
        bundleId: b._id,
        isBundle: true,
        image: b.images?.[0] || first?.image || first?.images?.[0] || null,
        title: b.name,
        price: b.price,
        compareAtPrice: b.compareAtPrice,
        salePrice: 0,
        quantity: raw.quantity,
        totalStock: bundleAvailability(b, productsById),
        maxPerOrder: b.maxPerOrder || 0,
        bundleItems: b.productIds.map((i) => ({
          productId: i.productId,
          title: productsById[String(i.productId)]?.title || "Product",
          qty: i.qty,
        })),
      });
    } else {
      const p = productsById[String(raw.productId)];
      if (!p || p.status === "archived" || p.status === "draft") continue;
      validRaw.push(raw);
      items.push({
        productId: p._id,
        isBundle: false,
        image: p.image || p.images?.[0] || null,
        title: p.title,
        price: p.price,
        salePrice: p.salePrice,
        quantity: raw.quantity,
        totalStock: stockOf(p),
      });
    }
  }

  if (validRaw.length < cart.items.length) {
    cart.items = validRaw;
    await cart.save();
  }

  return { ...cart._doc, items };
}

const addToCart = async (req, res) => {
  try {
    const { userId, productId, bundleId, quantity } = req.body;
    const qty = Math.floor(Number(quantity));

    if (!userId || (!productId && !bundleId) || !(qty > 0)) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const targetId = String(bundleId || productId);
    const existing = cart.items.find((item) => lineKey(item) === targetId);
    const newQty = (existing ? existing.quantity : 0) + qty;

    // Is it a bundle? (the storefront may send a bundle id as productId too)
    const bundle = await Bundle.findById(targetId).catch(() => null);
    if (bundle) {
      if (!bundleIsLive(bundle)) {
        return res.status(409).json({ success: false, message: "This bundle deal is no longer available." });
      }
      const components = await Product.find({ _id: { $in: bundle.productIds.map((i) => i.productId) } });
      const byId = Object.fromEntries(components.map((p) => [String(p._id), p]));
      const available = bundleAvailability(bundle, byId);
      if (newQty > available) {
        return res.status(409).json({
          success: false,
          message: available > 0 ? `Only ${available} of this bundle left.` : "This bundle is out of stock.",
        });
      }
      if (bundle.maxPerOrder && newQty > bundle.maxPerOrder) {
        return res.status(409).json({ success: false, message: `You can order at most ${bundle.maxPerOrder} of this bundle.` });
      }
      if (existing) existing.quantity = newQty;
      else cart.items.push({ bundleId: bundle._id, quantity: qty });
    } else {
      const product = await Product.findById(targetId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      if (newQty > stockOf(product)) {
        const left = Math.max(0, stockOf(product));
        return res.status(409).json({
          success: false,
          message: left > 0 ? `Only ${left} of this item left in stock.` : "This item is out of stock.",
        });
      }
      if (existing) existing.quantity = newQty;
      else cart.items.push({ productId: product._id, quantity: qty });
    }

    await cart.save();
    res.status(200).json({ success: true, data: await buildCartResponse(cart) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "User id is manadatory!" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found!" });

    res.status(200).json({ success: true, data: await buildCartResponse(cart) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const qty = Math.floor(Number(quantity));

    if (!userId || !productId || !(qty > 0)) {
      return res.status(400).json({ success: false, message: "Invalid data provided!" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found!" });

    const line = cart.items.find((item) => lineKey(item) === String(productId));
    if (!line) return res.status(404).json({ success: false, message: "Cart item not present !" });

    // keep within stock
    if (line.bundleId) {
      const bundle = await Bundle.findById(line.bundleId);
      if (bundle) {
        const components = await Product.find({ _id: { $in: bundle.productIds.map((i) => i.productId) } });
        const available = bundleAvailability(bundle, Object.fromEntries(components.map((p) => [String(p._id), p])));
        if (qty > available) {
          return res.status(409).json({ success: false, message: `Only ${available} of this bundle left.` });
        }
        if (bundle.maxPerOrder && qty > bundle.maxPerOrder) {
          return res.status(409).json({ success: false, message: `You can order at most ${bundle.maxPerOrder} of this bundle.` });
        }
      }
    } else {
      const product = await Product.findById(line.productId);
      if (product && qty > stockOf(product)) {
        return res.status(409).json({ success: false, message: `Only ${stockOf(product)} of this item left in stock.` });
      }
    }

    line.quantity = qty;
    await cart.save();
    res.status(200).json({ success: true, data: await buildCartResponse(cart) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) return res.status(400).json({ success: false, message: "Invalid data provided!" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found!" });

    cart.items = cart.items.filter((item) => lineKey(item) !== String(productId));
    await cart.save();

    res.status(200).json({ success: true, data: await buildCartResponse(cart) });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error" });
  }
};

module.exports = { addToCart, updateCartItemQty, deleteCartItem, fetchCartItems };
