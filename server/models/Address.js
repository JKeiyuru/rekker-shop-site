// server/models/Address.js
// Rekker Address model — stores Kenya-specific delivery addresses per user.
// Max 2 addresses per user is enforced at the controller level.

const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    userId:          { type: String, required: true },
    county:          { type: String, required: true },
    subCounty:       { type: String, required: true },
    location:        { type: String, required: true },
    specificAddress: { type: String, default: "" },
    address:         { type: String, default: "" }, // formatted full address string
    phone:           { type: String, required: true },
    notes:           { type: String, default: "" },
    deliveryFee:     { type: Number, default: 0 },
    isFreeDelivery:  { type: Boolean, default: false },
    isDefault:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1 });

module.exports = mongoose.model("Address", AddressSchema);