// client/src/pages/auth/confirm-email-change.jsx
// Landing page for email-change confirmation links, in one of two forms:
//   1. Firebase accounts: ?oobCode=...&mode=verifyAndChangeEmail&firebaseUid=...
//      — applyActionCode() both verifies AND changes the email on Firebase
//      Auth's own record; we then sync that onto our User record via
//      /api/auth/confirm-email-change using the firebaseUid.
//   2. Local-only accounts: ?token=... — a JWT verified by our backend.
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { applyActionCode } from "firebase/auth";
import { auth } from "@/firebase";
import { API_BASE_URL } from "@/config/config.js";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { checkAuth } from "@/store/auth-slice";

function ConfirmEmailChangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("");
  const [newEmail, setNewEmail] = useState(null);

  const token = searchParams.get("token");
  const oobCode = searchParams.get("oobCode");
  const firebaseUid = searchParams.get("firebaseUid");

  useEffect(() => {
    const run = async () => {
      if (oobCode && firebaseUid) {
        try {
          await applyActionCode(auth, oobCode);
          const res = await axios.post(`${API_BASE_URL}/api/auth/confirm-email-change`, { firebaseUid });
          if (res.data.success) {
            setNewEmail(res.data.email);
            setStatus("success");
            dispatch(checkAuth());
          } else {
            setStatus("failed");
            setMessage(res.data.message);
          }
        } catch (err) {
          setStatus("failed");
          setMessage(
            err?.code === "auth/invalid-action-code"
              ? "This link has expired or was already used."
              : err.response?.data?.message || "We couldn&apos;t confirm this email change."
          );
        }
        return;
      }

      if (token) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/confirm-email-change`, { token });
          if (res.data.success) {
            setNewEmail(res.data.email);
            setStatus("success");
            dispatch(checkAuth());
          } else {
            setStatus("failed");
            setMessage(res.data.message);
          }
        } catch (err) {
          setStatus("failed");
          setMessage(err.response?.data?.message || "This link has expired or was already used.");
        }
        return;
      }

      setStatus("failed");
      setMessage("This link looks incomplete.");
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oobCode, token, firebaseUid]);

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
              <h2 className="text-xl font-bold text-gray-900">Confirming your new email...</h2>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Updated! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your account email is now <strong>{newEmail}</strong>. Use it next time you log in.
              </p>
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't Confirm Email Change</h2>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link to="/account">
                <Button variant="outline" className="w-full">Back to My Account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConfirmEmailChangePage;
