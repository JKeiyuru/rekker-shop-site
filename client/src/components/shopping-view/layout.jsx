import { useState } from "react";
import { Outlet } from "react-router-dom";
import StoreHeader from "./header";
import StoreFooter from "./footer";
import MobileBottomNav from "./mobile-bottom-nav";
import { AnnouncementBar } from "./ad-banners";

function ShoppingLayout() {
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
      <MobileBottomNav
        setOpenCartSheet={setOpenCartSheet}
        setOpenWishlistSheet={setOpenWishlistSheet}
      />
    </div>
  );
}

export default ShoppingLayout;
