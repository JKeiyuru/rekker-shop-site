// src/store/admin/product-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";


const initialState = {
  isLoading: false,
  productList: [],
  error: null,
  success: false
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData, { rejectWithValue }) => {
    try {
      console.log("Redux: Sending product data:", {
        ...formData,
        variations: formData.variations?.map(v => ({
          image: v.image ? v.image.substring(0, 30) + "..." : "No image",
          label: v.label
        })) || []
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/products/add`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Redux: Add product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Redux: Add product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/products/get`
      );
      
      console.log("Redux: Fetched products:", {
        count: response.data?.data?.length || 0,
        products: response.data?.data?.map(p => ({
          id: p._id,
          title: p.title,
          variationsCount: p.variations?.length || 0
        })) || []
      });
      
      return response.data;
    } catch (error) {
      console.error("Redux: Fetch products error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      console.log("Redux: Editing product:", {
        id,
        formData: {
          ...formData,
          variations: formData.variations?.map(v => ({
            image: v.image ? v.image.substring(0, 30) + "..." : "No image",
            label: v.label,
            hasId: !!v._id
          })) || []
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/admin/products/edit/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Redux: Edit product response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Redux: Edit product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      console.log("Redux: Deleting product with ID:", id);
      
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/products/delete/${id}`
      );

      console.log("Redux: Delete product response:", response.data);
      return { ...response.data, deletedId: id };
    } catch (error) {
      console.error("Redux: Delete product error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetProductState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload?.message || "Failed to fetch products";
      })
      
      // Add New Product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
        // Optionally add the new product to the list
        if (action.payload.data) {
          state.productList.unshift(action.payload.data);
        }
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload?.message || "Failed to add product";
      })
      
      // Edit Product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.error = null;
        // Update the product in the list
        if (action.payload.data) {
          const index = state.productList.findIndex(p => p._id === action.payload.data._id);
          if (index !== -1) {
            state.productList[index] = action.payload.data;
          }
        }
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload?.message || "Failed to update product";
      })
      
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Remove the product from the list
        if (action.payload.deletedId) {
          state.productList = state.productList.filter(p => p._id !== action.payload.deletedId);
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete product";
      });
  },
});

export const { clearError, clearSuccess, resetProductState } = AdminProductsSlice.actions;
export default AdminProductsSlice.reducer;