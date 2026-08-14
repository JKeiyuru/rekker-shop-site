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
import { syncFirebaseAuth } from "@/store/auth-slice";

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

      if (syncFirebaseAuth.fulfilled.match(syncResult) && syncResult.payload?.success) {
        console.log("✅ Google login sync successful, role:", syncResult.payload?.user?.role);
        // Pass the full payload (which includes user.role) to the caller
        onSuccess(syncResult.payload);
      } else {
        console.warn("⚠️ Sync returned no user data — Firebase auth still succeeded");
        // Fall back: signal success without role info; App.jsx will figure it out
        // via the onAuthStateChanged listener.
        onSuccess({ user: { email: result.user.email, role: "user" } });
      }
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