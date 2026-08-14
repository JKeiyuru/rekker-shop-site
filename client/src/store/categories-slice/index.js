import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  categoriesList: [],
  categoriesDetails: null,
};

export const fetchAllCategories = createAsyncThunk(
  "categories/fetchAllCategories",
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/shop/categories${queryParams ? `?${queryParams}` : ""}`;
    const result = await axios.get(url);
    return result.data;
  }
);

export const fetchCategoriesBySlug = createAsyncThunk(
  "categories/fetchCategoriesBySlug",
  async (slug) => {
    const url = `${API_BASE_URL}/api/shop/categories/${slug}`;
    const result = await axios.get(url);
    return result.data;
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearCategoriesDetails: (state) => {
      state.categoriesDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesList = action.payload.data || [];
      })
      .addCase(fetchAllCategories.rejected, (state) => {
        state.isLoading = false;
        state.categoriesList = [];
      })
      .addCase(fetchCategoriesBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategoriesBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoriesDetails = action.payload.data;
      })
      .addCase(fetchCategoriesBySlug.rejected, (state) => {
        state.isLoading = false;
        state.categoriesDetails = null;
      });
  },
});

export const { clearCategoriesDetails } = categoriesSlice.actions;

export default categoriesSlice.reducer;
