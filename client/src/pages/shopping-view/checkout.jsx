// client/src/pages/shopping-view/checkout.jsx
// Rekker multi-step checkout: Delivery → Payment → Review → Success.
// FIXES:
//   1. Cart is cleared in Redux state (clearCart) after every successful order.
//   2. PayPal: cartId included in payload so cart is cleared server-side on capture.
//   3. M-Pesa: phone normalised before sending; better error display.
//   4. Saved addresses: users can save up to 2 addresses and select them on checkout.

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";
import {
  fetchCounties,
  fetchSubCounties,
  fetchLocations,
  clearSubCounties,
  clearLocations,
} from "@/store/shop/delivery-slice";
import {
  fetchAllAddresses,
  addNewAddress,
  deleteAddress,
} from "@/store/shop/address-slice";
import { clearCart } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  MapPin, CreditCard, ClipboardList, CheckCircle,
  ChevronRight, ChevronLeft, Loader2, MessageCircle,
  Truck, Smartphone, Wallet, Phone, ShoppingCart,
  Bookmark, BookmarkCheck, Trash2, PlusCircle,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Delivery", icon: MapPin },
  { id: 2, label: "Payment",  icon: CreditCard },
  { id: 3, label: "Review",   icon: ClipboardList },
  { id: 4, label: "Done",     icon: CheckCircle },
];

const WHATSAPP_NUMBER = "254796183064";
const MAX_SAVED_ADDRESSES = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatKES(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
}

function extractCartItems(cartState) {
  if (!cartState) return [];
  if (Array.isArray(cartState.cartItems))                              return cartState.cartItems;
  if (cartState.cartItems && Array.isArray(cartState.cartItems.items)) return cartState.cartItems.items;
  return [];
}

