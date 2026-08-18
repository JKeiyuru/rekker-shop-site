/* eslint-disable no-unused-vars */
// Rekker Shop — storefront header
import { useState, useEffect } from "react";
import {
  LogOut, Menu, ShoppingBag, UserCog, Heart, Search, LogIn, UserPlus, Truck,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { fetchCartItems } from "@/store/shop/cart-slice";
import WishlistSheet from "./wishlist-sheet";
import { useToast } from "@/components/ui/use-toast";

const mainMenuItems = [
  { id: "home", label: "Home", path: "/" },
  { id: "shop", label: "Shop All", path: "/products" },
  { id: "brands", label: "Brands", path: "/brands" },
  { id: "about", label: "About", path: "/about" },
  { id: "contact", label: "Contact", path: "/contact" },
];

function StoreHeader() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const wishlistItems = useSelector((state) => state.shopWishlist.items || []);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const [openWishlistSheet, setOpenWishlistSheet] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user?.id) dispatch(fetchCartItems(user.id));
  }, [dispatch, isAuthenticated, user?.id]);

  function requireAuth(action) {
    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Sign in to continue", variant: "destructive" });
      navigate("/auth/login");
      return;
    }
    action();
  }

  function onSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(query.trim())}`);
  }

  function closeMobileMenu() {
    setOpenMobileMenu(false);
  }

  function onMobileSearch(e) {
    e.preventDefault();
    if (!mobileQuery.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(mobileQuery.trim())}`);
    closeMobileMenu();
  }

  function goTo(path) {
    navigate(path);
    closeMobileMenu();
  }

  const cartCount = cartItems?.items?.length || 0;

  return (
    <>
      <div className="bg-ink text-ink-foreground">
        <div className="container mx-auto flex items-center justify-center gap-6 px-4 py-2 text-[11px] tracking-[0.18em] uppercase">
          <span className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-primary" /> Countrywide delivery</span>
          <span className="hidden sm:inline opacity-60">M-Pesa &amp; card checkout</span>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex h-[72px] items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold">R</span>
              <span className="font-display text-xl font-bold tracking-tight text-ink">REKKER<span className="text-primary">.</span></span>
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {mainMenuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`relative text-sm font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-ink"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <form onSubmit={onSearch} className="ml-auto hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                aria-label="Search products"
              />
            </form>

            <div className="ml-auto md:ml-0 flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => navigate("/search")} aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => requireAuth(() => setOpenWishlistSheet(true))} aria-label="Wishlist">
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{wishlistItems.length}</span>
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => requireAuth(() => setOpenCartSheet(true))} aria-label="Cart">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cartCount}</span>
                )}
              </Button>

              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2 pl-1">
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate("/auth/login")}>
                    <LogIn className="mr-1.5 h-4 w-4" /> Login
                  </Button>
                  <Button size="sm" className="rounded-full" onClick={() => navigate("/auth/register")}>
                    <UserPlus className="mr-1.5 h-4 w-4" /> Sign up
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="ml-1 h-9 w-9 cursor-pointer">
                      <AvatarFallback className="bg-ink text-ink-foreground font-semibold">
                        {user?.userName?.[0]?.toUpperCase() || "R"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Hi, {user?.userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/account")} className="cursor-pointer">
                      <UserCog className="mr-2 h-4 w-4" /> My account
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => dispatch(logoutUser())} className="cursor-pointer text-primary">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-full" aria-label="Menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="flex w-full max-w-xs flex-col">
                  <SheetHeader className="text-left">
                    <SheetTitle className="font-display text-lg font-bold text-ink">
                      REKKER<span className="text-primary">.</span>
                    </SheetTitle>
                  </SheetHeader>

                  <form onSubmit={onMobileSearch} className="mt-6 flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <input
                      value={mobileQuery}
                      onChange={(e) => setMobileQuery(e.target.value)}
                      placeholder="Search products, brands…"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      aria-label="Search products"
                    />
                  </form>

                  <nav className="mt-8 flex flex-col gap-5">
                    {mainMenuItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={closeMobileMenu}
                        className={`font-display text-lg font-semibold ${location.pathname === item.path ? "text-primary" : "text-ink hover:text-primary"}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-auto space-y-3 border-t border-border pt-6">
                    <button
                      onClick={() => {
                        requireAuth(() => setOpenWishlistSheet(true));
                        closeMobileMenu();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink hover:bg-secondary"
                    >
                      <Heart className="h-4 w-4" /> Wishlist
                      {wishlistItems.length > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                          {wishlistItems.length}
                        </span>
                      )}
                    </button>

                    {isAuthenticated ? (
                      <>
                        <button
                          onClick={() => goTo("/account")}
                          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink hover:bg-secondary"
                        >
                          <UserCog className="h-4 w-4" /> My account
                        </button>
                        <button
                          onClick={() => {
                            dispatch(logoutUser());
                            closeMobileMenu();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-primary hover:bg-secondary"
                        >
                          <LogOut className="h-4 w-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button variant="outline" className="w-full rounded-full" onClick={() => goTo("/auth/login")}>
                          <LogIn className="mr-1.5 h-4 w-4" /> Login
                        </Button>
                        <Button className="w-full rounded-full" onClick={() => goTo("/auth/register")}>
                          <UserPlus className="mr-1.5 h-4 w-4" /> Sign up
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <Sheet open={openCartSheet} onOpenChange={setOpenCartSheet}>
        <UserCartWrapper cartItems={cartItems?.items || []} setOpenCartSheet={setOpenCartSheet} />
      </Sheet>
      <Sheet open={openWishlistSheet} onOpenChange={setOpenWishlistSheet}>
        <WishlistSheet setOpenWishlistSheet={setOpenWishlistSheet} />
      </Sheet>
    </>
  );
}

export default StoreHeader;
