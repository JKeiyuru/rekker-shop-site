import { Outlet } from "react-router-dom";
import StoreHeader from "./header";
import StoreFooter from "./footer";

function ShoppingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StoreHeader />
      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>
      <StoreFooter />
    </div>
  );
}

export default ShoppingLayout;
