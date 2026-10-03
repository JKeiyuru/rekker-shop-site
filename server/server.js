// server/server.js
// Main Express server entry point

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

// Firebase Admin Initialization
const admin = require("firebase-admin");
if (!admin.apps.length) {
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };
  console.log("Firebase Config Check:", {
    hasProjectId: !!firebaseConfig.projectId,
    hasPrivateKey: !!firebaseConfig.privateKey,
    hasClientEmail: !!firebaseConfig.clientEmail,
    projectId: firebaseConfig.projectId,
  });
  if (firebaseConfig.projectId && firebaseConfig.privateKey && firebaseConfig.clientEmail) {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
    });
    console.log("Firebase Admin initialized successfully");
  } else {
    console.warn("Firebase environment variables not found. Skipping Firebase initialization.");
  }
}

// Routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminDeliveryLocationsRouter = require("./routes/admin/delivery-locations-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopDeliveryRouter = require("./routes/shop/delivery-routes");
const wishlistRouter = require("./routes/shop/wishlist-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");
const contactRouter = require("./routes/common/contact-routes");
const mpesaRouter = require("./routes/shop/mpesa-routes");
const paystackRouter = require("./routes/shop/paystack-routes");
const shopBrandsRouter = require("./routes/shop/brands-routes");
const shopCategoriesRouter = require("./routes/shop/categories-routes");
const shopPromotionsRouter = require("./routes/shop/promotions-routes");
const shopBundlesRouter = require("./routes/shop/bundles-routes");
const shopArticlesRouter = require("./routes/shop/articles-routes");
const adminBrandsRouter = require("./routes/admin/brands-routes");
const adminCategoriesRouter = require("./routes/admin/categories-routes");
const adminPromotionsRouter = require("./routes/admin/promotions-routes");
const adminBundlesRouter = require("./routes/admin/bundles-routes");
const adminArticlesRouter = require("./routes/admin/articles-routes");
const adminAnalyticsRouter = require("./routes/admin/analytics-routes");
const adminBannersRouter = require("./routes/admin/banners-routes");
const adminDiscountsRouter = require("./routes/admin/discounts-routes");
const adminFaqsRouter = require("./routes/admin/faqs-routes");
const shopDiscountRouter = require("./routes/shop/discount-routes");
const shopAssistantRouter = require("./routes/shop/assistant-routes");
const adminNotificationsRouter = require("./routes/admin/notifications-routes");
const shopBannersRouter = require("./routes/shop/banners-routes");
const wholesaleRouter = require("./routes/common/wholesale-routes");
const { adminOnly } = require("./middleware/admin");

const app = express();

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

const PORT = process.env.PORT || 5000;

// Parse CORS origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) 
  : [];

// Add default origins for development
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://rekker.co.ke',
  'https://www.rekker.co.ke',
  'https://shop.rekker.co.ke',
  'https://www.shop.rekker.co.ke'
];

// Combine and deduplicate origins
const allAllowedOrigins = [...new Set([...defaultOrigins, ...allowedOrigins])];

console.log('🌐 Allowed CORS origins:', allAllowedOrigins);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      console.log('📡 Request with no origin - allowing');
      return callback(null, true);
    }
    
    // Remove trailing slash from origin for comparison if present
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    // Check if origin is in allowed list
    if (allAllowedOrigins.includes(normalizedOrigin) || allAllowedOrigins.includes(origin)) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      return callback(null, true);
    }
    
    // Check if origin matches any pattern (e.g., for Render preview URLs)
    if (origin.includes('.onrender.com')) {
      console.log(`✅ CORS allowed for Render domain: ${origin}`);
      return callback(null, true);
    }
    
    // Log blocked origins for debugging
    console.warn(`❌ CORS blocked for origin: ${origin}`);
    console.warn('   Allowed origins:', allAllowedOrigins);
    
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With", 
    "Accept", 
    "Cache-Control",
    "Origin"
  ],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

app.use(cookieParser());
// `verify` stashes the raw request buffer on req.rawBody — Paystack signs the
// exact raw bytes of the webhook body with HMAC-SHA512, and re-serializing
// the already-parsed JSON before hashing can produce a different byte
// sequence (key order, spacing) and fail signature verification.
app.use(express.json({
  limit: "10mb",
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Security headers
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  
  // Add additional CORS headers as backup
  res.setHeader("Access-Control-Allow-Credentials", "true");
  
  // Log all incoming requests for debugging (optional - remove in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  }
  
  next();
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);

// Admin
// Every /api/admin route now requires a logged-in admin
app.use("/api/admin", ...adminOnly);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/delivery-locations", adminDeliveryLocationsRouter);
app.use("/api/admin/brands", adminBrandsRouter);
app.use("/api/admin/categories", adminCategoriesRouter);
app.use("/api/admin/promotions", adminPromotionsRouter);
app.use("/api/admin/bundles", adminBundlesRouter);
app.use("/api/admin/articles", adminArticlesRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/banners", adminBannersRouter);
app.use("/api/admin/discounts", adminDiscountsRouter);
app.use("/api/admin/faqs", adminFaqsRouter);
app.use("/api/admin/notifications", adminNotificationsRouter);

// Shop
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/delivery", shopDeliveryRouter);
app.use("/api/shop", mpesaRouter);
app.use("/api/shop", paystackRouter);
app.use("/api/shop/brands", shopBrandsRouter);
app.use("/api/shop/categories", shopCategoriesRouter);
app.use("/api/shop/promotions", shopPromotionsRouter);
app.use("/api/shop/bundles", shopBundlesRouter);
app.use("/api/shop/articles", shopArticlesRouter);
app.use("/api/shop/banners", shopBannersRouter);
app.use("/api/shop/discount", shopDiscountRouter);
app.use("/api/shop/assistant", shopAssistantRouter);

// Wishlist & Common
app.use("/api/wishlist", wishlistRouter);
app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/contact", contactRouter);
app.use("/api/wholesale", wholesaleRouter);

// Health Check
app.get("/health", (req, res) => res.status(200).send("OK"));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS') || err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ 
      success: false, 
      message: "CORS error: Origin not allowed",
      origin: req.headers.origin 
    });
  }
  
  res.status(500).json({ 
    success: false, 
    message: process.env.NODE_ENV === 'production' 
      ? "Internal Server Error" 
      : err.message 
  });
});

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(false).then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});