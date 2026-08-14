// client/src/pages/shopping-view/paypal-cancel.jsx
// Shown when the user cancels PayPal payment

import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function PayPalCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-orange-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Cancelled</h2>
          <p className="text-gray-500 mt-2 text-sm">
            You cancelled the PayPal payment. Your cart is still saved — you can try again or
            choose a different payment method.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/cart")}>
            View Cart
          </Button>
          <Button className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => navigate("/checkout")}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PayPalCancelPage;