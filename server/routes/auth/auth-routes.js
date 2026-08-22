// server/routes/auth/auth-routes.js
// Authentication routes — includes Firebase, traditional auth, welcome emails, and password reset

const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const { registerUser, loginUser, logoutUser, authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendEmailChangeVerification,
} = require("../../helpers/email");

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

    // Send welcome + verification emails (both non-blocking)
    sendWelcomeEmail(newUser).catch((err) => console.error("Welcome email failed:", err));
    (async () => {
      try {
        const link = await admin.auth().generateEmailVerificationLink(newUser.email, {
          url: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/verify-email`,
          handleCodeInApp: true,
        });
        await sendVerificationEmail(newUser, link);
      } catch (err) {
        console.error("Initial verification email failed:", err.message);
      }
    })();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email, userName: newUser.userName },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: { id: newUser._id, email: newUser.email, role: newUser.role, userName: newUser.userName, emailVerified: newUser.emailVerified },
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

    // Opportunistic sync: if Firebase already considers this email verified
    // (e.g. the user completed verification but the confirmation call to
    // our own backend was missed), reflect that here too.
    if (req.firebaseUser?.email_verified && !user.emailVerified) {
      user.emailVerified = true;
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName, emailVerified: user.emailVerified },
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
            emailVerified: true, // Google already verifies its own accounts' emails
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).json({
      success: true,
      message: "Logged in successfully",
      token: jwtToken,
      user: { id: user._id, email: user.email, role: user.role, userName: user.userName, emailVerified: user.emailVerified },
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
            user: { id: user._id, role: user.role, email: user.email, userName: user.userName, emailVerified: user.emailVerified },
          });
        }
      } catch (firebaseError) {
        console.log("🔄 Firebase token invalid, trying JWT...", firebaseError.message);
      }
    }

    // Fallback: our own JWT — cookie first, then Bearer (cross-site cookie blocking)
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    const token = req.cookies.token || bearerToken;
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
      user: { id: user._id, role: user.role, email: user.email, userName: user.userName, emailVerified: user.emailVerified },
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

    // Only real Google accounts have no password of their own to reset —
    // Firebase EMAIL/PASSWORD users (provider "firebase") also lack a Mongo
    // password (it's stored in Firebase Auth instead), but they absolutely
    // can and should get a reset link. The old check here lumped both cases
    // together via `user.firebaseUid && !user.password`, which meant anyone
    // who signed up with email/password (the default signup path — see
    // register.jsx) was wrongly told "sign in with Google" and never got a
    // working reset link. This was the actual password-reset bug.
    if (user.provider === "google") {
      return res.status(200).json({
        success: true,
        message: "This account uses Google Sign-In. Please sign in with Google.",
        isGoogleAccount: true,
      });
    }

    // For Firebase (email/password) and any user with a real Firebase Auth
    // record, generate a Firebase reset link. handleCodeInApp:true means the
    // emailed link redirects straight into OUR OWN /auth/reset-password page
    // (with ?oobCode=...&mode=resetPassword) instead of showing Firebase's
    // generic hosted reset page — so the whole experience, including the
    // page the customer lands on, stays on rekker.co.ke.
    try {
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/reset-password`,
        handleCodeInApp: true,
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

// ── Email Verification ─────────────────────────────────────────────────────────
// Send (or re-send) a verification email to the logged-in user's own address.
router.post("/send-verification-email", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.emailVerified) {
      return res.status(200).json({ success: true, message: "Your email is already verified." });
    }

    // Firebase users: real Firebase Auth link, delivered from our own domain
    // (via our SMTP), that redirects into our own /auth/verify-email page.
    if (user.firebaseUid) {
      try {
        const link = await admin.auth().generateEmailVerificationLink(user.email, {
          url: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/verify-email`,
          handleCodeInApp: true,
        });
        await sendVerificationEmail(user, link);
        return res.status(200).json({ success: true, message: "Verification email sent!" });
      } catch (fbErr) {
        console.error("Firebase verification link error:", fbErr.message);
        // fall through to the JWT fallback below
      }
    }

    // Local-only accounts (no Firebase record): JWT-token link, same pattern
    // as the password-reset fallback.
    const verifyToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "24h" }
    );
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/verify-email?token=${verifyToken}`;
    await sendVerificationEmail(user, link);
    res.status(200).json({ success: true, message: "Verification email sent!" });
  } catch (error) {
    console.error("❌ send-verification-email error:", error);
    res.status(500).json({ success: false, message: "Failed to send verification email" });
  }
});

// Finalize verification for the JWT-fallback (non-Firebase) path.
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.emailVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "This link has expired. Please request a new one." });
    }
    console.error("❌ verify-email error:", error);
    res.status(500).json({ success: false, message: "Failed to verify email" });
  }
});

