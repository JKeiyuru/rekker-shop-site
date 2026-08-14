// client/src/lib/logout-flag.js
// A tiny module-level mutable flag that allows the logoutUser thunk to signal
// the onAuthStateChanged listener in App.jsx to ignore the Firebase sign-out
// event. Without this, Firebase fires a null-user event when we call signOut(),
// and onAuthStateChanged would call checkAuth() which would find the still-valid
// JWT cookie and silently re-authenticate the user — making the UI appear to
// still be logged in until a manual page reload.

let _isLoggingOut = false;

export function getIsLoggingOut() {
  return _isLoggingOut;
}

export function setIsLoggingOut(val) {
  _isLoggingOut = val;
}