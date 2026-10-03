/* eslint-disable react/prop-types */
import { useState } from "react";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Button } from "../ui/button";

function formatKES(value) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function ProductTile({ product, handleAddtoCart }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.shopWishlist?.items || []);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isWishlisted = wishlistItems.some((item) => item._id === product?._id);
  const onSale = product?.salePrice > 0;
  const soldOut = product?.totalStock === 0;
  const lowStock = product?.totalStock > 0 && product?.totalStock < 10;
  const discount = onSale && product?.price
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  // Every product now has a real, dedicated, crawlable URL (/product/:id)
  // instead of only opening inside a modal — see product-page.jsx for why
  // that matters for search visibility.
  function goToProduct() {
    navigate(`/product/${product?._id}`);
  }

  async function toggleWishlist(e) {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      toast({ title: "Login required", description: "Sign in to save favourites", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    if (isWishlisted) {
      await dispatch(removeFromWishlist({ userId: user.id, productId: product._id }));
    } else {
      await dispatch(addToWishlist({ userId: user.id, productId: product._id }));
    }
    dispatch(fetchWishlist(user.id));
  }

  return (
    <article
      onClick={goToProduct}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={product?.image || "/placeholder.svg"}
          alt={product?.title || "Rekker product"}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {soldOut ? (
            <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-foreground">Sold out</span>
          ) : discount > 0 ? (
            <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">-{discount}%</span>
          ) : null}
          {lowStock && !soldOut && (
            <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
              Only {product.totalStock} left
            </span>
          )}
        </div>

        <button
          onClick={toggleWishlist}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur transition-colors hover:bg-background"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-primary text-primary" : "text-ink"}`} />
        </button>

        {/* Mobile: always visible (touch devices don't have real :hover, so
            a hover-reveal button here just meant it was invisible on
            phones). Desktop keeps the elegant hover-reveal via lg: */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 translate-y-0 transition-all duration-300 lg:opacity-0 lg:translate-y-3 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
          <Button
            size="sm"
            className="flex-1 rounded-full"
            disabled={soldOut}
            onClick={(e) => { e.stopPropagation(); handleAddtoCart?.(product?._id, product?.totalStock); }}
          >
            <ShoppingBag className="mr-1.5 h-4 w-4" /> {soldOut ? "Sold out" : "Add to cart"}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full"
            onClick={(e) => { e.stopPropagation(); goToProduct(); }}
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {product?.brandId?.name || brandOptionsMap[product?.brand] || product?.brand}
          {(product?.categoryId?.name || product?.category) ? ` · ${product?.categoryId?.name || categoryOptionsMap[product.category] || product.category}` : ""}
        </p>
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
          {product?.title}
        </h3>
        {product?.averageReview > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {Number(product.averageReview).toFixed(1)}
          </div>
        )}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="font-display text-lg font-bold text-ink">
            {formatKES(onSale ? product.salePrice : product?.price)}
          </span>
          {onSale && (
            <span className="text-sm text-muted-foreground line-through">{formatKES(product.price)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductTile;
