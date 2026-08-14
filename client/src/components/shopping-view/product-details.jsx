/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
/* eslint-disable react/prop-types */
// client/src/components/shopping-view/product-details.jsx - With Guest Mode Support
import { StarIcon, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";
import { 
  addToWishlist, 
  removeFromWishlist,
  fetchWishlist 
} from "@/store/shop/wishlist-slice";
import { useNavigate } from "react-router-dom";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const wishlistState = useSelector((state) => state.shopWishlist);
  const wishlistItems = wishlistState?.items || [];
  const { toast } = useToast();

  // Check if product is in wishlist
  const isWishlisted = wishlistItems.some(
    (item) => item._id === productDetails?._id
  );

  // Handle image display logic
  const displayedImage = selectedVariation?.image || productDetails?.image;
  const displayedTitle = selectedVariation
    ? `${productDetails?.title} (${selectedVariation.label})`
    : productDetails?.title;

  // Create array of all images for thumbnails
  const getAllImages = () => {
    if (!productDetails) return [];
    
    const images = [];
    
    // Add original image if no variation is selected, or if selected variation is different
    if (!selectedVariation || selectedVariation.image !== productDetails.image) {
      images.push({
        image: productDetails.image,
        label: "Original",
        isOriginal: true
      });
    }
    
    // Add variations
    if (productDetails.variations && productDetails.variations.length > 0) {
      productDetails.variations.forEach(variation => {
        // Don't add the currently selected variation to thumbnails
        if (!selectedVariation || variation.image !== selectedVariation.image) {
          images.push(variation);
        }
      });
    }
    
    return images;
  };

  const thumbnailImages = getAllImages();

  // Handle thumbnail click
  const handleThumbnailClick = (imageData) => {
    if (imageData.isOriginal) {
      setSelectedVariation(null);
    } else {
      setSelectedVariation(imageData);
    }
  };

  // Truncate description for preview
  const getDescriptionPreview = (description, wordLimit = 20) => {
    if (!description) return "";
    const words = description.split(" ");
    if (words.length <= wordLimit) return description;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(productId, totalStock) {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === productId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > totalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  async function handleWishlistToggle() {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist({ 
          userId: user.id, 
          productId: productDetails._id 
        }));
        toast({
          title: "Removed from wishlist",
        });
      } else {
        await dispatch(addToWishlist({ 
          userId: user.id, 
          productId: productDetails._id 
        }));
        toast({
          title: "Added to wishlist",
        });
      }

      dispatch(fetchWishlist(user.id));
    } catch (err) {
      toast({
        title: "An error occurred",
        variant: "destructive",
      });
    }
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
    setSelectedVariation(null);
    setIsDescriptionExpanded(false);
  }

  function handleAddReview() {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to write a review",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Review added successfully!" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails?._id));
    }
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) / reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 p-4 sm:p-6 lg:p-12 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] max-h-[95vh] overflow-y-auto">
        {/* Image Section */}
        <div className="relative overflow-hidden rounded-lg order-1">
          <img
            src={displayedImage}
            alt={displayedTitle}
            width={600}
            height={600}
            className="aspect-square w-full object-cover rounded-lg"
          />
          {/* Thumbnail images */}
          {thumbnailImages.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap justify-center lg:justify-start">
              {thumbnailImages.map((imageData, index) => (
                <img
                  key={index}
                  src={imageData.image}
                  alt={imageData.label}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover cursor-pointer border rounded-md transition-all duration-200 border-gray-300 hover:border-primary"
                  onClick={() => handleThumbnailClick(imageData)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col order-2 min-h-0">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight">
                {displayedTitle}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWishlistToggle}
                className={`flex-shrink-0 h-8 w-8 p-0 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {/* Price Section */}
            <div className="flex items-center justify-between">
              <p
                className={`text-lg sm:text-xl lg:text-2xl font-bold text-muted-foreground ${
                  productDetails?.salePrice > 0 ? "line-through" : ""
                }`}
              >
                KES{productDetails?.price}
              </p>
              {productDetails?.salePrice > 0 && (
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary">
                  KES{productDetails?.salePrice}
                </p>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <StarRatingComponent rating={averageReview} />
              </div>
              <span className="text-muted-foreground text-sm">
                ({averageReview.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Collapsible Description */}
          <div className="mt-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-semibold">Description</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                {isDescriptionExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="text-muted-foreground">
              {isDescriptionExpanded ? (
                <div className="text-sm leading-relaxed max-h-32 sm:max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50/50">
                  {productDetails?.description}
                </div>
              ) : (
                <p className="text-sm sm:text-base">
                  {getDescriptionPreview(productDetails?.description)}
                </p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="mb-4">
            {productDetails?.totalStock === 0 ? (
              <Button className="w-full opacity-60 cursor-not-allowed" size="lg" disabled>
                Out of Stock
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  handleAddToCart(
                    productDetails?._id,
                    productDetails?.totalStock
                  )
                }
              >
                Add to Cart
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          {/* Reviews Section */}
          <div className="flex-1 min-h-0 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold">Reviews</h2>
            
            {/* Reviews List */}
            <div className="max-h-[150px] sm:max-h-[200px] overflow-y-auto">
              <div className="space-y-4">
                {reviews && reviews.length > 0 ? (
                  reviews.map((reviewItem, index) => (
                    <div key={index} className="flex gap-3">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border flex-shrink-0">
                        <AvatarFallback className="text-xs sm:text-sm">
                          {reviewItem?.userName[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base truncate">
                            {reviewItem?.userName}
                          </h3>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <StarRatingComponent rating={reviewItem?.reviewValue} />
                        </div>
                        <p className="text-muted-foreground text-xs sm:text-sm break-words">
                          {reviewItem.reviewMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No Reviews</p>
                )}
              </div>
            </div>

            {/* Add Review Section */}
            <div className="space-y-3 pt-2">
              <Label className="text-sm sm:text-base">Write a review</Label>
              <div className="flex gap-1">
                <StarRatingComponent
                  rating={rating}
                  handleRatingChange={handleRatingChange}
                />
              </div>
              <Input
                name="reviewMsg"
                value={reviewMsg}
                onChange={(event) => setReviewMsg(event.target.value)}
                placeholder={isAuthenticated ? "Write a review..." : "Login to write a review..."}
                className="text-sm sm:text-base"
                disabled={!isAuthenticated}
              />
              <Button
                onClick={handleAddReview}
                disabled={reviewMsg.trim() === "" || !isAuthenticated}
                className="w-full sm:w-auto"
                size="sm"
              >
                {isAuthenticated ? "Submit" : "Login to Review"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;