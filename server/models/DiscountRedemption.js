const mongoose = require("mongoose");
const DiscountRedemptionSchema = new mongoose.Schema(
  {
    codeId: { type: mongoose.Schema.Types.ObjectId, ref: "DiscountCode", index: true, required: true },
    code: { type: String },
    userId: { type: String, index: true },
    orderId: { type: String, unique: true, index: true }, // one redemption per order, ever
    discountAmount: { type: Number, default: 0 },
    orderTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("DiscountRedemption", DiscountRedemptionSchema);
