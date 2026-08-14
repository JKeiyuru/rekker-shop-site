import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  articlesList: [],
  articlesDetails: null,
};

export const fetchAllArticles = createAsyncThunk(
  "articles/fetchAllArticles",
  async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/shop/articles${queryParams ? `?${queryParams}` : ""}`;
    const result = await axios.get(url);
    return result.data;
  }
);

export const fetchArticlesBySlug = createAsyncThunk(
  "articles/fetchArticlesBySlug",
  async (slug) => {
    const url = `${API_BASE_URL}/api/shop/articles/${slug}`;
    const result = await axios.get(url);
    return result.data;
  }
);

const articlesSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    clearArticlesDetails: (state) => {
      state.articlesDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllArticles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllArticles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articlesList = action.payload.data || [];
      })
      .addCase(fetchAllArticles.rejected, (state) => {
        state.isLoading = false;
        state.articlesList = [];
      })
      .addCase(fetchArticlesBySlug.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchArticlesBySlug.fulfilled, (state, action) => {
        state.isLoading = false;
        state.articlesDetails = action.payload.data;
      })
      .addCase(fetchArticlesBySlug.rejected, (state) => {
        state.isLoading = false;
        state.articlesDetails = null;
      });
  },
});

export const { clearArticlesDetails } = articlesSlice.actions;

export default articlesSlice.reducer;
