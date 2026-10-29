import { useState } from "react";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import StoreHeader from "./header";
import StoreFooter from "./footer";
import MobileBottomNav from "./mobile-bottom-nav";
import { AnnouncementBar, PromoPopup } from "./ad-banners";
import Concierge from "./concierge";

function ShoppingLayout() {
  // ?promo=CODE (from the corporate-site pop-up) is kept and pre-filled in the checkout code box
  const { search } = useLocation();
  useEffect(() => {
    const code = (new URLSearchParams(search).get("promo") || "").toUpperCase();
    if (/^[A-Z0-9_-]{3,24}$/.test(code)) { try { localStorage.setItem("rk_promo_code", code); } catch { /* ignore */ } }
  }, [search]);

  // Lifted here (rather than living only inside the header) so the mobile
  // bottom nav's Wishlist/Cart tabs can open the exact same sheets the
  // header's icons open, instead of duplicating that UI.
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishlistSheet, setOpenWishlistSheet] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnnouncementBar />
      <StoreHeader
        openCartSheet={openCartSheet}
        setOpenCartSheet={setOpenCartSheet}
        openWishlistSheet={openWishlistSheet}
        setOpenWishlistSheet={setOpenWishlistSheet}
      />
      {/* pb-16 keeps content clear of the fixed mobile bottom nav */}
      <main className="flex w-full flex-1 flex-col pb-16 lg:pb-0">
        <Outlet />
      </main>
      <StoreFooter />
      <Concierge />
      <PromoPopup />
      <MobileBottomNav
        setOpenCartSheet={setOpenCartSheet}
        setOpenWishlistSheet={setOpenWishlistSheet}
      />
    </div>
  );
}

export default ShoppingLayout;
