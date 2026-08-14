// client/src/components/auth/layout.jsx - Rekker Auth Layout
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section - Rekker Branding */}
      <div className="hidden lg:flex items-center justify-center w-1/2 px-12 bg-gradient-to-br from-red-900 via-rose-900 to-red-900">
        <div className="max-w-md space-y-6 text-center text-white">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-red-600 font-bold text-5xl">R</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight">
            Welcome to REKKER
          </h1>
          <p className="text-xl text-red-100">
            Quality Products, Trusted Brands
          </p>
          <div className="pt-8 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <p className="text-red-100">Leading manufacturer in Kenya</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <p className="text-red-100">Exclusive distributor of premium brands</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-300 rounded-full"></div>
              <p className="text-red-100">Quality guaranteed products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Auth Forms */}
      <div className="flex flex-1 items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;