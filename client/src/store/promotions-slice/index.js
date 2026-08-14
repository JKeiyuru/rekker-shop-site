import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  promotionsList: [],
  promotionsDetails: null,
};

export const fetchAllPromotions = createAsyncThunk(
  "promotions/fetchAllPromotions",
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/shop/promotions${queryParams ? `?${queryParams}` : ""}`;
    const result = await axios.get(url);
    return result.data;
  }
);

export const fetchPromotionsBySlug = createAsyncThunk(
  "promotions/fetchPromotionsBySlug",
  async (slug) => {
    const url = `${API_BASE_URL}/api/shop/promotions/${slug}`;
    const result = await axios.get(url);
    return result.data;
  }
);

const promotionsSlice = createSlice({
  name: "promotions",
  initialState,
  reducers: {
    clearPromotionsDetails: (state) => {
      state.promotionsDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPromotions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllPromotions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.promotionsList = action.payload.data || [];
      })
      .addCase(fetchAllPromotions.rejected, (state) => {
        state.isLoading = false;
        state.promotionsList = [];
      })
      .addCase(fetchPromotionsBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPromotionsBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.promotionsDetails = action.payload.data;
      })
      .addCase(fetchPromotionsBySlug.rejected, (state) => {
        state.isLoading = false;
        state.promotionsDetails = null;
      });
  },
});

export const { clearPromotionsDetails } = promotionsSlice.actions;

export default promotionsSlice.reducer;
