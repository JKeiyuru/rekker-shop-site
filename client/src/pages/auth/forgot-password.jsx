// client/src/pages/auth/forgot-password.jsx
// Forgot password page — user enters email, backend sends reset link

import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Mail, Loader2, CheckCircle } from "lucide-react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Please enter your email address", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      if (res.data.isGoogleAccount) {
        setIsGoogleAccount(true);
      }
      setSubmitted(true);
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
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

          {/* Back link */}
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-700 hover:bg-red-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{" "}
                <Link to="/auth/login" className="text-red-700 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            // Success state
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {isGoogleAccount ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Google Account Detected</h2>
                  <p className="text-gray-600 text-sm mb-6">
                    Your account was created with Google Sign-In. You don't need a password —
                    just click the Google button on the login page.
                  </p>
                  <Link to="/auth/login">
                    <Button className="bg-red-700 hover:bg-red-800 w-full">
                      Back to Login
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-600 text-sm mb-2">
                    If an account exists for <strong>{email}</strong>, we've sent a password
                    reset link to that address.
                  </p>
                  <p className="text-gray-400 text-xs mb-6">
                    The link expires in 1 hour. Check your spam folder if you don't see it.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => { setSubmitted(false); setEmail(""); }}
                  >
                    Try a different email
                  </Button>
                  <div className="mt-4">
                    <Link to="/auth/login">
                      <Button variant="ghost" className="w-full text-gray-500">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
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

export default ForgotPasswordPage;