// client/src/App.jsx
// Main application component with fixed auth flow:
//   1. Admin users redirect to /admin/dashboard after login
//   2. Google sign-in for existing email/password accounts correctly updates UI
//   3. Logout immediately updates UI — no reload needed (uses logout-flag module)

import { lazy, Suspense, useEffect, useRef, useState } from "react";
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
const VerifyEmail = lazy(() => import("./pages/auth/verify-email"));
const ConfirmEmailChange = lazy(() => import("./pages/auth/confirm-email-change"));

// Admin
const AdminDashboard = lazy(() => import("./pages/admin-view/dashboard"));
const AdminProducts = lazy(() => import("./pages/admin-view/products"));
const AdminOrders = lazy(() => import("./pages/admin-view/orders"));
const AdminFeatures = lazy(() => import("./pages/admin-view/features"));
const AdminDelivery = lazy(() => import("./pages/admin-view/delivery-locations"));
const AdminMessages = lazy(() => import("./pages/admin-view/messages"));
const AdminBrands = lazy(() => import("./pages/admin-view/brands"));
const AdminCategories = lazy(() => import("./pages/admin-view/categories"));
const AdminDiscounts = lazy(() => import("./pages/admin-view/discounts"));
const AdminFaqs = lazy(() => import("./pages/admin-view/faqs"));
const AdminBundles = lazy(() => import("./pages/admin-view/bundles"));
const AdminBanners = lazy(() => import("./pages/admin-view/banners"));
const AdminWholesale = lazy(() => import("./pages/admin-view/wholesale"));
const Wholesale = lazy(() => import("./pages/shopping-view/wholesale"));
const Deals = lazy(() => import("./pages/shopping-view/deals"));

// Shop - Public
const LuxuryHome = lazy(() => import("./pages/shopping-view/home"));
const About = lazy(() => import("./pages/shopping-view/about"));
const Services = lazy(() => import("./pages/shopping-view/services"));
const Distributors = lazy(() => import("./pages/shopping-view/distributors"));
const Contact = lazy(() => import("./pages/shopping-view/contact"));
const BrandsOverview = lazy(() => import("./pages/shopping-view/brands-overview"));
const SaffronBrand = lazy(() => import("./pages/shopping-view/brands/saffron"));
const CornellsBrand = lazy(() => import("./pages/shopping-view/brands/cornells"));
const BioSaffBrand = lazy(() => import("./pages/shopping-view/brands/bio-saff"));
const ShoppingListing = lazy(() => import("./pages/shopping-view/listing"));
const SearchProducts = lazy(() => import("./pages/shopping-view/search"));
const ProductPage = lazy(() => import("./pages/shopping-view/product-page"));

// Shop - Protected
const ShoppingCartPage = lazy(() => import("./pages/shopping-view/cart"));
const ShoppingCheckout = lazy(() => import("./pages/shopping-view/checkout"));
const ShoppingAccount = lazy(() => import("./pages/shopping-view/account"));
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
  return <LuxuryLoader label="One moment" />;
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
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // Kept in sync so the onAuthStateChanged callback below (subscribed once on
  // mount) can check "are we already authenticated?" without needing
  // isAuthenticated in its dependency array (which would tear down and
  // resubscribe the Firebase listener on every auth change).
  const isAuthenticatedRef = useRef(isAuthenticated);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

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

          // Only run the Google social-login sync for actual Google sign-ins.
          // syncFirebaseAuth always posted to /api/auth/social-login with
          // provider: "google" hard-coded, so it used to fire (and could
          // fail/race) on every email+password sign-in too — email/password
          // login.jsx and register.jsx already handle their own auth state
          // directly against /api/auth/login and /api/auth/register, so
          // there's nothing for this listener to do for them.
          const providerId = firebaseUser.providerData?.[0]?.providerId;

          if (providerId === "google.com") {
            console.log("🔄 Syncing Google user with backend...");
            const synced = await dispatch(syncFirebaseAuth(firebaseUser));
            // If the Firebase<->backend sync fails (e.g. admin SDK unavailable),
            // fall back to the JWT cookie session so the user stays signed in.
            if (!syncFirebaseAuth.fulfilled.match(synced)) {
              await dispatch(checkAuth());
            }
          } else if (!isAuthenticatedRef.current) {
            // Email/password provider (or unknown) and we don't already have a
            // confirmed session — this is a page-load session restore, not a
            // fresh login/register in progress, so it's safe to verify here.
            console.log("🔄 Restoring session for email/password user...");
            await dispatch(checkAuth());
          } else {
            console.log("✅ Already authenticated — skipping redundant checkAuth()");
          }
        } else {
          console.log("🚫 No Firebase user — checking traditional auth...");
          dispatch(setFirebaseUser(null));
          if (!isAuthenticatedRef.current) {
            await dispatch(checkAuth());
          }
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

  // Only the very first auth resolution blocks the app. Subsequent auth
  // refreshes must not unmount the tree (that caused the "loads twice" flash).
  if (!firebaseInitialized) {
    return <LuxuryLoader label="Loading Rekker" />;
  }

  return (
    <div className="flex flex-col [overflow-x:clip] bg-white">
      {/* overflow-x-hidden (not overflow-hidden) — clipping vertical overflow
          here silently breaks position:sticky on the header, since ANY
          ancestor with overflow other than visible does that, even when it
          isn't the actual scrolling container. */}
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
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/confirm-email-change" element={<ConfirmEmailChange />} />

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
            <Route path="messages" element={<AdminMessages />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="delivery-locations" element={<AdminDelivery />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="bundles" element={<AdminBundles />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="wholesale" element={<AdminWholesale />} />
          </Route>

          {/* Shopping Routes — public by default */}
          <Route path="/" element={<ShoppingLayout />}>
            <Route index element={<LuxuryHome />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="distributors" element={<Distributors />} />
            <Route path="contact" element={<Contact />} />
            <Route path="wholesale" element={<Wholesale />} />
            <Route path="deals" element={<Deals />} />
            <Route path="brands" element={<BrandsOverview />} />
            <Route path="brands/saffron" element={<SaffronBrand />} />
            <Route path="brands/cornells" element={<CornellsBrand />} />
            <Route path="brands/bio-saff" element={<BioSaffBrand />} />
            <Route path="brands/biosaff" element={<Navigate to="/brands/bio-saff" replace />} />
            <Route path="products" element={<ShoppingListing />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="listing" element={<Navigate to="/products" replace />} />
            <Route path="search" element={<SearchProducts />} />

            {/* Protected */}
            <Route
              path="cart"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ShoppingCartPage />
                </ProtectedRoute>
              }
            />
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
              path="payment-success"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <PaymentSuccessPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Error pages */}
          <Route path="/unauth-page" element={<UnauthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;