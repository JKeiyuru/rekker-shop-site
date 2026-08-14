// client/src/components/admin-view/sidebar.jsx
// Admin panel sidebar navigation — includes Delivery Locations management

import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    path: "/admin/products",
    icon: ShoppingBag,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ClipboardList,
  },
  {
    label: "Delivery Locations",
    path: "/admin/delivery-locations",
    icon: MapPin,
  },
];

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-gray-700">
        <h1 className="text-2xl font-black tracking-widest text-red-400">REKKER</h1>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-red-700 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} Rekker Limited</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;