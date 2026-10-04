/* eslint-disable react/prop-types */
// client/src/components/shopping-view/deals-rail.jsx
// A horizontally scrolling strip of live bundle deals. Used on the products
// page and under the cart. Renders nothing when there are no live bundles.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Package } from "lucide-react";
import { API_BASE_URL } from "@/config/config.js";
import BundleCard from "@/components/shopping-view/bundle-card";

export default function DealsRail({ title = "Bundle deals", subtitle = "Buy together, pay less", limit = 8, className = "" }) {
  const [bundles, setBundles] = useState([]);
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/shop/bundles`).then(({ data }) => setBundles((data.data || []).slice(0, limit))).catch(() => {});
  }, [limit]);
  if (!bundles.length) return null;
  return (
    <section className={className}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink"><Package className="h-5 w-5 text-primary" /> {title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link to="/deals" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">See all <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
        {bundles.map((b) => <div key={b._id} className="w-[250px] shrink-0 snap-start sm:w-[270px]"><BundleCard bundle={b} /></div>)}
      </div>
    </section>
  );
}
