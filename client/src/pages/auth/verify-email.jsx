// client/src/pages/auth/verify-email.jsx
// Landing page for account/email confirmation links, in one of two forms:
//   1. Firebase accounts: ?oobCode=...&mode=verifyEmail — applied directly
//      against Firebase Auth via applyActionCode(), then synced to our own
//      User record via /api/auth/mark-firebase-email-verified.
//   2. Local-only accounts: ?token=... — a JWT verified by our backend via
//      POST /api/auth/verify-email.
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // "checking" | "success" | "failed"
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    const run = async () => {
      if (oobCode) {
        try {
          const info = await checkActionCode(auth, oobCode);
          await applyActionCode(auth, oobCode);
          await axios.post(`${API_BASE_URL}/api/auth/mark-firebase-email-verified`, {
            email: info?.data?.email,
          });
          setStatus("success");
        } catch (err) {
          setStatus("failed");
          setMessage(
            err?.code === "auth/invalid-action-code"
              ? "This link has expired or was already used."
              : "We couldn&apos;t verify your email right now."
          );
        }
        return;
      }

      if (token) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, { token });
          if (res.data.success) {
            setStatus("success");
          } else {
            setStatus("failed");
            setMessage(res.data.message || "Verification failed.");
          }
        } catch (err) {
          setStatus("failed");
          setMessage(err.response?.data?.message || "This link has expired or was already used.");
        }
        return;
      }

      setStatus("failed");
      setMessage("This verification link looks incomplete.");
    };
    run();
  }, [oobCode, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-red-700 tracking-widest">REKKER</h1>
          <p className="text-sm text-gray-500 mt-1">Quality · Trust · Excellence</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {status === "checking" && (
            <>
              <Loader2 className="w-10 h-10 text-red-700 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Confirming your email...</h2>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Confirmed! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">Your Rekker account email is now verified.</p>
              <Button className="bg-red-700 hover:bg-red-800 w-full" onClick={() => navigate("/account")}>
                Go to My Account
              </Button>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't Confirm Email</h2>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <div className="space-y-2">
                <Link to="/account">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" /> Resend from My Account
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full text-gray-500">Back to Home</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