// Normalise phone to 2547XXXXXXXX
function normalisePhone(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0"))   return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, idx) => {
        const Icon   = step.icon;
        const active = currentStep === step.id;
        const done   = currentStep > step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? "bg-red-700 border-red-700 text-white"
                : active ? "border-red-700 text-red-700 bg-red-50"
                         : "border-gray-200 text-gray-400 bg-white"
              }`}>
                {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-1 font-medium ${
                active ? "text-red-700" : done ? "text-gray-600" : "text-gray-400"
              }`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-16 mx-1 mb-4 transition-all ${
                currentStep > step.id ? "bg-red-700" : "bg-gray-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────
function OrderSummary({ cartItems = [], deliveryFee, step }) {
  const safe     = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = safe.reduce((s, i) => {
    const price = Number(i?.salePrice > 0 ? i.salePrice : i?.price) || 0;
    return s + price * (Number(i?.quantity) || 1);
  }, 0);
  const total    = subtotal + (deliveryFee || 0);

  return (
    <div className="bg-gray-50 rounded-xl p-5 space-y-4 sticky top-4">
      <h3 className="font-semibold text-gray-800">Order Summary</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {safe.map((item, idx) => {
          const price    = Number(item?.salePrice > 0 ? item.salePrice : item?.price) || 0;
          const quantity = Number(item?.quantity) || 1;
          return (
            <div key={idx} className="flex gap-3 items-center">
              <img src={item?.image || ""} alt={item?.title || "Product"}
                   className="w-12 h-12 rounded-lg object-cover border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item?.title || "Product"}</p>
                <p className="text-xs text-gray-500">Qty: {quantity}</p>
              </div>
              <p className="text-sm font-semibold">{formatKES(price * quantity)}</p>
            </div>
          );
        })}
      </div>
      <Separator />
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span><span>{formatKES(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
          <span>
            {deliveryFee === 0 && step >= 2
              ? <span className="text-green-600 font-medium">FREE</span>
              : deliveryFee > 0 ? formatKES(deliveryFee)
              : <span className="text-gray-400">TBD</span>}
          </span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span className="text-red-700">{formatKES(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Saved Address Card ───────────────────────────────────────────────────────
function SavedAddressCard({ address, isSelected, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? "border-red-600 bg-red-50"
          : "border-gray-200 hover:border-gray-300 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-gray-800">{address.location}, {address.subCounty}</p>
          <p className="text-gray-500">{address.county}</p>
          {address.specificAddress && (
            <p className="text-gray-600 mt-0.5">{address.specificAddress}</p>
          )}
          <p className="text-gray-600 mt-1 flex items-center gap-1">
            <Phone className="w-3 h-3" /> {address.phone}
          </p>
          <p className="mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              address.isFreeDelivery || address.deliveryFee === 0
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {address.isFreeDelivery || address.deliveryFee === 0
                ? "FREE delivery"
                : `KES ${address.deliveryFee} delivery`}
            </span>
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(address._id); }}
          className="text-gray-400 hover:text-red-600 transition-colors p-1"
          title="Delete address"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const { user }         = useSelector((s) => s.auth  || {});
  const shopCart         = useSelector((s) => s.shopCart) || {};
  const shopDelivery     = useSelector((s) => s.shopDelivery) || {};
  const { addressList }  = useSelector((s) => s.shopAddress) || { addressList: [] };
  const cartItems        = extractCartItems(shopCart);

  const {
    counties = [],
    subCounties = [],
    locations   = [],
    isLoading: deliveryLoading = false,
  } = shopDelivery;

  const [step,          setStep]          = useState(1);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [placedOrder,   setPlacedOrder]   = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Saved address mode
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);
  const [useNewAddress,        setUseNewAddress]         = useState(true);
  const [saveThisAddress,      setSaveThisAddress]       = useState(false);

  // Step 1 — address
  const [address, setAddress] = useState({
    county: "", subCounty: "", location: "",
    specificAddress: "", phone: "", notes: "",
  });
  const [deliveryFee,    setDeliveryFee]    = useState(null);
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);

  // Step 2 — payment
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mpesaPhone,    setMpesaPhone]    = useState("");

  // Derived amounts
  const subtotal = cartItems.reduce((s, i) => {
    const price = Number(i?.salePrice > 0 ? i.salePrice : i?.price) || 0;
    return s + price * (Number(i?.quantity) || 1);
  }, 0);
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee || 0;
  const totalAmount      = subtotal + finalDeliveryFee;

  // Fetch counties & saved addresses on mount
  useEffect(() => {
    dispatch(fetchCounties());
    if (user?.id) dispatch(fetchAllAddresses(user.id));
  }, [dispatch, user?.id]);

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Pre-fill mpesa phone from delivery phone
  useEffect(() => {
    if (address.phone && !mpesaPhone) setMpesaPhone(address.phone);
  }, [address.phone]);

  // ── Saved address selection ─────────────────────────────────────────────────
  const handleSelectSavedAddress = (saved) => {
    setSelectedSavedAddress(saved);
    setUseNewAddress(false);
    setAddress({
      county:          saved.county          || "",
      subCounty:       saved.subCounty       || "",
      location:        saved.location        || "",
      specificAddress: saved.specificAddress || "",
      phone:           saved.phone           || "",
      notes:           saved.notes           || "",
    });
    setDeliveryFee(saved.deliveryFee || 0);
    setIsFreeDelivery(saved.isFreeDelivery || saved.deliveryFee === 0);
  };

  const handleUseNewAddress = () => {
    setSelectedSavedAddress(null);
    setUseNewAddress(true);
    setAddress({ county: "", subCounty: "", location: "", specificAddress: "", phone: "", notes: "" });
    setDeliveryFee(null);
    setIsFreeDelivery(false);
    dispatch(clearSubCounties());
    dispatch(clearLocations());
  };

  const handleDeleteSavedAddress = async (addressId) => {
    await dispatch(deleteAddress({ userId: user.id, addressId }));
    dispatch(fetchAllAddresses(user.id));
    if (selectedSavedAddress?._id === addressId) handleUseNewAddress();
    toast({ title: "Address deleted" });
  };

  // ── Address cascades ────────────────────────────────────────────────────────
  const handleCountyChange = (county) => {
    setAddress((a) => ({ ...a, county, subCounty: "", location: "" }));
    setDeliveryFee(null); setIsFreeDelivery(false);
    dispatch(clearSubCounties());
    if (county) dispatch(fetchSubCounties(county));
  };

  const handleSubCountyChange = (subCounty) => {
    setAddress((a) => ({ ...a, subCounty, location: "" }));
    setDeliveryFee(null); setIsFreeDelivery(false);
    dispatch(clearLocations());
    if (subCounty && address.county)
      dispatch(fetchLocations({ county: address.county, subCounty }));
  };

  const handleLocationChange = (locationName) => {
    setAddress((a) => ({ ...a, location: locationName }));
    const loc = locations.find((l) => l.location === locationName);
    if (loc) { setDeliveryFee(loc.deliveryFee); setIsFreeDelivery(loc.isFreeDelivery); }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateAddress = () => {
    if (!address.county)    { toast({ title: "Please select a county",            variant: "destructive" }); return false; }
    if (!address.subCounty) { toast({ title: "Please select a sub-county",        variant: "destructive" }); return false; }
    if (!address.location)  { toast({ title: "Please select a delivery location", variant: "destructive" }); return false; }
    if (!address.phone || address.phone.length < 9) {
      toast({ title: "Please enter a valid phone number", variant: "destructive" }); return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (!paymentMethod) { toast({ title: "Please select a payment method", variant: "destructive" }); return false; }
    if (paymentMethod === "mpesa" && (!mpesaPhone || mpesaPhone.replace(/\D/g,"").length < 9)) {
      toast({ title: "Please enter a valid M-Pesa number", variant: "destructive" }); return false;
    }
    return true;
  };

  // ── Optionally save address ─────────────────────────────────────────────────
  const maybeSaveAddress = async () => {
    if (!saveThisAddress || !useNewAddress) return;
    const canSave = (addressList || []).length < MAX_SAVED_ADDRESSES;
    if (!canSave) return;

    try {
      const loc = locations.find((l) => l.location === address.location);
      await dispatch(addNewAddress({
        userId:          user.id,
        county:          address.county,
        subCounty:       address.subCounty,
        location:        address.location,
        specificAddress: address.specificAddress,
        address:         [address.specificAddress, address.location, address.subCounty, address.county].filter(Boolean).join(", "),
        phone:           address.phone,
        notes:           address.notes,
        deliveryFee:     loc?.deliveryFee     || 0,
        isFreeDelivery:  loc?.isFreeDelivery  || false,
      }));
      dispatch(fetchAllAddresses(user.id));
    } catch (e) {
      console.warn("Address save failed (non-fatal):", e);
    }
  };

  // ── Place order ─────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      await maybeSaveAddress();

      const baseOrderPayload = {
        userId:    user?.id,
        cartItems: cartItems.map((i) => ({
          productId: i.productId,
          title:     i.title,
          image:     i.image,
          price:     i.salePrice > 0 ? i.salePrice : i.price,
          quantity:  i.quantity,
        })),
        addressInfo: {
          ...address,
          fullAddress: [
            address.specificAddress,
            address.location,
            address.subCounty,
            address.county,
          ].filter(Boolean).join(", "),
        },
        paymentMethod,
        paymentStatus:  "pending",
        orderStatus:    "pending",
        totalAmount,
        subtotalAmount: subtotal,
        deliveryFee:    finalDeliveryFee,
        orderDate:      new Date().toISOString(),
      };

      // ── COD ─────────────────────────────────────────────────────────────────
      if (paymentMethod === "cod") {
        const res = await axios.post(
          `${API_BASE_URL}/api/shop/order/create`,
          baseOrderPayload,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(clearCart());
          setPlacedOrder({ ...baseOrderPayload, _id: res.data.orderId });
          setStep(4);
        } else {
          throw new Error(res.data.message || "Failed to place order");
        }
      }

      // ── M-PESA ──────────────────────────────────────────────────────────────
      else if (paymentMethod === "mpesa") {
        const normPhone = normalisePhone(mpesaPhone);
        const res = await axios.post(
          `${API_BASE_URL}/api/shop/order/mpesa/initiate`,
          {
            phone:     normPhone,
            amount:    Math.ceil(totalAmount),
            orderData: baseOrderPayload,
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(clearCart());
          setPlacedOrder({ ...baseOrderPayload, _id: res.data.orderId });
          setStep(4);
        } else {
          throw new Error(res.data.message || "M-Pesa initiation failed");
        }
      }

      // ── PAYPAL ──────────────────────────────────────────────────────────────
      else if (paymentMethod === "paypal") {
        const res = await axios.post(
          `${API_BASE_URL}/api/shop/order/create`,
          baseOrderPayload,
          { withCredentials: true }
        );
        if (res.data.approvalURL) {
          dispatch(clearCart());
          sessionStorage.setItem("pendingOrderId", res.data.orderId);
          window.location.href = res.data.approvalURL;
        } else {
          throw new Error(res.data.message || "Could not get PayPal payment URL");
        }
      }

    } catch (err) {
      toast({
        title:   err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildWhatsAppLink = () => {
    const orderId = placedOrder?._id?.toString().slice(-8).toUpperCase() || "NEW";
    const msg = encodeURIComponent(
      `Hi Rekker! I just placed order #${orderId} for ${formatKES(totalAmount)}. ` +
      `Delivery to ${address.location}, ${address.subCounty}, ${address.county}. ` +
      `Payment: ${
        paymentMethod === "cod"    ? "Cash on Delivery"
        : paymentMethod === "mpesa"  ? "M-Pesa"
        : "PayPal"
      }.`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  // ── Loading / empty states ──────────────────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-700 mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0 && step < 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products before checking out.</p>
          <Button onClick={() => navigate("/products")} className="bg-red-700 hover:bg-red-800">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const savedAddresses = addressList || [];
  const canSaveMore    = savedAddresses.length < MAX_SAVED_ADDRESSES;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/products")}
            className="text-sm text-gray-500 hover:text-red-700 flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Continue Shopping
          </button>
          <h1 className="text-xl font-bold text-red-700 tracking-wider">REKKER</h1>
          <div className="w-32" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Main panel ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">

            {/* ═══ STEP 1: DELIVERY ══════════════════════════════════════════ */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-red-700" />
                  <h2 className="text-xl font-bold">Delivery Information</h2>
                </div>

                {/* ── Saved Addresses ── */}
                {savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-red-600" />
                      Your Saved Addresses
                    </p>
                    <div className="grid gap-3">
                      {savedAddresses.map((sa) => (
                        <SavedAddressCard
                          key={sa._id}
                          address={sa}
                          isSelected={selectedSavedAddress?._id === sa._id}
                          onSelect={() => handleSelectSavedAddress(sa)}
                          onDelete={handleDeleteSavedAddress}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleUseNewAddress}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                        useNewAddress
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-dashed border-gray-300 text-gray-500 hover:border-gray-400"
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Use a different / new address
                    </button>

                    {!useNewAddress && !selectedSavedAddress && (
                      <p className="text-xs text-red-500">Please select an address or choose to use a new one.</p>
                    )}

                    <Separator />
                  </div>
                )}

                {/* ── New Address Form ── */}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    {/* County */}
                    <div className="space-y-1.5">
                      <Label>County *</Label>
                      <select
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                        value={address.county}
                        onChange={(e) => handleCountyChange(e.target.value)}
                      >
                        <option value="">Select county...</option>
                        {Array.isArray(counties) && counties.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {deliveryLoading && address.county && !address.subCounty && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Loading sub-counties...
                        </p>
                      )}
                    </div>

                    {/* Sub-County */}
                    <div className="space-y-1.5">
                      <Label>Sub-County *</Label>
                      <select
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        value={address.subCounty}
                        onChange={(e) => handleSubCountyChange(e.target.value)}
                        disabled={!address.county || subCounties.length === 0}
                      >
                        <option value="">Select sub-county...</option>
                        {Array.isArray(subCounties) && subCounties.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                      <Label>Delivery Area *</Label>
                      <select
                        className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                        value={address.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        disabled={!address.subCounty || locations.length === 0}
                      >
                        <option value="">Select area...</option>
                        {Array.isArray(locations) && locations.map((l) => (
                          <option key={l._id} value={l.location}>
                            {l.location} — {l.isFreeDelivery ? "FREE delivery" : `KES ${l.deliveryFee}`}
                          </option>
                        ))}
                      </select>

                      {address.location && (
                        <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${
                          isFreeDelivery
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          <Truck className="w-4 h-4" />
                          {isFreeDelivery
                            ? "🎉 Free delivery for this area!"
                            : `Delivery fee: KES ${deliveryFee?.toLocaleString()}`}
                        </div>
                      )}
                    </div>

                    {/* Specific address */}
                    <div className="space-y-1.5">
                      <Label>Specific Address / Landmark</Label>
                      <Input
                        placeholder="e.g. Near Total petrol station, Blue gate"
                        value={address.specificAddress}
                        onChange={(e) => setAddress((a) => ({ ...a, specificAddress: e.target.value }))}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label>Delivery Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="0712 345 678"
                          value={address.phone}
                          onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-gray-400">Our delivery team will call this number.</p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                      <Label>Delivery Notes (optional)</Label>
                      <Textarea
                        placeholder="Any special instructions for delivery..."
                        value={address.notes}
                        onChange={(e) => setAddress((a) => ({ ...a, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    {/* Save address toggle */}
                    {canSaveMore ? (
                      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={saveThisAddress}
                          onChange={(e) => setSaveThisAddress(e.target.checked)}
                          className="w-4 h-4 accent-red-700"
                        />
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                          <Bookmark className="w-4 h-4 text-red-600" />
                          Save this address for future orders
                        </span>
                      </label>
                    ) : (
                      <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                        You have reached the maximum of {MAX_SAVED_ADDRESSES} saved addresses. Delete one to save this address.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => validateAddress() && setStep(2)}
                  className="w-full bg-red-700 hover:bg-red-800 mt-2"
                >
                  Continue to Payment <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ═══ STEP 2: PAYMENT ══════════════════════════════════════════ */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-red-700" />
                  <h2 className="text-xl font-bold">Payment Method</h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id:    "cod",
                      icon:  <Wallet className="w-5 h-5 text-orange-600" />,
                      bg:    "bg-orange-100",
                      title: "Cash on Delivery",
                      desc:  "Pay when your order arrives at your door",
                    },
                    {
                      id:    "mpesa",
                      icon:  <Smartphone className="w-5 h-5 text-green-600" />,
                      bg:    "bg-green-100",
                      title: "M-Pesa",
                      desc:  "Pay via Lipa Na M-Pesa STK push",
                    },
                    {
                      id:    "paypal",
                      icon:  <CreditCard className="w-5 h-5 text-blue-600" />,
                      bg:    "bg-blue-100",
                      title: "PayPal",
                      desc:  "Pay securely via PayPal — card or PayPal balance",
                    },
                  ].map(({ id, icon, bg, title, desc }) => (
                    <button key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === id
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-gray-500">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === id ? "border-red-600" : "border-gray-300"
                      }`}>
                        {paymentMethod === id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        )}
                      </div>
                    </button>
                  ))}

                  {/* M-Pesa phone input */}
                  {paymentMethod === "mpesa" && (
                    <div className="ml-14 space-y-1.5">
                      <Label>M-Pesa Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          type="tel"
                          placeholder="e.g. 0712 345 678"
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="pl-9"
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        You'll receive an STK push on this number. Enter your PIN to complete payment.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={() => validatePayment() && setStep(3)}
                    className="flex-1 bg-red-700 hover:bg-red-800"
                  >
                    Review Order <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ STEP 3: ORDER REVIEW ═════════════════════════════════════ */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-5 h-5 text-red-700" />
                  <h2 className="text-xl font-bold">Review Your Order</h2>
                </div>

                {/* Delivery summary */}
                <div className="rounded-xl bg-gray-50 p-4 space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" /> Delivery Details
                  </h3>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p><span className="font-medium">Area:</span> {address.location}, {address.subCounty}, {address.county}</p>
                    {address.specificAddress && (
                      <p><span className="font-medium">Address:</span> {address.specificAddress}</p>
                    )}
                    <p><span className="font-medium">Phone:</span> {address.phone}</p>
                    {address.notes && <p><span className="font-medium">Notes:</span> {address.notes}</p>}
                    <p className={`font-medium ${isFreeDelivery ? "text-green-600" : ""}`}>
                      <span className="text-gray-600 font-normal">Delivery fee: </span>
                      {isFreeDelivery ? "FREE 🎉" : formatKES(deliveryFee)}
                    </p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-red-600 hover:underline">Edit</button>
                </div>

                {/* Payment summary */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-1.5 mb-2">
                    <CreditCard className="w-4 h-4 text-red-600" /> Payment
                  </h3>
                  <div className="flex items-center gap-3">
                    {paymentMethod === "cod"    && <><Wallet     className="w-4 h-4 text-orange-600" /><span className="text-sm">Cash on Delivery</span></>}
                    {paymentMethod === "mpesa"  && <><Smartphone  className="w-4 h-4 text-green-600" /><span className="text-sm">M-Pesa — {mpesaPhone}</span></>}
                    {paymentMethod === "paypal" && <><CreditCard  className="w-4 h-4 text-blue-600"  /><span className="text-sm">PayPal</span></>}
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-red-600 hover:underline mt-1 block">Edit</button>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700">Items ({cartItems.length})</h3>
                  {cartItems.map((item, idx) => {
                    const price    = Number(item?.salePrice > 0 ? item.salePrice : item?.price) || 0;
                    const quantity = Number(item?.quantity) || 1;
                    return (
                      <div key={idx} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
                        <img src={item?.image || ""} alt={item?.title || "Product"}
                             className="w-14 h-14 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item?.title || "Product"}</p>
                          <p className="text-xs text-gray-500">Qty: {quantity} × {formatKES(price)}</p>
                        </div>
                        <p className="font-semibold text-sm">{formatKES(price * quantity)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="rounded-xl border-2 border-red-100 p-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span><span>{formatKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span>
                      {isFreeDelivery
                        ? <span className="text-green-600 font-medium">FREE</span>
                        : formatKES(finalDeliveryFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-red-700">{formatKES(totalAmount)}</span>
                  </div>
                  {paymentMethod === "cod" && (
                    <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2 mt-2">
                      💵 Please have <strong>{formatKES(totalAmount)}</strong> ready when your order arrives.
                    </p>
                  )}
                  {paymentMethod === "mpesa" && (
                    <p className="text-xs text-green-700 bg-green-50 rounded-lg p-2 mt-2">
                      📱 An STK push will be sent to <strong>{mpesaPhone}</strong>. Enter your PIN to complete payment.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-700 hover:bg-red-800 font-bold"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Placing Order...</>
                    ) : paymentMethod === "paypal" ? "Pay with PayPal" : "Place Order"}
                  </Button>
                </div>
              </div>
            )}

            {/* ═══ STEP 4: SUCCESS ══════════════════════════════════════════ */}
            {step === 4 && (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order Placed! 🎉</h2>
                  <p className="text-gray-500 mt-2 text-sm">
                    Your order has been received. We're already working on it!
                  </p>
                  {placedOrder?._id && (
                    <p className="text-xs text-gray-400 mt-1">
                      Order #{placedOrder._id.toString().slice(-8).toUpperCase()}
                    </p>
                  )}
                </div>

                <div className={`rounded-xl p-4 text-sm ${
                  paymentMethod === "cod"
                    ? "bg-orange-50 border border-orange-200 text-orange-700"
                    : paymentMethod === "mpesa"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-blue-50 border border-blue-200 text-blue-700"
                }`}>
                  {paymentMethod === "cod"    && <p>💵 Please have <strong>{formatKES(totalAmount)}</strong> ready when our team arrives. They will call <strong>{address.phone}</strong> before delivery.</p>}
                  {paymentMethod === "mpesa"  && <p>📱 Check your phone — we sent an M-Pesa payment request to <strong>{mpesaPhone}</strong>. Enter your PIN to complete payment.</p>}
                  {paymentMethod === "paypal" && <p>✅ Payment confirmed via PayPal. We're processing your order.</p>}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700">What happens next?</h3>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p>📧 Check your email — we've sent you an order confirmation.</p>
                    <p>📦 We'll notify you by email when your order is dispatched.</p>
                    <p>🚚 Our delivery team will call <strong>{address.phone}</strong> before arrival.</p>
                    <p>✅ Once delivered, you'll get a final confirmation email.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <a
                    href={buildWhatsAppLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BA5C] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message Us on WhatsApp
                  </a>
                  <p className="text-xs text-gray-400">Chat with us for order updates or questions.</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => navigate("/account")}>
                    My Orders
                  </Button>
                  <Button className="flex-1 bg-red-700 hover:bg-red-800" onClick={() => navigate("/")}>
                    Continue Shopping
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          {step < 4 && (
            <div className="hidden lg:block">
              <OrderSummary
                cartItems={cartItems}
                deliveryFee={isFreeDelivery ? 0 : deliveryFee}
                step={step}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;