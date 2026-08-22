// client/src/pages/shopping-view/payment-success.jsx
// Paystack redirects here after checkout (success, cancel, or failure — it
// uses the same callback_url for all outcomes) with ?reference=... in the
// URL. This page calls the backend to VERIFY that reference against
// Paystack directly — never trust the redirect alone, since a customer
// could reach this URL without having actually paid.
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, MessageCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking"); // "checking" | "paid" | "failed"
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference =
      searchParams.get("reference") ||
      searchParams.get("trxref") ||
      sessionStorage.getItem("pendingOrderReference");

    if (!reference) {
      setStatus("failed");
      setMessage("We couldn&apos;t find a payment reference for this checkout.");
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/shop/paystack/verify/${reference}`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setStatus("paid");
          sessionStorage.removeItem("pendingOrderId");
          sessionStorage.removeItem("pendingOrderReference");
        } else {
          setStatus("failed");
          setMessage(res.data.message || "Payment was not completed.");
        }
      })
      .catch((err) => {
        setStatus("failed");
        setMessage(err?.response?.data?.message || "Couldn&apos;t verify your payment right now.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="p-10 max-w-md w-full text-center space-y-4">
        {status === "checking" && (
          <>
            <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto" />
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">Confirming your payment...</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-500">This only takes a moment — don&apos;t close this page.</p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle className="w-14 h-14 text-green-600 mx-auto" />
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">Payment successful! 🎉</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-500">
              We've received your payment and sent you an order confirmation email.
            </p>
            <Button className="w-full bg-red-700 hover:bg-red-800" onClick={() => navigate("/account")}>
              View My Orders
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-14 h-14 text-red-600 mx-auto" />
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">Payment not completed</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-500">{message}</p>
            <div className="flex flex-col gap-2">
              <Button className="w-full bg-red-700 hover:bg-red-800" onClick={() => navigate("/checkout")}>
                Try Again
              </Button>
              <a
                href="https://wa.me/254796183064?text=Hi%20Rekker!%20My%20payment%20didn't%20go%20through."
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-green-700 hover:underline"
              >
                <MessageCircle className="w-4 h-4" /> Message us on WhatsApp
              </a>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;
