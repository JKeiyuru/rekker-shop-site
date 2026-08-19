// Strip any trailing slash(es) so `${API_BASE_URL}/api/...` never produces a
// double slash (e.g. "https://host.com//api/..."), which 404s on Render/Express
// regardless of how VITE_API_BASE_URL is formatted in the environment.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
