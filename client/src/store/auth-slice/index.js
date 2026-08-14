// client/src/store/auth-slice/index.js
// Redux slice for authentication — includes Firebase auth and password reset.
// Key fixes:
//   1. logoutUser clears Redux state on PENDING so the UI responds immediately.
//   2. setIsLoggingOut() is called before Firebase signOut so onAuthStateChanged
//      in App.jsx knows to ignore the resulting null-user event and not call
//      checkAuth() (which would re-auth via the JWT cookie still in the browser).
//   3. syncFirebaseAuth returns the full user payload (with role) so the login
//      page can navigate admin vs regular users correctly.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { API_BASE_URL } from "@/config/config.js";
import { setIsLoggingOut } from "@/lib/logout-flag";

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  firebaseUser: null,
  authChecked: false,
  forgotPasswordStatus: "idle",
  resetPasswordStatus: "idle",
};

// Register with Firebase + Backend
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ formData, firebaseUid }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { ...formData, firebaseUid },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Login with Firebase + Backend
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ formData, firebaseUid }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { ...formData, firebaseUid },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Logout from both Firebase and Backend
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Tell App.jsx's onAuthStateChanged listener to ignore the Firebase
      // sign-out event so it doesn't call checkAuth() and re-authenticate.
      setIsLoggingOut(true);

      await signOut(auth);

      await axios.post(
        `${API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      return { success: true };
    } catch (error) {
      return { success: true, message: "Logged out (with errors)" };
    } finally {
      // Allow onAuthStateChanged to resume after Firebase has settled
      setTimeout(() => setIsLoggingOut(false), 1500);
    }
  }
);

// Verify auth status with Firebase token or JWT cookie
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (firebaseToken, { rejectWithValue }) => {
    try {
      const headers = {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      };

      if (firebaseToken) {
        headers.Authorization = `Bearer ${firebaseToken}`;
      }

      const response = await axios.get(`${API_BASE_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers,
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue({ success: false, message: "Not authenticated" });
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Sync Firebase auth with backend — used for Google sign-in
export const syncFirebaseAuth = createAsyncThunk(
  "auth/syncFirebaseAuth",
  async (firebaseUser, { rejectWithValue, dispatch }) => {
    try {
      console.log("🔄 Syncing Firebase auth for user:", firebaseUser.email);

      const idToken = await firebaseUser.getIdToken(true);

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/social-login`,
        {
          token: idToken,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          provider: "google",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      console.log("✅ Backend sync successful:", response.data);

      if (response.data?.success && response.data?.user) {
        return response.data;
      }

      // Fallback: call checkAuth to retrieve the full user record
      const authResult = await dispatch(checkAuth(idToken));
      if (authResult.payload?.success) {
        return authResult.payload;
      }

      return response.data;
    } catch (error) {
      console.error("❌ Firebase sync error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Request failed" });
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Reset failed" });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.authChecked = true;
      state.isLoading = false;
    },
    setFirebaseUser: (state, action) => {
      state.firebaseUser = action.payload;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.firebaseUser = null;
      state.authChecked = true;
      state.isLoading = false;
      state.forgotPasswordStatus = "idle";
      state.resetPasswordStatus = "idle";
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearPasswordStatus: (state) => {
      state.forgotPasswordStatus = "idle";
      state.resetPasswordStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => { state.isLoading = true; })
      .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false; })

      // Login
      .addCase(loginUser.pending, (state) => { state.isLoading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => { state.isLoading = true; })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
        state.authChecked = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.authChecked = true;
      })

      // Sync Firebase Auth
      .addCase(syncFirebaseAuth.pending, (state) => { state.isLoading = true; })
      .addCase(syncFirebaseAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.success && action.payload?.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        state.authChecked = true;
      })
      .addCase(syncFirebaseAuth.rejected, (state) => {
        state.isLoading = false;
        state.authChecked = true;
      })

      // Logout — clear state on PENDING so the UI responds immediately
      .addCase(logoutUser.pending, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.firebaseUser = null;
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.firebaseUser = null;
        state.isLoading = false;
        state.authChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.firebaseUser = null;
        state.isLoading = false;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => { state.forgotPasswordStatus = "loading"; })
      .addCase(forgotPassword.fulfilled, (state) => { state.forgotPasswordStatus = "success"; })
      .addCase(forgotPassword.rejected, (state) => { state.forgotPasswordStatus = "error"; })

      // Reset password
      .addCase(resetPassword.pending, (state) => { state.resetPasswordStatus = "loading"; })
      .addCase(resetPassword.fulfilled, (state) => { state.resetPasswordStatus = "success"; })
      .addCase(resetPassword.rejected, (state) => { state.resetPasswordStatus = "error"; });
  },
});

export const {
  setUser,
  setFirebaseUser,
  clearAuth,
  setAuthChecked,
  setLoading,
  clearPasswordStatus,
} = authSlice.actions;

export default authSlice.reducer;