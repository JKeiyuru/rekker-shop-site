// server/controllers/auth/auth-controller.js
// Handles traditional email/password registration and login

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { sendWelcomeEmail } = require("../../helpers/email");

// Register (Traditional)
const registerUser = async (req, res) => {
  const { userName, email, password, firebaseUid } = req.body;
  try {
    const existingUser = await User.findOne({
      $or: [{ email }, ...(firebaseUid ? [{ firebaseUid }] : [])],
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists with this email!" });
    }
    if (!userName || !email) {
      return res.status(400).json({ success: false, message: "Username and email are required" });
    }
    if (!firebaseUid && !password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const newUser = new User({
      userName,
      email,
      ...(password && { password: await bcrypt.hash(password, 12) }),
      ...(firebaseUid && { firebaseUid, provider: "firebase" }),
    });
    await newUser.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(newUser).catch((err) => console.error("Welcome email failed:", err));

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email, userName: newUser.userName },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(201).json({
      success: true,
      message: "Registration successful",
      user: { id: newUser._id, email: newUser.email, role: newUser.role, userName: newUser.userName },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login (Traditional)
const loginUser = async (req, res) => {
  const { email, password, firebaseUid } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ email }, ...(firebaseUid ? [{ firebaseUid }] : [])],
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found. Please check your email or register first." });
    }
    if (!firebaseUid) {
      if (!user.password) {
        return res.status(400).json({ success: false, message: "This account was created with Google. Please use Google sign-in." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid password. Please try again." });
      }
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, userName: user.userName },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "7d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      message: "Logged in successfully",
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Logged out successfully" });
};

// Auth middleware (used by protected routes)
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const admin = require("firebase-admin");
        const idToken = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (user) {
          req.user = { id: user._id, role: user.role, email: user.email, userName: user.userName };
          return next();
        }
      } catch {
        // fall through to JWT
      }
    }
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No authentication token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    req.user = { id: user._id, role: user.role, email: user.email, userName: user.userName };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid authentication token" });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Authentication token expired. Please login again." });
    }
    res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };