import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  bundlesList: [],
  bundlesDetails: null,
};

export const fetchAllBundles = createAsyncThunk(
  "bundles/fetchAllBundles",
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/shop/bundles${queryParams ? `?${queryParams}` : ""}`;
    const result = await axios.get(url);
    return result.data;
  }
);

export const fetchBundlesBySlug = createAsyncThunk(
  "bundles/fetchBundlesBySlug",
  async (slug) => {
    const url = `${API_BASE_URL}/api/shop/bundles/${slug}`;
    const result = await axios.get(url);
    return result.data;
  }
);

const bundlesSlice = createSlice({
  name: "bundles",
  initialState,
  reducers: {
    clearBundlesDetails: (state) => {
      state.bundlesDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBundles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBundles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bundlesList = action.payload.data || [];
      })
      .addCase(fetchAllBundles.rejected, (state) => {
        state.isLoading = false;
        state.bundlesList = [];
      })
      .addCase(fetchBundlesBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBundlesBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bundlesDetails = action.payload.data;
      })
      .addCase(fetchBundlesBySlug.rejected, (state) => {
        state.isLoading = false;
        state.bundlesDetails = null;
      });
  },
});

export const { clearBundlesDetails } = bundlesSlice.actions;

export default bundlesSlice.reducer;
