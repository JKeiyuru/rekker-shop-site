// client/src/store/admin/brands-slice/index.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  brandList: [],
  error: null,
};

export const fetchAllAdminBrands = createAsyncThunk(
  "adminBrands/fetchAllAdminBrands",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(`${API_BASE_URL}/api/admin/brands/get`);
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const addNewBrand = createAsyncThunk(
  "adminBrands/addNewBrand",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post(`${API_BASE_URL}/api/admin/brands/add`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const editBrand = createAsyncThunk(
  "adminBrands/editBrand",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(`${API_BASE_URL}/api/admin/brands/edit/${id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      return result.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteBrand = createAsyncThunk(
  "adminBrands/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(`${API_BASE_URL}/api/admin/brands/delete/${id}`);
      return { ...result.data, id };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const adminBrandsSlice = createSlice({
  name: "adminBrands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAdminBrands.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllAdminBrands.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList = action.payload.data || [];
      })
      .addCase(fetchAllAdminBrands.rejected, (state, action) => {
        state.isLoading = false;
        state.brandList = [];
        state.error = action.payload?.message || "Failed to fetch brands";
      })
      .addCase(addNewBrand.fulfilled, (state, action) => {
        if (action.payload?.data) state.brandList.push(action.payload.data);
      })
      .addCase(editBrand.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (updated) {
          state.brandList = state.brandList.map((b) => (b._id === updated._id ? updated : b));
        }
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brandList = state.brandList.filter((b) => b._id !== action.payload.id);
      });
  },
});

export default adminBrandsSlice.reducer;
