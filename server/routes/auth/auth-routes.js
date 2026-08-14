// server/routes/auth/auth-routes.js
// Authentication routes — includes Firebase, traditional auth, welcome emails, and password reset

const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { registerUser, loginUser, logoutUser } = require("../../controllers/auth/auth-controller");
const { sendWelcomeEmail, sendPasswordResetEmail } = require("../../helpers/email");

const router = express.Router();

// ── Firebase token verification middleware ────────────────────────────────────
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization token required" });
    }
    const idToken = authHeader.split(" ")[1];
    console.log("🔍 Verifying Firebase token...");
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Token verified for user:", decodedToken.email);
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    let errorMessage = "Invalid authentication token";
    if (error.code === "auth/id-token-expired") errorMessage = "Session expired. Please login again.";
    else if (error.code === "auth/argument-error") errorMessage = "Invalid token format";
    else if (error.code === "auth/id-token-revoked") errorMessage = "Token has been revoked";
    return res.status(401).json({ success: false, message: errorMessage, errorCode: error.code });
  }
};

// ── Traditional routes ────────────────────────────────────────────────────────
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// ── Firebase Registration ────────────────────────────────────────────────────
router.post("/firebase-register", verifyFirebaseToken, async (req, res) => {
  try {
    const { userName, firebaseUid } = req.body;
    const { uid, email: firebaseEmail } = req.firebaseUser;

    if (firebaseUid !== uid) {
      return res.status(400).json({ success: false, message: "Invalid Firebase token" });
    }

    const existingUser = await User.findOne({ $or: [{ email: firebaseEmail }, { firebaseUid: uid }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists!" });
    }

    const newUser = new User({ userName, email: firebaseEmail, firebaseUid: uid, provider: "firebase" });
    await newUser.save();
    console.log("✅ New user created:", newUser.email);

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
    console.error("❌ Firebase registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── Firebase Login ────────────────────────────────────────────────────────────
router.post("/firebase-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email: firebaseEmail } = req.firebaseUser;
    console.log("🔐 Firebase Login - UID:", uid, "Email:", firebaseEmail);

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      user = await User.findOne({ email: firebaseEmail });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.provider = "firebase";
      await user.save();
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
    console.error("❌ Firebase login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── Social Login (Google) ─────────────────────────────────────────────────────
router.post("/social-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name } = req.firebaseUser;
    console.log("🎉 Social Login - UID:", uid, "Email:", email);

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) user = await User.findOne({ email });

    const isNewUser = !user;

    if (!user) {
      let userName = name || email.split("@")[0];
      let attempts = 0;
      while (attempts < 10) {
        try {
          user = new User({
            userName: attempts === 0 ? userName : `${userName}${attempts}`,
            email,
            firebaseUid: uid,
            provider: "google",
            role: "user",
          });
          await user.save();
          break;
        } catch (saveError) {
          if (saveError.code === 11000 && saveError.keyValue?.userName) {
            attempts++;
          } else throw saveError;
        }
      }
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      user.provider = user.provider || "google";
      await user.save();
    }

    // Welcome email only for brand new users
    if (isNewUser) {
      sendWelcomeEmail(user).catch((err) => console.error("Welcome email failed:", err));
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email, userName: user.userName },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.cookie("token", jwtToken, {
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
    console.error("❌ Social login error:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed. Please try another method.",
      errorCode: error.code,
    });
  }
});

// ── Check Auth ────────────────────────────────────────────────────────────────
router.get("/check-auth", async (req, res) => {
  try {
    console.log("🔍 Check auth request received");

    // Try Firebase Bearer token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const idToken = authHeader.split(" ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (user) {
          return res.status(200).json({
            success: true,
            user: { id: user._id, role: user.role, email: user.email, userName: user.userName },
          });
        }
      } catch (firebaseError) {
        console.log("🔄 Firebase token invalid, trying JWT...", firebaseError.message);
      }
    }

    // Fallback: JWT cookie
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No authentication token found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: { id: user._id, role: user.role, email: user.email, userName: user.userName },
    });
  } catch (error) {
    console.error("❌ Auth check error:", error);
    res.status(401).json({ success: false, message: "Invalid authentication token" });
  }
});

// ── Forgot Password (Firebase + traditional) ──────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a reset link has been sent.",
      });
    }

    // For Firebase users, use Firebase password reset link
    if (user.provider === "google" || (user.firebaseUid && !user.password)) {
      return res.status(200).json({
        success: true,
        message: "This account uses Google Sign-In. Please sign in with Google.",
        isGoogleAccount: true,
      });
    }

    // For traditional users, generate Firebase password reset link (works even without Firebase client)
    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/login`,
        handleCodeInApp: false,
      });

      await sendPasswordResetEmail(email, resetLink);

      res.status(200).json({
        success: true,
        message: "Password reset link sent to your email.",
      });
    } catch (firebaseError) {
      console.error("Firebase reset link error:", firebaseError.message);
      // Fallback: generate our own JWT reset token
      const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "CLIENT_SECRET_KEY", { expiresIn: "1h" });
      const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetLink);
      res.status(200).json({ success: true, message: "Password reset link sent to your email." });
    }
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

// ── Reset Password (JWT-based, fallback for non-Firebase users) ───────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully. You can now log in." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Reset link has expired. Please request a new one." });
    }
    console.error("❌ Reset password error:", error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

module.exports = router;