// server/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      return !this.firebaseUid; // Password not required if using Firebase auth
    },
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  provider: {
    type: String,
    enum: ['local', 'google', 'firebase'],
    default: 'local'
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  // Set while an email-change is awaiting confirmation on the new address;
  // cleared once the change is confirmed.
  pendingEmail: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;