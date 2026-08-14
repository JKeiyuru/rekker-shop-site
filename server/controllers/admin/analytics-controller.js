// shop/server/controllers/admin/analytics-controller.js
const Order = require("../../models/Order");
const Brand = require("../../models/Brand");

const getAnalyticsOverview = async (req, res) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: "paid" });

    const totalSales = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const orderCount = paidOrders.length;
    const aov = orderCount > 0 ? totalSales / orderCount : 0;

    // Sales by brand & product
    const brandTotals = {};
    const productTotals = {};

    paidOrders.forEach((order) => {
      (order.cartItems || []).forEach((item) => {
        const brandKey = item.brandName || item.brand || "unknown";
        const lineTotal = (item.price || 0) * (item.quantity || 0);

        brandTotals[brandKey] = (brandTotals[brandKey] || 0) + lineTotal;

        const productKey = item.title || item.productId;
        if (!productTotals[productKey]) {
          productTotals[productKey] = { title: item.title, total: 0, quantity: 0 };
        }
        productTotals[productKey].total += lineTotal;
        productTotals[productKey].quantity += item.quantity || 0;
      });
    });

    const salesByBrand = Object.entries(brandTotals).map(([brand, total]) => ({ brand, total }));
    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    const topBrands = [...salesByBrand].sort((a, b) => b.total - a.total).slice(0, 10);

    // New vs returning customers (by userId or customer email/phone for guests)
    const identifierCounts = {};
    const allOrders = await Order.find({});
    allOrders.forEach((order) => {
      const key = order.userId || order.customer?.email || order.customer?.phone || order._id.toString();
      identifierCounts[key] = (identifierCounts[key] || 0) + 1;
    });
    const newCustomers = Object.values(identifierCounts).filter((c) => c === 1).length;
    const returningCustomers = Object.values(identifierCounts).filter((c) => c > 1).length;

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        orderCount,
        averageOrderValue: aov,
        salesByBrand,
        topProducts,
        topBrands,
        newCustomers,
        returningCustomers,
      },
    });
  } catch (error) {
    console.error("Error in getAnalyticsOverview:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

const getSalesByCategory = async (req, res) => {
  try {
    const paidOrders = await Order.find({ paymentStatus: "paid" });
    const categoryTotals = {};

    paidOrders.forEach((order) => {
      (order.cartItems || []).forEach((item) => {
        const key = item.category || "unknown";
        categoryTotals[key] = (categoryTotals[key] || 0) + (item.price || 0) * (item.quantity || 0);
      });
    });

    const salesByCategory = Object.entries(categoryTotals).map(([category, total]) => ({ category, total }));

    res.status(200).json({ success: true, data: salesByCategory });
  } catch (error) {
    console.error("Error in getSalesByCategory:", error);
    res.status(500).json({ success: false, message: "Some error occurred", error: error.message });
  }
};

module.exports = { getAnalyticsOverview, getSalesByCategory };
