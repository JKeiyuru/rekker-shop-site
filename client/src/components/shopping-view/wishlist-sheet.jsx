/* eslint-disable react/prop-types */
// client/src/components/shopping-view/wishlist-sheet.jsx - With Guest Mode Support
import { SheetContent } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFromWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
import { HeartOff, Heart, LogIn } from "lucide-react";

function WishlistSheet({ setOpenWishlistSheet }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.shopWishlist.items || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemove = async (productId) => {
    await dispatch(removeFromWishlist({ userId: user.id, productId }));
    dispatch(fetchWishlist(user.id));
  };

  // Guest user view
  if (!isAuthenticated || !user) {
    return (
      <SheetContent side="right" className="w-[350px] sm:w-[400px]">
        <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Login to View Your Wishlist
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Save your favorite items by logging in or creating an account
          </p>
          <div className="space-y-3 w-full">
            <Button
              onClick={() => {
                setOpenWishlistSheet(false);
                navigate("/auth/login");
              }}
              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login to Continue
            </Button>
            <Button
              onClick={() => {
                setOpenWishlistSheet(false);
                navigate("/auth/register");
              }}
              variant="outline"
              className="w-full"
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
    <SheetContent side="right" className="w-[350px] sm:w-[400px]">
      <h2 className="text-xl font-bold mb-4">My Wishlist</h2>
      <ScrollArea className="h-[calc(100vh-120px)] pr-2">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">No items in wishlist.</p>
            <Button
              onClick={() => {
                setOpenWishlistSheet(false);
                navigate("/products");
              }}
              variant="outline"
              size="sm"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          wishlistItems.map((product) => (
            <div
              key={product._id}
              className="flex items-center justify-between mb-4 border-b pb-3 hover:bg-gray-50 p-2 rounded transition-colors"
            >
              <div
                onClick={() => {
                  navigate(`/products`);
                  setOpenWishlistSheet(false);
                }}
                className="cursor-pointer flex-1"
              >
                <h4 className="font-semibold text-sm hover:text-red-600 transition-colors">
                  {product.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  KES {product.salePrice || product.price}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(product._id)}
                className="hover:bg-red-50"
              >
                <HeartOff className="text-red-500 w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </ScrollArea>
    </SheetContent>
  );
}

export default WishlistSheet;