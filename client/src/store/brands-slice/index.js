import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  brandsList: [],
  brandsDetails: null,
};

export const fetchAllBrands = createAsyncThunk(
  "brands/fetchAllBrands",
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/shop/brands${queryParams ? `?${queryParams}` : ""}`;
    const result = await axios.get(url);
    return result.data;
  }
);

export const fetchBrandsBySlug = createAsyncThunk(
  "brands/fetchBrandsBySlug",
  async (slug) => {
    const url = `${API_BASE_URL}/api/shop/brands/${slug}`;
    const result = await axios.get(url);
    return result.data;
  }
);

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearBrandsDetails: (state) => {
      state.brandsDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBrands.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandsList = action.payload.data || [];
      })
      .addCase(fetchAllBrands.rejected, (state) => {
        state.isLoading = false;
        state.brandsList = [];
      })
      .addCase(fetchBrandsBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrandsBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandsDetails = action.payload.data;
      })
      .addCase(fetchBrandsBySlug.rejected, (state) => {
        state.isLoading = false;
        state.brandsDetails = null;
      });
  },
});

export const { clearBrandsDetails } = brandsSlice.actions;

export default brandsSlice.reducer;
