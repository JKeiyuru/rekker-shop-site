// server/helpers/notifications.js
//
// One place that tells the Rekker team "something just happened".
// Every alert goes out on up to three channels at once:
//   1. In the admin dashboard (bell icon + sound) — always on.
//   2. Email — to ADMIN_NOTIFY_EMAILS (comma-separated), or, if not set,
//      to every user with the admin role, or finally info@rekker.co.ke.
//   3. SMS via Africa's Talking — only if AT_API_KEY, AT_USERNAME and
//      ADMIN_ALERT_PHONES (comma-separated, e.g. 254712345678) are set.
//
// Nothing in here is allowed to throw into the caller: a failed email must
// never stop a customer from placing an order.

const axios = require("axios");
const AdminNotification = require("../models/AdminNotification");
const User = require("../models/User");
const { sendAdminAlertEmail } = require("./email");

const CLIENT_URL = () => (process.env.ADMIN_URL || process.env.CLIENT_URL || "https://shop.rekker.co.ke").replace(/\/+$/, "");

const kes = (n) => `KES ${Number(n || 0).toLocaleString("en-KE")}`;

async function getAdminEmails() {
  const configured = (process.env.ADMIN_NOTIFY_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (configured.length) return configured;
  try {
    const admins = await User.find({ role: "admin" }).select("email").lean();
    const emails = admins.map((a) => a.email).filter(Boolean);
    if (emails.length) return emails;
  } catch (e) {
    console.error("Could not load admin emails:", e.message);
  }
  return [process.env.BREVO_SENDER_EMAIL || "info@rekker.co.ke"];
}

async function sendAdminSms(message) {
  const { AT_API_KEY, AT_USERNAME, ADMIN_ALERT_PHONES } = process.env;
  if (!AT_API_KEY || !AT_USERNAME || !ADMIN_ALERT_PHONES) return;
  const recipients = ADMIN_ALERT_PHONES.split(",")
    .map((p) => p.trim().replace(/\D/g, ""))
    .filter(Boolean)
    .map((p) => (p.startsWith("254") ? `+${p}` : p.startsWith("0") ? `+254${p.slice(1)}` : `+${p}`));
  if (!recipients.length) return;

  const sandbox = AT_USERNAME === "sandbox";
  const url = sandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging";
  const body = new URLSearchParams({ username: AT_USERNAME, to: recipients.join(","), message: message.slice(0, 300) });
  if (process.env.AT_SENDER_ID) body.set("from", process.env.AT_SENDER_ID);

  await axios.post(url, body.toString(), {
    headers: { apiKey: AT_API_KEY, "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    timeout: 12000,
  });
}

// Core: create the in-app notification and fan out email/SMS.
async function notifyAdmins({ type, title, body = "", link = "", refId = "", email, sms }) {
  try {
    await AdminNotification.create({ type, title, body, link, refId });
  } catch (e) {
    console.error("Admin notification save failed:", e.message);
  }

  // Email (fire and forget, per recipient so one bad address doesn't block the rest)
  if (email) {
    getAdminEmails()
      .then((emails) =>
        Promise.all(
          emails.map((to) =>
            sendAdminAlertEmail({ to, ...email }).catch((e) => console.error(`Admin alert email to ${to} failed:`, e.message))
          )
        )
      )
      .catch((e) => console.error("Admin alert email error:", e.message));
  }

  if (sms) sendAdminSms(sms).catch((e) => console.error("Admin SMS failed:", e?.response?.data || e.message));
}

// ── Specific alerts ─────────────────────────────────────────────────────────

// New order. For card/M-Pesa orders call this only once payment is confirmed.
async function notifyNewOrder(order, customerName) {
  try {
    const ref = order.orderRef || `#${String(order._id).slice(-8).toUpperCase()}`;
    const itemCount = (order.cartItems || []).reduce((n, i) => n + (i.quantity || 0), 0);
    const method = order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid online";
    const who = customerName || order.customer?.name || "A customer";
    const place = [order.addressInfo?.location, order.addressInfo?.county].filter(Boolean).join(", ");

    await notifyAdmins({
      type: "order",
      title: `New order ${ref} — ${kes(order.totalAmount)}`,
      body: `${who} · ${itemCount} item${itemCount === 1 ? "" : "s"} · ${method}${place ? " · " + place : ""}`,
      link: "/admin/orders",
      refId: String(order._id),
      email: {
        subject: `🛒 New order ${ref} — ${kes(order.totalAmount)}`,
        heading: `New order ${ref}`,
        intro: "A customer just placed an order on the shop. Open the dashboard to confirm and arrange delivery.",
        rows: [
          ["Customer", who],
          ["Phone", order.addressInfo?.phone || order.customer?.phone],
          ["Items", (order.cartItems || []).map((i) => `${i.quantity}× ${i.title}`).join(", ")],
          ["Total", kes(order.totalAmount)],
          ["Payment", method],
          ["Deliver to", [order.addressInfo?.specificAddress, order.addressInfo?.location, order.addressInfo?.subCounty, order.addressInfo?.county].filter(Boolean).join(", ")],
          ["Notes", order.addressInfo?.notes],
        ],
        ctaLabel: "Open orders",
        ctaUrl: `${CLIENT_URL()}/admin/orders`,
      },
      sms: `Rekker: new order ${ref}, ${kes(order.totalAmount)} (${method}). ${who}${order.addressInfo?.phone ? " " + order.addressInfo.phone : ""}`,
    });
  } catch (e) {
    console.error("notifyNewOrder error:", e.message);
  }
}

async function notifyNewWholesale(request) {
  try {
    await notifyAdmins({
      type: "wholesale",
      title: `Wholesale request — ${request.businessName}`,
      body: `${request.contactName} · ${request.phone}${request.county ? " · " + request.county : ""}`,
      link: "/admin/wholesale",
      refId: String(request._id),
      email: {
        subject: `🏪 Wholesale request: ${request.businessName}`,
        heading: "New wholesale request",
        intro: "A business wants to stock Rekker brands. Aim to reply within 1–2 working days.",
        rows: [
          ["Business", request.businessName],
          ["Contact", request.contactName],
          ["Phone", request.phone],
          ["Email", request.email],
          ["Type", request.businessType],
          ["Location", [request.town, request.county].filter(Boolean).join(", ")],
          ["Brands", (request.brandsInterested || []).join(", ")],
          ["Monthly volume", request.estimatedMonthlyOrder],
          ["Message", request.message],
        ],
        ctaLabel: "Open wholesale requests",
        ctaUrl: `${CLIENT_URL()}/admin/wholesale`,
      },
      sms: `Rekker: wholesale request from ${request.businessName} (${request.contactName} ${request.phone}).`,
    });
  } catch (e) {
    console.error("notifyNewWholesale error:", e.message);
  }
}

async function notifyNewMessage(message) {
  try {
    await notifyAdmins({
      type: "message",
      title: `New message from ${message.name}`,
      body: message.subject || String(message.message || "").slice(0, 90),
      link: "/admin/messages",
      refId: String(message._id),
      email: {
        subject: `✉️ New ${message.source === "shop" ? "shop" : "website"} message from ${message.name}`,
        heading: "New contact message",
        rows: [
          ["Name", message.name],
          ["Email", message.email],
          ["Phone", message.phone],
          ["Subject", message.subject],
          ["Message", message.message],
        ],
        ctaLabel: "Open messages",
        ctaUrl: `${CLIENT_URL()}/admin/messages`,
      },
    });
  } catch (e) {
    console.error("notifyNewMessage error:", e.message);
  }
}

// Called after stock is deducted. `products` are the updated Product docs.
async function notifyLowStock(products, threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 5) {
  try {
    const low = products.filter((p) => {
      const qty = p.totalStock ?? p.stock ?? 0;
      return qty <= threshold;
    });
    for (const p of low) {
      const qty = p.totalStock ?? p.stock ?? 0;
      await notifyAdmins({
        type: "low_stock",
        title: qty <= 0 ? `Out of stock: ${p.title}` : `Low stock: ${p.title} (${qty} left)`,
        body: "Restock soon so customers can keep ordering it.",
        link: "/admin/products",
        refId: String(p._id),
        // in-app only — no email/SMS spam for stock
      });
    }
  } catch (e) {
    console.error("notifyLowStock error:", e.message);
  }
}

module.exports = { notifyAdmins, notifyNewOrder, notifyNewWholesale, notifyNewMessage, notifyLowStock, getAdminEmails };
