/* eslint-disable no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "shopProducts/fetchAllFilteredProducts",
  async ({ filterParams = {}, sortParams = "price-lowtohigh" }) => {
    console.log("🔄 Redux Action - fetchAllFilteredProducts Called");
    console.log("📦 Filter Params:", filterParams);
    console.log("📦 Sort Params:", sortParams);

    // Create URLSearchParams and properly format array parameters
    const queryParams = new URLSearchParams();
    
    // Add sort parameter
    queryParams.append('sortBy', sortParams);
    
    // Add all filter parameters (brand, category, subcategory)
    Object.entries(filterParams).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        // Join array values with commas for the backend
        queryParams.append(key, value.join(','));
        console.log(`✅ Adding ${key} filter:`, value);
      }
    });

    // FIXED: Use the correct endpoint - /api/shop/products/get
    const url = `${API_BASE_URL}/api/shop/products/get?${queryParams.toString()}`;
    console.log("🌐 Making API Call to:", url);

    try {
      const result = await axios.get(url);
      console.log("✅ API Response Success - Products Found:", result.data.data.length);
      console.log("📊 Response Data:", result.data);
      
      return result.data;
    } catch (error) {
      console.error("❌ API Call Failed:", error);
      console.error("❌ Error Details:", error.response?.data || error.message);
      throw error;
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  "shopProducts/fetchProductDetails",
  async (id) => {
    console.log("🔍 Fetching Product Details for ID:", id);
    
    // FIXED: Use the correct endpoint - /api/shop/products/get/:id
    const url = `${API_BASE_URL}/api/shop/products/get/${id}`;
    console.log("🌐 Making API Call to:", url);

    try {
      const result = await axios.get(url);
      console.log("✅ Product Details Fetched Successfully");
      return result.data;
    } catch (error) {
      console.error("❌ Failed to fetch product details:", error);
      throw error;
    }
  }
);

const shoppingProductSlice = createSlice({
  name: "shopProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
    clearProductList: (state) => {
      state.productList = [];
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        console.log("⏳ fetchAllFilteredProducts - Pending");
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        console.log("✅ fetchAllFilteredProducts - Fulfilled");
        state.isLoading = false;
        state.productList = action.payload.data || [];
        console.log("📦 Products loaded in state:", state.productList.length);
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        console.log("❌ fetchAllFilteredProducts - Rejected:", action.error);
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        console.log("⏳ fetchProductDetails - Pending");
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        console.log("✅ fetchProductDetails - Fulfilled");
        state.isLoading = false;
        state.productDetails = action.payload.data;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        console.log("❌ fetchProductDetails - Rejected:", action.error);
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails, clearProductList, setLoading } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;