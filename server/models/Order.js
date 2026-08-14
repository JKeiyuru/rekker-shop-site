// shop/server/models/Order.js
// Shop Rekker Order Model — supports COD, M-Pesa, and PayPal payment methods,
// plus guest checkout (no account required) and multi-brand line items.

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
      enum: ["cod", "mpesa", "paypal"],
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

    // M-Pesa specific
    mpesaCheckoutId:  { type: String, default: null },
    mpesaCallbackData: { type: mongoose.Schema.Types.Mixed, default: null },

    // Delivery tracking
    estimatedDeliveryDate: { type: Date, default: null },
    actualDeliveryDate:    { type: Date, default: null },
    trackingNumber:        { type: String, default: null },
    deliveryNotes:         { type: String, default: null },
  },
  { timestamps: true }
);

// Indexes for query performance
OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ mpesaCheckoutId: 1 }, { sparse: true });
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
