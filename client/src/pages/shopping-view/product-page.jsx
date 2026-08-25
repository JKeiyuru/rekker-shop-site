// client/src/pages/shopping-view/product-page.jsx
// A real, dedicated, crawlable URL per product: /product/:id
//
// WHY THIS FILE EXISTS: product "details" previously only existed inside a
// Dialog (modal) opened via local React state — there was NEVER a unique
// URL per product. That meant Google had nothing to index per-product: no
// way to rank this site for "saffron milan toilet cleaner" or similar,
// because there was no page that WAS that product. This page is the fix —
// every product tile now navigates here instead of just opening a modal, so
// each product gets its own indexable URL, unique title/description, and
// Product structured data (which is what lets Google show price/rating
// snippets directly in search results, and is a prerequisite for showing up
// in Google's free Shopping listings).
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Heart, Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import StarRatingComponent from "@/components/common/star-rating";
import useSeo from "@/hooks/use-seo";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addToWishlist, removeFromWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { useToast } from "@/components/ui/use-toast";
import { brandOptionsMap, categoryOptionsMap } from "@/config";

function formatKES(value) {
  return `KES ${Number(value || 0).toLocaleString("en-KE")}`;
}

function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { productDetails, isLoading } = useSelector((state) => state.shopProducts);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const wishlistItems = useSelector((state) => state.shopWishlist?.items || []);
  const { reviews } = useSelector((state) => state.shopReview);

  const [rating, setRating] = useState(0);
  const [reviewMsg, setReviewMsg] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchProductDetails(id));
    dispatch(getReviews(id));
    setSelectedImage(null);
  }, [id, dispatch]);

  const p = productDetails;
  const isWishlisted = wishlistItems.some((item) => item._id === p?._id);
  const onSale = p?.salePrice > 0;
  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.reviewValue, 0) / reviews.length
      : 0;

  const brandLabel = p ? brandOptionsMap[p.brand] || p.brand : "";
  const categoryLabel = p?.category ? categoryOptionsMap[p.category] || p.category : "";
  const displayedImage = selectedImage || p?.image;
  const galleryImages = p
    ? [p.image, ...(p.images || []), ...(p.variations || []).map((v) => v.image)].filter(Boolean)
    : [];

  // ── SEO: unique title/description/canonical + Product structured data ──
  const seoDescription = p?.description
    ? p.description.length > 155
      ? p.description.slice(0, 155).trim() + "…"
      : p.description
    : `${p?.title || "Product"} — ${brandLabel} — shop online at Rekker, delivered across Kenya.`;

  const jsonLd = p
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.title,
        image: galleryImages,
        description: p.description,
        sku: p._id,
        brand: { "@type": "Brand", name: brandLabel },
        offers: {
          "@type": "Offer",
          url: `https://shop.rekker.co.ke/product/${p._id}`,
          priceCurrency: "KES",
          price: onSale ? p.salePrice : p.price,
          availability: p.totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(averageReview > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageReview.toFixed(1),
            reviewCount: reviews.length,
          },
        }),
      }
    : null;

  useSeo({
    title: p ? `${p.title} — ${brandLabel}` : "Product",
    description: seoDescription,
    path: `/product/${id}`,
    image: p?.image,
    jsonLd,
  });

  function requireAuth(action) {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in to continue", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    action();
  }

  function handleAddToCart() {
    requireAuth(() => {
      dispatch(addToCart({ userId: user.id, productId: p._id, quantity: 1 })).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchCartItems(user.id));
          toast({ title: "Added to cart" });
        }
      });
    });
  }

  function handleWishlistToggle() {
    requireAuth(async () => {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({ userId: user.id, productId: p._id }));
      } else {
        await dispatch(addToWishlist({ userId: user.id, productId: p._id }));
      }
      dispatch(fetchWishlist(user.id));
    });
  }

  function handleAddReview() {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in to write a review", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    dispatch(
      addReview({ productId: p._id, userId: user.id, userName: user.userName, reviewMessage: reviewMsg, reviewValue: rating })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(p._id));
        toast({ title: "Review added!" });
      }
    });
  }

  if (isLoading || !p) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs — also gives Google internal-linking context */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/products" className="hover:text-ink">Shop</Link>
        {p.brand && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/products?brand=${p.brand}`} className="hover:text-ink">{brandLabel}</Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink">{p.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-secondary">
            <img src={displayedImage} alt={p.title} className="h-full w-full object-cover" />
          </div>
          {galleryImages.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {galleryImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${displayedImage === img ? "border-primary" : "border-border"}`}
                >
                  <img src={img} alt={`${p.title} view ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {brandLabel}{categoryLabel ? ` · ${categoryLabel}` : ""}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">{p.title}</h1>

          <div className="mt-2 flex items-center gap-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-sm text-muted-foreground">
              {averageReview > 0 ? `${averageReview.toFixed(1)} (${reviews.length} review${reviews.length === 1 ? "" : "s"})` : "No reviews yet"}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-2xl font-bold text-ink">{formatKES(onSale ? p.salePrice : p.price)}</span>
            {onSale && <span className="text-lg text-muted-foreground line-through">{formatKES(p.price)}</span>}
          </div>

          {p.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-base font-semibold text-ink">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button size="lg" className="flex-1 rounded-full" disabled={p.totalStock === 0} onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-4 w-4" /> {p.totalStock === 0 ? "Sold out" : "Add to cart"}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full" onClick={handleWishlistToggle} aria-label="Wishlist">
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>

          <Separator className="my-8" />

          {/* Reviews — also real, unique on-page content that helps this
              page's SEO, not just a UX nicety */}
          <div>
            <h2 className="mb-4 text-lg font-bold text-ink">Reviews</h2>
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <Avatar className="h-9 w-9 flex-shrink-0 border">
                      <AvatarFallback className="text-xs">{r?.userName?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-semibold text-ink">{r.userName}</p>
                      <StarRatingComponent rating={r.reviewValue} />
                      <p className="break-words text-sm text-muted-foreground">{r.reviewMessage}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No reviews yet — be the first!</p>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Label className="text-sm">Write a review</Label>
              <StarRatingComponent rating={rating} handleRatingChange={setRating} />
              <div className="flex gap-2">
                <Input
                  value={reviewMsg}
                  onChange={(e) => setReviewMsg(e.target.value)}
                  placeholder={isAuthenticated ? "Share your thoughts…" : "Login to write a review…"}
                  disabled={!isAuthenticated}
                />
                <Button onClick={handleAddReview} disabled={!isAuthenticated || !rating}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
