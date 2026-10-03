// client/src/components/auth/layout.jsx - Rekker Auth Layout
import { Link, Outlet } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section - Rekker Branding */}
      <div className="relative hidden lg:flex items-center justify-center w-1/2 px-12 bg-gradient-to-br from-red-900 via-rose-900 to-red-900">
        <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
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
      <div className="relative flex flex-1 flex-col bg-white">
        {/* Always-visible way home (the hero panel with the button is hidden on phones) */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Link to="/" className="flex items-center gap-2" aria-label="Rekker home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-lg font-bold text-white">R</span>
            <span className="text-lg font-extrabold tracking-tight text-gray-900">REKKER</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;