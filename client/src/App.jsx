// client/src/App.jsx
// Main application component with fixed auth flow:
//   1. Admin users redirect to /admin/dashboard after login
//   2. Google sign-in for existing email/password accounts correctly updates UI
//   3. Logout immediately updates UI — no reload needed (uses logout-flag module)

import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  checkAuth,
  setFirebaseUser,
  clearAuth,
  syncFirebaseAuth,
} from "./store/auth-slice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getIsLoggingOut } from "./lib/logout-flag";

// ── UI Components ────────────────────────────────────────────────────────────
import LuxuryLoader from "./components/common/spectacular-loader";
import { Skeleton } from "@/components/ui/skeleton";

// ── Layout Components ────────────────────────────────────────────────────────
import AuthLayout from "./components/auth/layout";
import AdminLayout from "./components/admin-view/layout";
import ShoppingLayout from "./components/shopping-view/layout";

// ── Lazy-load pages ─────────────────────────────────────────────────────────
// Auth
const AuthLogin = lazy(() => import("./pages/auth/login"));
const AuthRegister = lazy(() => import("./pages/auth/register"));
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"));
const ResetPassword = lazy(() => import("./pages/auth/reset-password"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin-view/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/products"));
const AdminOrders = lazy(() => import("./pages/admin-view/orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/features"));
const AdminDelivery = lazy(() => import("./pages/admin-view/delivery-locations"));

// Shop - Public
const LuxuryHome = lazy(() => import("./pages/shopping-view/home"));
const About = lazy(() => import("./pages/shopping-view/about"));
const Services = lazy(() => import("./pages/shopping-view/services"));
const Distributors = lazy(() => import("./pages/shopping-view/distributors"));
const Contact = lazy(() => import("./pages/shopping-view/contact"));
const BrandsOverview = lazy(() => import("./pages/shopping-view/brands-overview"));
const SaffronBrand = lazy(() => import("./pages/shopping-view/brands/saffron"));
const CornellsBrand = lazy(() => import("./pages/shopping-view/brands/cornells"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/listing"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));

// Shop - Protected
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/checkout"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/account"));
const PaypalReturnPage = lazy(() => import("./pages/shopping-view/paypal-return"));
const PaypalCancelPage = lazy(() => import("./pages/shopping-view/paypal-cancel"));
const PaymentSuccessPage = lazy(() => import("./pages/shopping-view/payment-success"));

// Common
const NotFound = lazy(() => import("./pages/not-found"));
const UnauthPage = lazy(() => import("./pages/unauth-page"));

// ── Route Guards ──────────────────────────────────────────────────────────────
function CheckAuthRoute({ isAuthenticated, user, children }) {
  if (isAuthenticated && user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return children;
}

function AdminRoute({ isAuthenticated, user, children }) {
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/unauth-page" replace />;
  return children;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function LoadingFallback() {
  return <LuxuryLoader />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log("🚀 App: Setting up Firebase auth listener...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      // LOGOUT GUARD ─────────────────────────────────────────────────────────
      // When logoutUser() is dispatched it calls signOut(auth) which triggers
      // this listener with firebaseUser = null. If we don't guard here, we'll
      // call checkAuth() which will find the still-valid JWT cookie and
      // re-authenticate the user silently, so the UI stays logged-in.
      // getIsLoggingOut() returns true for ~1.5 s after signOut() is called.
      if (getIsLoggingOut()) {
        console.log("🔒 Logout in progress — skipping auth state change");
        if (mounted) setFirebaseInitialized(true);
        return;
      }

      try {
        if (firebaseUser) {
          console.log("🔥 Firebase user detected:", firebaseUser.email);

          dispatch(
            setFirebaseUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
            })
          );

          console.log("🔄 Syncing Firebase user with backend...");
          await dispatch(syncFirebaseAuth(firebaseUser));
        } else {
          console.log("🚫 No Firebase user — checking traditional auth...");
          dispatch(setFirebaseUser(null));
          await dispatch(checkAuth());
        }
      } catch (error) {
        console.error("❌ Auth verification error:", error);
        if (mounted) dispatch(clearAuth());
      } finally {
        if (mounted) setFirebaseInitialized(true);
      }
    });

    return () => {
      console.log("🧹 App: Cleaning up Firebase auth listener...");
      mounted = false;
      unsubscribe();
    };
  }, [dispatch]);

  if (!firebaseInitialized || isLoading) {
    return <LuxuryLoader />;
  }

  return (
    <div className="flex flex-col overflow-hidden bg-white">
      <ScrollToTop />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/auth"
            element={
              <CheckAuthRoute isAuthenticated={isAuthenticated} user={user}>
                <AuthLayout />
              </CheckAuthRoute>
            }
          >
            <Route path="login" element={<AuthLogin />} />
            <Route path="register" element={<AuthRegister />} />
          </Route>
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="delivery-locations" element={<AdminDelivery />} />
          </Route>

          {/* Shopping Routes — public by default */}
          <Route path="/" element={<ShoppingLayout />}>
            <Route index element={<LuxuryHome />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="contact" element={<Contact />} />
            <Route path="brands" element={<BrandsOverview />} />
            <Route path="brands/saffron" element={<SaffronBrand />} />
            <Route path="brands/cornells" element={<CornellsBrand />} />
            <Route path="products" element={<ShoppingListing />} />
            <Route path="listing" element={<Navigate to="/products" replace />} />
            <Route path="search" element={<SearchProducts />} />

            {/* Protected */}
            <Route
              path="checkout"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ShoppingCheckout />
                </ProtectedRoute>
              }
            />
            <Route
              path="account"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ShoppingAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="paypal-return"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PaypalReturnPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="payment-success"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/paypal-cancel"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <PaypalCancelPage />
              </ProtectedRoute>
            }
          />

          {/* Error pages */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;