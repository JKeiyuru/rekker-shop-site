import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import AccountSettings from "@/components/shopping-view/account-settings";
import { useSelector } from "react-redux";
import { Package, MapPin, Settings } from "lucide-react";

function ShoppingAccount() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-ink text-ink-foreground">
        <div className="container mx-auto px-4 py-12">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary">My account</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Hi{user?.userName ? `, ${user.userName}` : ""}
          </h1>
          <p className="mt-2 text-sm text-ink-foreground/70">
            Track your orders and manage delivery addresses.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="rounded-full bg-secondary p-1">
            <TabsTrigger value="orders" className="rounded-full px-5">
              <Package className="mr-2 h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="address" className="rounded-full px-5">
              <MapPin className="mr-2 h-4 w-4" /> Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-5">
              <Settings className="mr-2 h-4 w-4" /> Settings
              {!user?.emailVerified && (
                <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500" />
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <ShoppingOrders />
          </TabsContent>
          <TabsContent value="address">
            <Address />
          </TabsContent>
          <TabsContent value="settings">
            <AccountSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ShoppingAccount;
