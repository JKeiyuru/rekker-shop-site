// server/models/DeliveryLocation.js
// Model for admin-managed delivery locations and fees

const mongoose = require("mongoose");

const DeliveryLocationSchema = new mongoose.Schema(
  {
    county: {
      type: String,
      required: [true, "County is required"],
      trim: true,
    },
    subCounty: {
      type: String,
      required: [true, "Sub-county is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location name is required"],
      trim: true,
    },
    deliveryFee: {
      type: Number,
      required: [true, "Delivery fee is required"],
      min: [0, "Delivery fee cannot be negative"],
      default: 0,
    },
    isFreeDelivery: {
      type: Boolean,
      default: false, // Admin can flag a location as free delivery (e.g. CBD)
    },
    isActive: {
      type: Boolean,
      default: true, // Admin can deactivate a location without deleting it
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound index for uniqueness and fast lookups
DeliveryLocationSchema.index({ county: 1, subCounty: 1, location: 1 }, { unique: true });

// Pre-save: if isFreeDelivery is true, set deliveryFee to 0
DeliveryLocationSchema.pre("save", function (next) {
  if (this.isFreeDelivery) {
    this.deliveryFee = 0;
  }
  next();
});

module.exports = mongoose.model("DeliveryLocation", DeliveryLocationSchema);