// Bearer-token fallback for browsers that block third-party cookies.
// The API also sets an httpOnly cookie; when that cookie is dropped (Safari,
// Chrome 3rd-party cookie blocking) this token keeps the session alive.
const KEY = "rekker_token";

export function getAuthToken() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setAuthToken(token) {
  try { token ? localStorage.setItem(KEY, token) : localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function clearAuthToken() {
  setAuthToken(null);
}

export function authHeaders() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
