// client/src/pages/auth/login.jsx
// Fixed: admin users are redirected to /admin/dashboard after login.
// Fixed: Google sign-in correctly updates UI without requiring a page reload.

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, syncFirebaseAuth } from "@/store/auth-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthProviders } from "@/components/auth/auth-providers";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { Loader2, Eye, EyeOff } from "lucide-react";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoading } = useSelector((s) => s.auth || {});

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Helper: navigate based on role
  const navigateByRole = (role) => {
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Firebase sign-in is best-effort — accounts created before Firebase
      //    (or Google-only accounts) must still be able to sign in.
      let firebaseUid;
      try {
        const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        firebaseUid = cred.user.uid;
      } catch (fbError) {
        console.warn("Firebase sign-in unavailable, using backend session:", fbError.code);
      }

      // 2. Backend login — sets the session cookie/token and returns the user + role.
      //    loginUser.fulfilled already puts isAuthenticated + user into Redux, so
      //    there's no need to re-verify via checkAuth() here — that extra round
      //    trip relies on a cross-site cookie that can be blocked by the browser,
      //    and a failure there would incorrectly reset the just-confirmed login.
      const result = await dispatch(loginUser({ formData, firebaseUid }));

      if (loginUser.fulfilled.match(result) && result.payload?.success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        // Use the role returned by the server to decide where to navigate
        navigateByRole(result.payload.user?.role);
      } else {
        toast({
          title: "Login failed",
          description: result.payload?.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);

      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      }

      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Called by AuthProviders after a successful Google sign-in.
  // At this point syncFirebaseAuth has already run (inside AuthProviders) and
  // the Redux state is updated with the user + role, so we can navigate directly.
  const handleGoogleSuccess = (userData) => {
    toast({
      title: "Welcome back!",
      description: "Successfully logged in with Google.",
    });
    // userData comes from syncFirebaseAuth payload which includes the user object
    navigateByRole(userData?.user?.role);
  };

  const handleGoogleError = (error) => {
    toast({
      title: "Google Sign-In Failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-red-700 tracking-widest">REKKER</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-700 hover:bg-red-800 mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Sign-In */}
          <AuthProviders
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link to="/auth/register" className="text-red-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help? WhatsApp us at{" "}
          <a
            href="https://wa.me/254796183064"
            target="_blank"
            rel="noreferrer"
            className="text-green-600 font-medium"
          >
            +254 796 183 064
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;