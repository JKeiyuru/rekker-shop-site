// client/src/pages/shopping-view/paypal-return.jsx
// PayPal return page — called after user approves payment on PayPal

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import { Loader2, CheckCircle, XCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PayPalReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const paymentId = searchParams.get("paymentId");
  const payerId = searchParams.get("PayerID");
  const orderId = searchParams.get("orderId") || sessionStorage.getItem("pendingOrderId");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const hasCaptured = useRef(false);

  useEffect(() => {
    if (!paymentId || !payerId || !orderId) {
      setStatus("error");
      setErrorMsg("Missing payment information. Please try again.");
      return;
    }
    if (hasCaptured.current) return;
    hasCaptured.current = true;

    axios
      .post(
        `${API_BASE_URL}/api/shop/order/capture`,
        { paymentId, payerId, orderId },
        { withCredentials: true }
      )
      .then((res) => {
        if (res.data.success) {
          sessionStorage.removeItem("pendingOrderId");
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(res.data.message || "Payment capture failed");
        }
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err.response?.data?.message || "Something went wrong");
      });
  }, [paymentId, payerId, orderId]);

  const orderRef = orderId?.slice(-8).toUpperCase();
  const whatsapp = `https://wa.me/254796183064?text=Hi%20Rekker!%20I%20just%20completed%20PayPal%20payment%20for%20order%20%23${orderRef}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">

        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-xl font-bold">Confirming Payment...</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your PayPal payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Confirmed! 🎉</h2>
              {orderRef && <p className="text-sm text-gray-400 mt-1">Order #{orderRef}</p>}
            </div>
            <p className="text-gray-500 text-sm">
              Your PayPal payment was successful. We're now processing your order.
              Check your email for a confirmation.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5C] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Message Us on WhatsApp
            </a>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/account")}>My Orders</Button>
              <Button className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => navigate("/")}>Shop More</Button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 text-sm">{errorMsg}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>Go Back</Button>
              <Button className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => navigate("/checkout")}>
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PayPalReturnPage;