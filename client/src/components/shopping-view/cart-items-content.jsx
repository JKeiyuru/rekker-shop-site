import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      // The server sends the live stock (for bundles: how many can be made)
      const getTotalStock = Number(getCartItem?.totalStock ?? Infinity);
      const limit = getCartItem?.maxPerOrder > 0 ? Math.min(getTotalStock, getCartItem.maxPerOrder) : getTotalStock;
      if (getCartItem.quantity + 1 > limit) {
        toast({
          title: `Only ${getCartItem.quantity} available for this item`,
          variant: "destructive",
        });
        return;
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  const line = (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) * cartItem?.quantity;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
      <img
        src={cartItem?.image}
        alt={cartItem?.title}
        className="h-20 w-20 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-ink">
          {cartItem?.isBundle && <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">Bundle</span>}
          {cartItem?.title}
        </h3>
        {cartItem?.isBundle && cartItem?.bundleItems?.length > 0 && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            Includes {cartItem.bundleItems.map((b) => `${b.qty}× ${b.title}`).join(", ")}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            className="h-7 w-7 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="h-3.5 w-3.5" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="w-6 text-center text-sm font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-7 w-7 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm font-bold text-ink">KES {Number(line || 0).toLocaleString("en-KE")}</p>
        <button
          onClick={() => handleCartItemDelete(cartItem)}
          className="text-muted-foreground transition-colors hover:text-primary"
          aria-label="Remove item"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
