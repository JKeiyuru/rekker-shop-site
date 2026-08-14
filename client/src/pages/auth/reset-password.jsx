// client/src/pages/auth/reset-password.jsx
// Reset password page — accessed via emailed link with a JWT or Firebase token

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle, Lock } from "lucide-react";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(!token);

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { label: "Too short", color: "bg-red-400", width: "25%" };
    if (password.length < 8) return { label: "Weak", color: "bg-orange-400", width: "50%" };
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { label: "Fair", color: "bg-yellow-400", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  };
  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/auth/login"), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed. The link may have expired.";
      if (msg.toLowerCase().includes("expired")) {
        setTokenError(true);
      } else {
        toast({ title: msg, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-red-700 tracking-widest">REKKER</h1>
          <p className="text-sm text-gray-500 mt-1">Quality · Trust · Excellence</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Expired / invalid token */}
          {tokenError && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h2>
              <p className="text-gray-500 text-sm mb-6">
                This password reset link is no longer valid. Please request a new one.
              </p>
              <Link to="/auth/forgot-password">
                <Button className="bg-red-700 hover:bg-red-800 w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <div className="mt-3">
                <Link to="/auth/login">
                  <Button variant="ghost" className="w-full text-gray-500">Back to Login</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Success */}
          {!tokenError && success && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been changed successfully. You'll be redirected to login shortly.
              </p>
              <Link to="/auth/login">
                <Button className="bg-red-700 hover:bg-red-800 w-full">Go to Login</Button>
              </Link>
            </div>
          )}

          {/* Reset form */}
          {!tokenError && !success && (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-red-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Choose a strong password for your Rekker account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {strength && (
                    <div className="space-y-1">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} rounded-full transition-all duration-300`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 ${confirmPassword && confirmPassword !== password ? "border-red-400" : ""}`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== password && (
                    <p className="text-xs text-red-500">Passwords don't match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-800 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;