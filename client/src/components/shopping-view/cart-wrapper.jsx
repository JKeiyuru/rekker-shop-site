/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import UserCartItemsContent from "./cart-items-content";
import { ShoppingCart, LogIn } from "lucide-react";

function UserCartWrapper({ cartItems, setOpenCartSheet }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const totalCartAmount =
    cartItems && cartItems.length > 0
      ? cartItems.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  // Guest user view
  if (!isAuthenticated || !user) {
    return (
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <ShoppingCart className="h-9 w-9 text-primary" />
          </div>
          <h3 className="font-display text-lg font-bold text-ink">
            Login to View Your Cart
          </h3>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">
            Please login or create an account to add items to your cart and checkout
          </p>
          <div className="space-y-3 w-full">
            <Button
              onClick={() => {
                setOpenCartSheet(false);
                navigate("/auth/login");
              }}
              className="w-full rounded-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Continue
            </Button>
            <Button
              onClick={() => {
                setOpenCartSheet(false);
                navigate("/auth/register");
              }}
              variant="outline"
              className="w-full rounded-full"
            >
              Create Account
            </Button>
          </div>
        </div>
      </SheetContent>
    );
  }

  // Authenticated user view
  return (
    <SheetContent className="sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Your Cart</SheetTitle>
      </SheetHeader>
      <div className="mt-8 space-y-4">
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => <UserCartItemsContent key={item.productId} cartItem={item} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button
              onClick={() => {
                setOpenCartSheet(false);
                navigate("/products");
              }}
              className="mt-4"
              variant="outline"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
      {cartItems && cartItems.length > 0 && (
        <>
          <div className="mt-8 space-y-4 border-t border-border pt-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-ink">KES {Number(totalCartAmount || 0).toLocaleString("en-KE")}</span>
            </div>
          </div>
          <Button
            onClick={() => {
              navigate("/checkout");
              setOpenCartSheet(false);
            }}
            className="mt-6 w-full rounded-full"
          >
            Checkout
          </Button>
        </>
      )}
    </SheetContent>
  );
}

export default UserCartWrapper;