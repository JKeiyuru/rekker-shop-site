// server/helpers/email.js
// Email service using Nodemailer with HostAfrica SMTP

const nodemailer = require("nodemailer");

// Create transporter using HostAfrica SMTP settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.rekker.co.ke",
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true, // true for port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER || "info@rekker.co.ke",
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certs (common with hosting providers)
    },
  });
};

const FROM_NAME = "Rekker Limited";
const FROM_EMAIL = process.env.SMTP_USER || "info@rekker.co.ke";
const WHATSAPP_NUMBER = "254796183064";

// Base HTML wrapper for all emails
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rekker Limited</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 30px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #b91c1c, #e11d48); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; margin: 0; letter-spacing: 3px; font-weight: 900; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; letter-spacing: 1px; }
    .body { padding: 36px 40px; color: #333; }
    .body h2 { color: #b91c1c; font-size: 20px; margin-top: 0; }
    .body p { line-height: 1.7; font-size: 15px; color: #444; }
    .order-box { background: #fff8f8; border: 1px solid #fecdd3; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .order-box h3 { color: #b91c1c; margin-top: 0; font-size: 16px; }
    .order-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #fee2e2; font-size: 14px; }
    .order-row:last-child { border-bottom: none; font-weight: bold; }
    .badge { display: inline-block; background: #b91c1c; color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .btn { display: inline-block; background: #25D366; color: #fff !important; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; margin-top: 16px; }
    .btn-red { background: linear-gradient(135deg, #b91c1c, #e11d48); }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .info-item { background: #f9fafb; border-radius: 6px; padding: 12px; font-size: 13px; }
    .info-item strong { display: block; color: #b91c1c; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer { background: #1f1f1f; padding: 24px 40px; text-align: center; color: #aaa; font-size: 12px; }
    .footer a { color: #f87171; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #fee2e2; margin: 20px 0; }
    ul.features { padding-left: 20px; color: #555; }
    ul.features li { margin-bottom: 8px; font-size: 14px; }
    @media (max-width: 600px) { .body { padding: 24px 20px; } .header { padding: 24px 20px; } .info-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>REKKER</h1>
      <p>Quality · Trust · Excellence</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p><strong style="color:#fff;">Rekker Limited</strong></p>
      <p>Industrial Area, Nairobi, Kenya &nbsp;|&nbsp; P.O. Box 12345-00100</p>
      <p>📞 +254 700 123 456 &nbsp;|&nbsp; ✉️ <a href="mailto:info@rekker.co.ke">info@rekker.co.ke</a></p>
      <p>WhatsApp: <a href="https://wa.me/${WHATSAPP_NUMBER}">+254 796 183 064</a></p>
      <p style="margin-top:12px; color:#666; font-size:11px;">© ${new Date().getFullYear()} Rekker Limited. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// ─────────────────────────────────────────────
// 1. WELCOME EMAIL
// ─────────────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  const transporter = createTransporter();
  const content = `
    <h2>Welcome to Rekker, ${user.userName}! 🎉</h2>
    <p>We're thrilled to have you join the Rekker family. Your account has been created successfully.</p>
    
    <div class="order-box">
      <h3>About Rekker Limited</h3>
      <p style="margin:0; font-size:14px; color:#555;">
       Rekker Limited is a leading Kenyan importer, manufacturer and distributor of high-quality everyday essentials.
We proudly manufacture the <strong>Saffron</strong> range of cleaning and personal care products, and are the exclusive national distributor of <strong>Cornells</strong> premium beauty products across Kenya.
In addition, we import and distribute a diverse portfolio of carefully selected products to serve households and businesses nationwide.
      </p>
    </div>

    <h3 style="color:#b91c1c;">How We Work</h3>
    <ul class="features">
      <li>🛒 Browse our full catalogue and add items to your cart</li>
      <li>📦 We deliver across all 47 counties in Kenya</li>
      <li>💳 Pay via PayPal, M-Pesa, or Cash on Delivery</li>
      <li>🚚 Free delivery for orders within Nairobi CBD</li>
      <li>📱 Track your order status from your account dashboard</li>
      <li>💬 Reach us anytime on WhatsApp for quick support</li>
    </ul>

    <hr class="divider" />
    
    <div class="info-grid">
      <div class="info-item">
        <strong>📍 Our Location</strong>
        Industrial Area, Nairobi<br/>P.O. Box 12345-00100
      </div>
      <div class="info-item">
        <strong>📞 Contact Us</strong>
        +254 700 123 456<br/>info@rekker.co.ke
      </div>
      <div class="info-item">
        <strong>🕐 Business Hours</strong>
        Mon–Fri: 8am – 6pm<br/>Sat: 9am – 2pm
      </div>
      <div class="info-item">
        <strong>💬 WhatsApp Support</strong>
        +254 796 183 064<br/>Quick response guaranteed
      </div>
    </div>

    <p style="text-align:center; margin-top:24px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Rekker!%20I%20just%20created%20my%20account%20and%20would%20love%20to%20learn%20more%20about%20your%20products." 
         class="btn">
        💬 Chat With Us on WhatsApp
      </a>
    </p>

    <p style="color:#888; font-size:13px; margin-top:20px;">
      If you did not create this account, please ignore this email or contact us immediately.
    </p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject: `Welcome to Rekker, ${user.userName}! 🎉`,
    html: baseTemplate(content),
  });

  console.log("✅ Welcome email sent to:", user.email);
};

// ─────────────────────────────────────────────
// 2. ORDER CONFIRMATION EMAIL
// ─────────────────────────────────────────────
const sendOrderConfirmationEmail = async (user, order) => {
  const transporter = createTransporter();
  const paymentNote = order.paymentMethod === "cod"
    ? `<p style="background:#fef3c7; border:1px solid #fbbf24; border-radius:6px; padding:12px; font-size:14px;">
        💵 <strong>Cash on Delivery:</strong> Please have <strong>KES ${order.totalAmount?.toLocaleString()}</strong> ready when your order arrives.
       </p>`
    : `<p style="background:#dcfce7; border:1px solid #86efac; border-radius:6px; padding:12px; font-size:14px;">
        ✅ <strong>Payment Received:</strong> Thank you for your payment via ${order.paymentMethod === "mpesa" ? "M-Pesa" : "PayPal"}. Your order is confirmed.
       </p>`;

  const itemsHtml = order.cartItems?.map(item => `
    <div class="order-row">
      <span>${item.title} × ${item.quantity}</span>
      <span>KES ${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join("") || "";

  const content = `
    <h2>Order Confirmed! 🎊</h2>
    <p>Hi <strong>${user.userName}</strong>, thank you for your order! We've received it and our team is already working on it.</p>

    ${paymentNote}

    <div class="order-box">
      <h3>Order Summary — <span class="badge">#${order._id?.toString().slice(-8).toUpperCase()}</span></h3>
      <p style="font-size:13px; color:#888;">Placed on: ${new Date(order.orderDate).toLocaleDateString("en-KE", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      
      ${itemsHtml}
      
      <div class="order-row">
        <span>Subtotal</span>
        <span>KES ${order.subtotalAmount?.toLocaleString()}</span>
      </div>
      <div class="order-row">
        <span>🚚 Delivery Fee</span>
        <span>${order.deliveryFee === 0 ? "FREE" : `KES ${order.deliveryFee?.toLocaleString()}`}</span>
      </div>
      <div class="order-row" style="font-size:16px; color:#b91c1c;">
        <span>Total</span>
        <span>KES ${order.totalAmount?.toLocaleString()}</span>
      </div>
    </div>

    <div class="order-box">
      <h3>Delivery Details</h3>
      <div class="info-grid">
        <div class="info-item">
          <strong>📍 Delivery Address</strong>
          ${order.addressInfo?.location}, ${order.addressInfo?.subCounty}<br/>
          ${order.addressInfo?.county}<br/>
          ${order.addressInfo?.specificAddress || ""}
        </div>
        <div class="info-item">
          <strong>📞 Contact</strong>
          ${order.addressInfo?.phone || user.phone || "N/A"}
        </div>
        <div class="info-item">
          <strong>💳 Payment</strong>
          ${order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "mpesa" ? "M-Pesa" : "PayPal"}
        </div>
        <div class="info-item">
          <strong>📦 Status</strong>
          <span class="badge" style="font-size:11px;">${order.orderStatus?.toUpperCase()}</span>
        </div>
      </div>
      ${order.addressInfo?.notes ? `<p style="margin:8px 0 0; font-size:13px; color:#666;"><strong>Notes:</strong> ${order.addressInfo.notes}</p>` : ""}
    </div>

    <p>We'll send you another email as soon as your order is dispatched. In the meantime, feel free to reach us on WhatsApp!</p>

    <p style="text-align:center;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Rekker!%20I%20just%20placed%20order%20%23${order._id?.toString().slice(-8).toUpperCase()}%20and%20would%20like%20to%20follow%20up." 
         class="btn">
        💬 Track Order on WhatsApp
      </a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject: `Order Confirmed #${order._id?.toString().slice(-8).toUpperCase()} — Rekker`,
    html: baseTemplate(content),
  });

  console.log("✅ Order confirmation email sent to:", user.email);
};

// ─────────────────────────────────────────────
// 3. ORDER DISPATCHED EMAIL
// ─────────────────────────────────────────────
const sendOrderDispatchedEmail = async (user, order) => {
  const transporter = createTransporter();
  const content = `
    <h2>Your Order is On Its Way! 🚚</h2>
    <p>Hi <strong>${user.userName}</strong>, great news! Your order has been dispatched and is on its way to you.</p>

    <div class="order-box">
      <h3>Order #${order._id?.toString().slice(-8).toUpperCase()} — <span class="badge" style="background:#2563eb;">IN SHIPPING</span></h3>
      
      <div class="info-grid">
        <div class="info-item">
          <strong>📍 Delivering To</strong>
          ${order.addressInfo?.location}, ${order.addressInfo?.subCounty}<br/>
          ${order.addressInfo?.county}
        </div>
        <div class="info-item">
          <strong>📞 Delivery Contact</strong>
          ${order.addressInfo?.phone || "N/A"}
        </div>
        <div class="info-item">
          <strong>💳 Payment Method</strong>
          ${order.paymentMethod === "cod" ? "Cash on Delivery" : order.paymentMethod === "mpesa" ? "M-Pesa" : "PayPal"}
        </div>
        <div class="info-item">
          <strong>💰 Amount</strong>
          ${order.paymentMethod === "cod" ? `KES ${order.totalAmount?.toLocaleString()} (pay on delivery)` : "Paid ✓"}
        </div>
      </div>
    </div>

    <p><strong>What to expect:</strong></p>
    <ul class="features">
      <li>Our delivery team will contact you on <strong>${order.addressInfo?.phone}</strong> before arrival</li>
      ${order.paymentMethod === "cod" ? `<li>Please have <strong>KES ${order.totalAmount?.toLocaleString()}</strong> ready</li>` : ""}
      <li>If you have any special delivery instructions, WhatsApp us immediately</li>
      <li>Someone should be available to receive the package</li>
    </ul>

    <p style="text-align:center; margin-top:24px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Rekker!%20I%20have%20a%20question%20about%20my%20dispatch%20for%20order%20%23${order._id?.toString().slice(-8).toUpperCase()}" 
         class="btn">
        💬 Contact Delivery Team
      </a>
    </p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject: `🚚 Your Order #${order._id?.toString().slice(-8).toUpperCase()} Has Been Dispatched!`,
    html: baseTemplate(content),
  });

  console.log("✅ Dispatch email sent to:", user.email);
};

// ─────────────────────────────────────────────
// 4. ORDER DELIVERED EMAIL
// ─────────────────────────────────────────────
const sendOrderDeliveredEmail = async (user, order) => {
  const transporter = createTransporter();
  const content = `
    <h2>Order Delivered Successfully! ✅</h2>
    <p>Hi <strong>${user.userName}</strong>, your order has been delivered! We hope you love your purchase. 🎉</p>

    <div class="order-box">
      <h3>Order #${order._id?.toString().slice(-8).toUpperCase()} — <span class="badge" style="background:#16a34a;">DELIVERED</span></h3>
      <p style="font-size:14px; color:#555;">
        Thank you for shopping with Rekker. Your satisfaction means everything to us.
      </p>
      <div class="order-row">
        <span>Order Total</span>
        <span><strong>KES ${order.totalAmount?.toLocaleString()}</strong></span>
      </div>
      <div class="order-row">
        <span>Payment</span>
        <span>${order.paymentMethod === "cod" ? "Paid on Delivery ✓" : "Pre-paid ✓"}</span>
      </div>
    </div>

    <p>We'd love to hear your feedback! Please consider leaving a review for the products you ordered.</p>
    
    <p><strong>Had an issue with your order?</strong> Contact us within 7 days and we'll make it right.</p>

    <p style="text-align:center; margin-top:24px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Rekker!%20I%20just%20received%20my%20order%20%23${order._id?.toString().slice(-8).toUpperCase()}" 
         class="btn">
        💬 Share Your Feedback
      </a>
    </p>

    <p style="color:#888; font-size:13px; margin-top:20px; text-align:center;">
      Thank you for choosing Rekker. We look forward to serving you again! 🛍️
    </p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: user.email,
    subject: `✅ Order #${order._id?.toString().slice(-8).toUpperCase()} Delivered — Thank You!`,
    html: baseTemplate(content),
  });

  console.log("✅ Delivery confirmation email sent to:", user.email);
};

// ─────────────────────────────────────────────
// 5. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────
const sendPasswordResetEmail = async (email, resetLink) => {
  const transporter = createTransporter();
  const content = `
    <h2>Reset Your Password 🔐</h2>
    <p>We received a request to reset the password for your Rekker account associated with <strong>${email}</strong>.</p>

    <div class="order-box">
      <p style="margin:0; font-size:14px;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
    </div>

    <p style="text-align:center; margin: 28px 0;">
      <a href="${resetLink}" class="btn btn-red" style="background: linear-gradient(135deg, #b91c1c, #e11d48); color:#fff; text-decoration:none;">
        Reset My Password
      </a>
    </p>

    <p style="color:#888; font-size:13px;">
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
      If you're concerned about your account security, contact us immediately.
    </p>

    <hr class="divider" />
    <p style="color:#888; font-size:12px; text-align:center;">
      This link will expire in 1 hour for security reasons.<br/>
      Never share this link with anyone, including Rekker staff.
    </p>
  `;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: email,
    subject: "Reset Your Rekker Password 🔐",
    html: baseTemplate(content),
  });

  console.log("✅ Password reset email sent to:", email);
};

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderDispatchedEmail,
  sendOrderDeliveredEmail,
  sendPasswordResetEmail,
};