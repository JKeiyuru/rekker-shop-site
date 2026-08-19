// client/src/components/auth/auth-providers.jsx
// Fixed: onSuccess now receives the full payload from syncFirebaseAuth,
// including the user object with role, so login.jsx can navigate correctly.

/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { syncFirebaseAuth, checkAuth } from "@/store/auth-slice";

export function AuthProviders({ onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      console.log("🔐 Starting Google sign-in...");

      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google sign-in successful:", result.user.email);

      // Sync with backend — this updates Redux state (user + role) AND
      // sets the JWT cookie so the user is fully authenticated.
      const syncResult = await dispatch(syncFirebaseAuth(result.user));

      if (syncFirebaseAuth.fulfilled.match(syncResult) && syncResult.payload?.success && syncResult.payload?.user) {
        console.log("✅ Google login sync successful, role:", syncResult.payload?.user?.role);
        // Pass the full payload (which includes user.role) to the caller
        onSuccess(syncResult.payload);
        return;
      }

      // The backend sync failed (or returned no user) — do NOT report success.
      // Reporting success here (as this used to do) meant the UI would show
      // "Welcome back!" and navigate even though Redux never actually got
      // isAuthenticated set to true, leaving the header stuck on Login/Sign up.
      console.error(
        "❌ Backend sync failed after Google sign-in:",
        syncResult.payload || syncResult.error
      );

      // One more legitimate attempt: verify via check-auth using a fresh ID
      // token, in case /api/auth/social-login itself is misconfigured
      // (e.g. Admin SDK credentials) but the plain JWT/cookie path still works.
      try {
        const idToken = await result.user.getIdToken(true);
        const authResult = await dispatch(checkAuth(idToken));
        if (checkAuth.fulfilled.match(authResult) && authResult.payload?.success && authResult.payload?.user) {
          console.log("✅ Recovered via checkAuth() fallback");
          onSuccess(authResult.payload);
          return;
        }
      } catch (fallbackError) {
        console.error("❌ checkAuth() fallback also failed:", fallbackError);
      }

      onError(
        syncResult.payload?.message ||
          "We couldn't finish signing you in with Google. Please try again, or contact support if this keeps happening."
      );
    } catch (error) {
      console.error("❌ Google sign-in error:", error);

      let errorMessage = "Authentication failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked. Please allow pop-ups and try again.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage =
          "An account already exists with this email using a different sign-in method.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full gap-2 mt-4"
      onClick={handleGoogleLogin}
      disabled={isLoading}
    >
      <FcGoogle className="text-lg" />
      {isLoading ? "Connecting..." : "Continue with Google"}
    </Button>
  );
}