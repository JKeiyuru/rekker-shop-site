// server/controllers/admin/order-controller.js
// Admin order management.
//
// FIX: the admin order-details view was showing the logged-in ADMIN's own
// username as "the customer", plus the raw Mongo userId, instead of the
// actual customer who placed the order. That's because the frontend was
// pulling `user.userName` from its own auth state rather than from the
// order. The real fix has two parts:
//   1. Here — every order (list + single) is enriched with customerName /
//      customerEmail / customerPhone, resolved from the User record for
//      registered users or from order.customer for guest checkouts.
//   2. Client-side — order-details.jsx now reads that enriched field
//      instead of the logged-in admin's own name.
//
// Also handles order-status transitions (with the right email per status)
// and a separate payment-status endpoint for the COD "rider confirmed cash"
// manual-confirm flow.

const Order = require("../../models/Order");
const User = require("../../models/User");
const {
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  sendOrderStatusUpdateEmail,
} = require("../../helpers/email");

// Attach customerName / customerEmail / customerPhone to a plain order object.
// Batched for lists (one User query for all orders) or single-order lookups.
const enrichWithCustomer = async (orders) => {
  const list = Array.isArray(orders) ? orders : [orders];
  const userIds = [...new Set(list.filter((o) => o.userId && !o.isGuestOrder).map((o) => o.userId))];

  let usersById = {};
  if (userIds.length) {
    const users = await User.find({ _id: { $in: userIds } }).select("userName email");
    usersById = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
  }

  const enriched = list.map((orderDoc) => {
    const order = orderDoc.toObject ? orderDoc.toObject() : orderDoc;
    const registeredUser = order.userId ? usersById[order.userId.toString()] : null;

    if (registeredUser) {
      order.customerName = registeredUser.userName;
      order.customerEmail = registeredUser.email;
    } else {
      order.customerName = order.customer?.name || "Guest";
      order.customerEmail = order.customer?.email || null;
    }
    order.customerPhone = order.addressInfo?.phone || order.customer?.phone || null;

    return order;
  });

  return Array.isArray(orders) ? enriched : enriched[0];
};

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    // unpaid / abandoned online-payment attempts are not real orders — keep them out of the list
    const orders = await Order.find({ $nor: [{ paymentMethod: "paystack", paymentStatus: { $in: ["pending", "failed", "cancelled"] } }] }).sort({ orderDate: -1 });
    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }
    const enriched = await enrichWithCustomer(orders);
    res.status(200).json({ success: true, data: enriched });
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
    const enriched = await enrichWithCustomer(order);
    res.status(200).json({ success: true, data: enriched });
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

    if (previousStatus !== orderStatus) {
      try {
        const user = await User.findById(order.userId).select("email userName");
        if (user) {
          if (orderStatus === "inShipping") {
            sendOrderDispatchedEmail(user, updatedOrder).catch((e) =>
              console.error("Dispatch email failed:", e)
            );
          } else if (orderStatus === "delivered") {
            // COD: the customer hasn't actually paid yet at this point — the
            // rider confirms cash with the office afterwards, and THAT is
            // what triggers the thank-you email (see updatePaymentStatus
            // below). Sending "thank you for your payment" before the money
            // has actually changed hands would be misleading.
            if (updatedOrder.paymentMethod !== "cod") {
              sendOrderDeliveredEmail(user, updatedOrder).catch((e) =>
                console.error("Delivery email failed:", e)
              );
            }
          } else {
            sendOrderStatusUpdateEmail(user, updatedOrder).catch((e) =>
              console.error("Status update email failed:", e)
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

// PUT /api/admin/orders/payment-status/:id
// Used for the Cash on Delivery flow: the rider confirms with the office
// that the customer paid on handover, and the admin marks the order "paid"
// here. That transition is what fires the thank-you email for COD orders —
// online payments (Paystack) already auto-update via webhook and don't need
// this endpoint, though it's safe to use for corrections either way.
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const validStatuses = ["pending", "paid", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    const wasAlreadyPaid = order.paymentStatus === "paid";
    order.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && !order.paymentConfirmedAt) {
      order.paymentConfirmedAt = new Date();
    }
    await order.save();

    // Fire the "thank you" email exactly once, the moment payment first
    // becomes "paid" — this is the COD trigger point Joseph described.
    if (paymentStatus === "paid" && !wasAlreadyPaid) {
      try {
        const user = await User.findById(order.userId).select("email userName");
        if (user) {
          sendOrderDeliveredEmail(user, order).catch((e) =>
            console.error("Payment-confirmed thank-you email failed:", e)
          );
        }
      } catch (emailErr) {
        console.error("Email trigger error:", emailErr);
      }
    }

    res.status(200).json({ success: true, message: "Payment status updated successfully!" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
  updatePaymentStatus,
};
