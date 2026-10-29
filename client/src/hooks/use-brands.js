// client/src/hooks/use-brands.js
// Active brands from Admin → Brands, shared by the home hero, the brands page
// and the footer. One request per page load; everything else reads the cache.
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

let cache = null;
let inflight = null;

function load() {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = axios
      .get(`${API_BASE_URL}/api/shop/brands`)
      .then(({ data }) => (cache = data.data || []))
      .catch(() => [])
      .finally(() => { inflight = null; });
  }
  return inflight;
}

export default function useBrands() {
  const [state, setState] = useState({ brands: cache || [], loaded: !!cache });
  useEffect(() => {
    let alive = true;
    load().then((brands) => { if (alive) setState({ brands, loaded: true }); });
    return () => { alive = false; };
  }, []);
  return state;
}
