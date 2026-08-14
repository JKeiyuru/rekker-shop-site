// client/src/store/admin/delivery-slice/index.js
// Redux slice for admin management of delivery zones and fees

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const BASE = `${API_BASE_URL}/api/admin/delivery-locations`;

const initialState = {
  locations: [],
  isLoading: false,
  error: null,
};

export const fetchAllDeliveryLocations = createAsyncThunk(
  "adminDelivery/fetchAll",
  async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await axios.get(`${BASE}${query ? "?" + query : ""}`);
    return res.data;
  }
);

export const createDeliveryLocation = createAsyncThunk(
  "adminDelivery/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(BASE, data);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const updateDeliveryLocation = createAsyncThunk(
  "adminDelivery/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${BASE}/${id}`, data);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const deleteDeliveryLocation = createAsyncThunk(
  "adminDelivery/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${BASE}/${id}`);
      return { ...res.data, deletedId: id };
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const seedDeliveryLocations = createAsyncThunk(
  "adminDelivery/seed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE}/seed`);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

const adminDeliverySlice = createSlice({
  name: "adminDelivery",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllDeliveryLocations.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchAllDeliveryLocations.fulfilled, (state, action) => { state.isLoading = false; state.locations = action.payload.data || []; })
      .addCase(fetchAllDeliveryLocations.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(createDeliveryLocation.pending, (state) => { state.isLoading = true; })
      .addCase(createDeliveryLocation.fulfilled, (state, action) => { state.isLoading = false; if (action.payload.data) state.locations.unshift(action.payload.data); })
      .addCase(createDeliveryLocation.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(updateDeliveryLocation.pending, (state) => { state.isLoading = true; })
      .addCase(updateDeliveryLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          const idx = state.locations.findIndex((l) => l._id === action.payload.data._id);
          if (idx !== -1) state.locations[idx] = action.payload.data;
        }
      })
      .addCase(updateDeliveryLocation.rejected, (state, action) => { state.isLoading = false; state.error = action.payload?.message; })
      .addCase(deleteDeliveryLocation.fulfilled, (state, action) => { state.locations = state.locations.filter((l) => l._id !== action.payload.deletedId); })
      .addCase(deleteDeliveryLocation.rejected, (state, action) => { state.error = action.payload?.message; });
  },
});

export default adminDeliverySlice.reducer;