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
    enum: ['local', 'google'],
    default: 'local'
  },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin"],
  },
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;