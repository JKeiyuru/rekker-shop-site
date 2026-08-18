// client/src/store/admin/categories-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  categoryList: [],
  error: null,
};

export const fetchAllAdminCategories = createAsyncThunk(
  "adminCategories/fetchAllAdminCategories",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(`${API_BASE_URL}/api/admin/categories/get`);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addNewCategory = createAsyncThunk(
  "adminCategories/addNewCategory",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/api/admin/categories/add`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const editCategory = createAsyncThunk(
  "adminCategories/editCategory",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(`${API_BASE_URL}/api/admin/categories/edit/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "adminCategories/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(`${API_BASE_URL}/api/admin/categories/delete/${id}`);
      return { ...result.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminCategoriesSlice = createSlice({
  name: "adminCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdminCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAdminCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categoryList = action.payload.data || [];
      })
      .addCase(fetchAllAdminCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.categoryList = [];
        state.error = action.payload?.message || "Failed to fetch categories";
      })
      .addCase(addNewCategory.fulfilled, (state, action) => {
        if (action.payload?.data) state.categoryList.push(action.payload.data);
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.categoryList = state.categoryList.map((c) => (c._id === updated._id ? updated : c));
        }
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categoryList = state.categoryList.filter((c) => c._id !== action.payload.id);
      });
  },
});

export default adminCategoriesSlice.reducer;