// Finalize verification for the Firebase path — the client already called
// applyActionCode() against Firebase directly (that's what actually verifies
// the email). This endpoint deliberately does NOT require the caller to be
// logged in here (they may have clicked the email link on a different
// device/browser than the one they're signed into) — instead it re-checks
// Firebase Auth's own server-side record, which is the actual source of
// truth, so a client can't just claim "verified" without Firebase agreeing.
router.post("/mark-firebase-email-verified", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Missing email" });

    const fbUser = await admin.auth().getUserByEmail(email).catch(() => null);
    if (!fbUser || !fbUser.emailVerified) {
      return res.status(400).json({ success: false, message: "This email isn't verified on Firebase yet." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.emailVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("❌ mark-firebase-email-verified error:", error);
    res.status(500).json({ success: false, message: "Failed to update verification status" });
  }
});

// ── Email Address Change ────────────────────────────────────────────────────────
router.post("/request-email-change", authMiddleware, async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({ success: false, message: "That's already your current email" });
    }
    const taken = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (taken) {
      return res.status(409).json({ success: false, message: "That email is already in use by another account" });
    }

    user.pendingEmail = newEmail;
    await user.save();

    // Firebase users: generateVerifyAndChangeEmailLink both verifies the new
    // address AND changes it on the Firebase Auth record the moment the link
    // is clicked — nothing to double-confirm, we just sync Mongo afterward.
    if (user.firebaseUid) {
      try {
        const link = await admin.auth().generateVerifyAndChangeEmailLink(user.email, newEmail, {
          url: `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/confirm-email-change?firebaseUid=${user.firebaseUid}`,
          handleCodeInApp: true,
        });
        await sendEmailChangeVerification(newEmail, link, user.userName);
        return res.status(200).json({
          success: true,
          message: `We've sent a confirmation link to ${newEmail}. Click it to finish changing your email.`,
        });
      } catch (fbErr) {
        console.error("generateVerifyAndChangeEmailLink error:", fbErr.message);
        // fall through to the JWT fallback below
      }
    }

    const changeToken = jwt.sign(
      { id: user._id, newEmail },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "1h" }
    );
    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/confirm-email-change?token=${changeToken}`;
    await sendEmailChangeVerification(newEmail, link, user.userName);
    res.status(200).json({
      success: true,
      message: `We've sent a confirmation link to ${newEmail}. Click it to finish changing your email.`,
    });
  } catch (error) {
    console.error("❌ request-email-change error:", error);
    res.status(500).json({ success: false, message: "Failed to start email change" });
  }
});

router.post("/confirm-email-change", async (req, res) => {
  try {
    const { token, firebaseUid } = req.body;

    // Firebase path — the client already ran applyActionCode() against
    // Firebase directly, which is what actually changed the email server-side.
    // We re-read the email from Firebase itself (not from the request body)
    // so this can't be used to graft an arbitrary email onto an account.
    if (firebaseUid) {
      const fbUser = await admin.auth().getUser(firebaseUid);
      const user = await User.findOne({ firebaseUid });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const clash = await User.findOne({ email: fbUser.email, _id: { $ne: user._id } });
      if (clash) {
        return res.status(409).json({ success: false, message: "That email is already linked to another account" });
      }

      user.email = fbUser.email;
      user.pendingEmail = null;
      user.emailVerified = true;
      await user.save();
      return res.status(200).json({ success: true, message: "Email updated successfully!", email: user.email });
    }

    if (!token) return res.status(400).json({ success: false, message: "Missing token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const clash = await User.findOne({ email: decoded.newEmail, _id: { $ne: user._id } });
    if (clash) {
      return res.status(409).json({ success: false, message: "That email is already linked to another account" });
    }

    user.email = decoded.newEmail;
    user.pendingEmail = null;
    user.emailVerified = true;
    await user.save();
    res.status(200).json({ success: true, message: "Email updated successfully!", email: user.email });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "This link has expired. Please request a new one." });
    }
    console.error("❌ confirm-email-change error:", error);
    res.status(500).json({ success: false, message: "Failed to update email" });
  }
});

module.exports = router;