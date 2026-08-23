// client/src/components/shopping-view/mobile-bottom-nav.jsx
// Persistent bottom tab bar — mobile only. The point: on a phone, Shop /
// Search / Wishlist / Cart should always be one thumb-tap away, not buried
// behind a hamburger menu. This is the standard pattern almost every real
// mobile shopping app uses, and it's the single highest-leverage change for
// "the customer shouldn't have to think about where the products are."
import { Home, LayoutGrid, Search, Heart, ShoppingBag } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function MobileBottomNav({ setOpenCartSheet, setOpenWishlistSheet }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useSelector((state) => state.shopCart);
  const wishlistItems = useSelector((state) => state.shopWishlist?.items || []);

  const cartCount = cartItems?.items?.length || 0;
  const wishlistCount = wishlistItems.length;
  const isActive = (path) => location.pathname === path;

  const tabs = [
    { id: "home", label: "Home", icon: Home, active: isActive("/"), onClick: () => navigate("/") },
    { id: "shop", label: "Shop", icon: LayoutGrid, active: isActive("/products") || location.pathname.startsWith("/brands"), onClick: () => navigate("/products") },
    { id: "search", label: "Search", icon: Search, active: isActive("/search"), onClick: () => navigate("/search") },
    { id: "wishlist", label: "Wishlist", icon: Heart, count: wishlistCount, onClick: () => setOpenWishlistSheet(true) },
    { id: "cart", label: "Cart", icon: ShoppingBag, count: cartCount, onClick: () => setOpenCartSheet(true) },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-background/95 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)] backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ id, label, icon: Icon, active, count, onClick }) => (
        <button
          key={id}
          onClick={onClick}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
            active ? "text-primary" : "text-muted-foreground"
          }`}
          aria-label={label}
        >
          <span className="relative">
            <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}

export default MobileBottomNav;
