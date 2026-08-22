/* eslint-disable react/prop-types */
// client/src/components/common/check-auth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function CheckAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useSelector((state) => state.auth);
  
  // Debug logs
  console.log('CheckAuth Debug:', {
    isAuthenticated,
    user,
    isLoading,
    pathname: location.pathname,
    userRole: user?.role
  });

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAuthPage = location.pathname.startsWith("/auth");
  const isAdminPage = location.pathname.startsWith("/admin");
  const isShopPage = location.pathname.startsWith("/shop");

  // Protected routes that require authentication (checkout, account, payment pages)
  const protectedShopRoutes = [
    "/checkout",
    "/account",
    "/payment-success"
  ];
  const isProtectedShopRoute = protectedShopRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  // Root path redirect - Default to shop home for everyone
  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={
      user?.role === "admin" ? "/admin/dashboard" : "/"
    } replace />;
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPage) {
    return <Navigate to={
      user?.role === "admin" ? "/admin/dashboard" : "/"
    } replace />;
  }

  // Protect admin routes - only admins can access
  if (isAdminPage) {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    if (user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  // Redirect admin from non-protected shop pages to dashboard
  if (isAuthenticated && user?.role === "admin" && isShopPage && !isProtectedShopRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Protect specific shop routes (checkout, account, etc.)
  if (isProtectedShopRoute && !isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Allow all other routes (including shopping pages for guests)
  return <>{children}</>;
}

export default CheckAuth;