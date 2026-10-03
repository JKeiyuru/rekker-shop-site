// client/src/pages/shopping-view/deals.jsx — /deals : all live bundle deals
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Package } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import BundleCard from "@/components/shopping-view/bundle-card";
import { WideBanner } from "@/components/shopping-view/ad-banners";
import useSeo from "@/hooks/use-seo";

export default function Deals() {
  const [bundles, setBundles] = useState(null);
  useSeo?.({ title: "Bundle Deals — Save More | Rekker", description: "Buy products together and save. Bundle deals on hair care, body care and home care from Rekker, delivered across Kenya." });
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shop/bundles`).then(({ data }) => setBundles(data.data || [])).catch(() => setBundles([]));
  }, []);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-3xl font-black text-ink"><Package className="h-7 w-7 text-primary" /> Bundle deals</h1>
        <p className="mt-1 text-muted-foreground">Buy together, pay less. Limited stock on every bundle.</p>
      </div>
      <WideBanner placement="wide" className="pb-6" />
      {bundles === null ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        : bundles.length === 0 ? <p className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">No bundle deals right now — check back soon!</p>
        : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{bundles.map((b) => <BundleCard key={b._id} bundle={b} />)}</div>}
    </div>
  );
}
