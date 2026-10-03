// shop/server/controllers/shop/bundles-controller.js
const Bundle = require("../../models/Bundle");
const Product = require("../../models/Product");
const { bundleIsLive, bundleAvailability } = require("../../helpers/order-pricing");

const PRODUCT_FIELDS = "title image images price salePrice totalStock stock status brand";

const shape = (bundle) => {
  const obj = bundle.toObject();
  const byId = {};
  bundle.productIds.forEach((i) => { if (i.productId) byId[String(i.productId._id)] = i.productId; });
  obj.available = bundleAvailability(bundle, byId);
  obj.image = obj.images?.[0] || bundle.productIds[0]?.productId?.image || bundle.productIds[0]?.productId?.images?.[0] || null;
  obj.items = bundle.productIds.map((i) => ({ qty: i.qty, product: i.productId }));
  return obj;
};

// Live bundles only. Sold-out ones are hidden from shoppers.
const getBundles = async (req, res) => {
  try {
    const now = new Date();
    const bundles = await Bundle.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    })
      .populate("productIds.productId", PRODUCT_FIELDS)
      .sort({ sortOrder: 1, createdAt: -1 });

    const data = bundles.map(shape).filter((b) => b.available > 0);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getBundles:", error);
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

const getBundleBySlug = async (req, res) => {
  try {
    const bundle = await Bundle.findOne({ slug: String(req.params.slug).toLowerCase() }).populate("productIds.productId", PRODUCT_FIELDS);
    if (!bundle || !bundleIsLive(bundle)) return res.status(404).json({ success: false, message: "This bundle deal is no longer available." });
    res.status(200).json({ success: true, data: shape(bundle) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Some error occurred" });
  }
};

module.exports = { getBundles, getBundleBySlug };
