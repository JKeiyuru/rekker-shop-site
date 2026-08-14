/* eslint-disable react/jsx-key */
// client/src/pages/shopping-view/listing.jsx - Fixed Filter Persistence
import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import LuxuryProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, Grid3x3, LayoutGrid, Filter, X, ShoppingBag, Package } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState("price-lowtohigh");
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [gridView, setGridView] = useState("4");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();

  const handleSort = useCallback((value) => {
    setSort(value);
  }, []);

  const handleFilter = useCallback((getSectionId, getCurrentOption) => {
    setFilters(prevFilters => {
      const cpyFilters = { ...prevFilters };
      const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

      if (indexOfCurrentSection === -1) {
        cpyFilters[getSectionId] = [getCurrentOption];
      } else {
        const indexOfCurrentOption =
          cpyFilters[getSectionId].indexOf(getCurrentOption);

        if (indexOfCurrentOption === -1) {
          cpyFilters[getSectionId].push(getCurrentOption);
        } else {
          cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
        }
      }

      sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
      return cpyFilters;
    });
  }, []);

  const handleGetProductDetails = useCallback((getCurrentProductId) => {
    dispatch(fetchProductDetails(getCurrentProductId));
  }, [dispatch]);

  const handleAddtoCart = useCallback((getCurrentProductId, getTotalStock) => {
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
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
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
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }, [isAuthenticated, user, cartItems, navigate, dispatch, toast]);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    sessionStorage.removeItem("filters");
    setSearchParams({});
  }, [setSearchParams]);

  const getActiveFilterCount = useMemo(() => {
    let count = 0;
    Object.values(filters).forEach(filterArray => {
      if (Array.isArray(filterArray)) {
        count += filterArray.length;
      }
    });
    return count;
  }, [filters]);

  // FIXED: Initialize filters ONLY ONCE on mount
  useEffect(() => {
    if (initialLoad) {
      const stored = sessionStorage.getItem("filters");
      if (stored) {
        try {
          const parsedFilters = JSON.parse(stored);
          console.log("📦 Loading filters from sessionStorage:", parsedFilters);
          setFilters(parsedFilters);
        } catch (e) {
          console.error("Error parsing stored filters:", e);
        }
      }
      setInitialLoad(false);
    }
  }, [initialLoad]);

  // Update URL params when filters change (but don't re-trigger filter loading)
  useEffect(() => {
    if (!initialLoad && filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters, setSearchParams, initialLoad]);

  // Fetch products when filters or sort changes
  useEffect(() => {
    if (!initialLoad) {
      console.log("🔄 Fetching products with filters:", filters);
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
    }
  }, [dispatch, sort, filters, initialLoad]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  const gridClasses = {
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    "5": "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Rekker Shop</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">All Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{productList?.length || 0} products available</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilter filters={filters} handleFilter={handleFilter} />
            </div>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="relative rounded-full lg:hidden">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                      {getActiveFilterCount > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {getActiveFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[310px] overflow-auto p-0">
                    <ProductFilter filters={filters} handleFilter={handleFilter} />
                  </SheetContent>
                </Sheet>

                {getActiveFilterCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="rounded-full text-primary">
                    <X className="mr-1.5 h-4 w-4" /> Clear ({getActiveFilterCount})
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-1 rounded-full border border-border p-1 md:flex">
                  <Button variant={gridView === "3" ? "secondary" : "ghost"} size="sm" onClick={() => setGridView("3")} className="h-8 w-8 rounded-full p-0" aria-label="3 column grid">
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button variant={gridView === "4" ? "secondary" : "ghost"} size="sm" onClick={() => setGridView("4")} className="h-8 w-8 rounded-full p-0" aria-label="4 column grid">
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[130px] rounded-full">
                      <ArrowUpDownIcon className="mr-2 h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                      {sortOptions.map((sortItem) => (
                        <DropdownMenuRadioItem value={sortItem.id} key={sortItem.id}>
                          {sortItem.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {getActiveFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {Object.entries(filters).map(([key, values]) =>
                  values.map((value) => (
                    <button
                      key={`${key}-${value}`}
                      onClick={() => handleFilter(key, value)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                    >
                      {value}
                      <X className="h-3 w-3" />
                    </button>
                  ))
                )}
              </div>
            )}

            {productList && productList.length > 0 ? (
              <div className={`grid ${gridClasses[gridView]} gap-5`}>
                {productList.map((productItem) => (
                  <LuxuryProductTile
                    key={productItem._id}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                  <Package className="h-9 w-9 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-ink">
                  {getActiveFilterCount > 0 ? "No products match your filters" : "No products available"}
                </h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  {getActiveFilterCount > 0
                    ? "Try adjusting your criteria or explore the full collection."
                    : "We're updating our inventory. Check back shortly."}
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  {getActiveFilterCount > 0 ? (
                    <Button onClick={clearAllFilters} className="rounded-full">
                      <X className="mr-2 h-4 w-4" /> Clear all filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/")} className="rounded-full">
                      <ShoppingBag className="mr-2 h-4 w-4" /> Browse collection
                    </Button>
                  )}
                  <Button onClick={() => navigate("/contact")} variant="outline" className="rounded-full">
                    Contact us
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;
