// shop/server/models/Order.js
// Shop Rekker Order Model — supports COD and Paystack (M-Pesa / card /
// Airtel Money) payment methods, plus guest checkout (no account required)
// and multi-brand line items.

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    // userId is now optional to support guest checkout
    userId: { type: String, default: null },
    isGuestOrder: { type: Boolean, default: false },

    // Guest / contact details captured at checkout regardless of auth state
    customer: {
      name:         { type: String, default: null },
      phone:        { type: String, default: null },
      email:        { type: String, default: null },
      location:     { type: String, default: null },
      instructions: { type: String, default: null },
    },

    // cartId is optional — new checkout flow does not pass it
    cartId: { type: String, default: null },

    cartItems: [
      {
        productId: { type: String, required: true },
        title:     { type: String, required: true },
        image:     { type: String, default: null },
        price:     { type: Number, required: true },
        quantity:  { type: Number, required: true },

        // Legacy string brand (kept for backward compat)
        brand:     { type: String, default: null },

        // Multi-brand catalogue: persist brand identity per line item
        brandId:   { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
        brandName: { type: String, default: null },

        selectedVariation: { type: String, default: null },

        // Bundle deals: one order line that stands for several products.
        // price is the bundle price; bundleItems lists what is inside so the
        // warehouse knows what to pack and stock can be deducted per product.
        isBundle:    { type: Boolean, default: false },
        bundleId:    { type: String, default: null },
        bundleItems: [
          {
            _id: false,
            productId: { type: String },
            title:     { type: String },
            qty:       { type: Number },
          },
        ],
      },
    ],

    addressInfo: {
      // New Kenya-specific fields (used by current checkout)
      county:          { type: String, default: null },
      subCounty:       { type: String, default: null },
      location:        { type: String, default: null },
      specificAddress: { type: String, default: null },
      fullAddress:     { type: String, default: null },
      phone:           { type: String, default: null },
      notes:           { type: String, default: null },

      // Legacy / PayPal fields (kept for backward compat)
      addressId:    { type: String, default: null },
      address:      { type: String, default: null },
      city:         { type: String, default: null },
      pincode:      { type: String, default: null },
    },

    orderStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "inProcess", "inShipping", "delivered", "rejected", "cancelled"],
    },

    paymentMethod: {
      type: String,
      required: true,
      // "mpesa" (direct Daraja STK) and "paypal" are kept in the enum only so
      // existing historical orders still validate on save — new checkouts use
      // "cod" or "paystack" (Paystack covers M-Pesa, Visa/Mastercard, and
      // Airtel Money in one hosted checkout).
      enum: ["cod", "mpesa", "paypal", "paystack"],
    },

    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "refunded"],
    },

    totalAmount:    { type: Number, required: true },
    subtotalAmount: { type: Number, default: 0 },
    deliveryFee:    { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    promotionCode:  { type: String, default: null },

    orderDate:       { type: Date, default: Date.now },
    orderUpdateDate: { type: Date, default: Date.now },

    // Payment provider fields
    paymentId: { type: String, default: null },
    payerId:   { type: String, default: null },

    // M-Pesa specific (legacy direct Daraja integration)
    mpesaCheckoutId:  { type: String, default: null },
    mpesaCallbackData: { type: mongoose.Schema.Types.Mixed, default: null },

    // Paystack specific
    paystackReference: { type: String, default: null },
    paystackChannel:   { type: String, default: null }, // "mobile_money" | "card" | "bank_transfer" | ...

    // Set the moment paymentStatus transitions to "paid" — lets us fire the
    // "thank you" email exactly once, regardless of which path (webhook,
    // verify redirect, or manual admin update) triggers the transition.
    paymentConfirmedAt: { type: Date, default: null },

    // One-time flags so a retry/webhook can never double-deduct stock or
    // double-alert the admins.
    stockDeducted:   { type: Boolean, default: false },

    // Discount / influencer code applied at checkout (subtotalAmount is BEFORE
    // the discount; totalAmount = subtotal - discount + delivery)
    discountCode:     { type: String, default: null },
    discountAmount:   { type: Number, default: 0 },
    discountRedeemed: { type: Boolean, default: false },
    adminNotifiedAt: { type: Date, default: null },

    // Delivery tracking
    estimatedDeliveryDate: { type: Date, default: null },
    actualDeliveryDate:    { type: Date, default: null },
    trackingNumber:        { type: String, default: null },
    deliveryNotes:         { type: String, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Short human-friendly reference used in emails, alerts and WhatsApp messages
OrderSchema.virtual("orderRef").get(function () {
  return "#" + String(this._id).slice(-8).toUpperCase();
});

// Indexes for query performance
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ mpesaCheckoutId: 1 }, { sparse: true });
OrderSchema.index({ paystackReference: 1 }, { sparse: true });
OrderSchema.index({ "cartItems.brandId": 1 });
OrderSchema.index({ "customer.phone": 1 });
OrderSchema.index({ "customer.email": 1 });

// Auto-update orderUpdateDate on every save
OrderSchema.pre("save", function (next) {
  this.orderUpdateDate = new Date();
  if (!this.userId) {
    this.isGuestOrder = true;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
