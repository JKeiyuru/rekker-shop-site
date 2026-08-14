// server/controllers/admin/order-controller.js
// Admin order management — triggers emails when order status changes

const Order = require("../../models/Order");
const User = require("../../models/User");
const {
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
} = require("../../helpers/email");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ orderDate: -1 });
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }
    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }
    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    const previousStatus = order.orderStatus;
    await Order.findByIdAndUpdate(id, { orderStatus, orderUpdateDate: new Date() });
    const updatedOrder = await Order.findById(id);

    // Fire status-based emails
    if (previousStatus !== orderStatus) {
      try {
        const user = await User.findById(order.userId).select("email userName");
        if (user) {
          if (orderStatus === "inShipping") {
            sendOrderDispatchedEmail(user, updatedOrder).catch((e) =>
              console.error("Dispatch email failed:", e)
            );
          } else if (orderStatus === "delivered") {
            sendOrderDeliveredEmail(user, updatedOrder).catch((e) =>
              console.error("Delivery email failed:", e)
            );
          }
        }
      } catch (emailErr) {
        console.error("Email trigger error:", emailErr);
        // Don't fail the request because of email issues
      }
    }

    res.status(200).json({ success: true, message: "Order status updated successfully!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = { getAllOrdersOfAllUsers, getOrderDetailsForAdmin, updateOrderStatus };