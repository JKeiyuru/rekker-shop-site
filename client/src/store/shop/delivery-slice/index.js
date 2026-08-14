// client/src/store/shop/delivery-slice/index.js
// Redux slice for fetching delivery zones from the DB (populated by admin)

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  counties: [],
  subCounties: [],
  locations: [],
  isLoading: false,
};

export const fetchCounties = createAsyncThunk("delivery/fetchCounties", async () => {
  const res = await axios.get(`${API_BASE_URL}/api/shop/delivery/counties`);
  return res.data;
});

export const fetchSubCounties = createAsyncThunk("delivery/fetchSubCounties", async (county) => {
  const res = await axios.get(`${API_BASE_URL}/api/shop/delivery/subcounties/${encodeURIComponent(county)}`);
  return res.data;
});

export const fetchLocations = createAsyncThunk(
  "delivery/fetchLocations",
  async ({ county, subCounty }) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/shop/delivery/locations/${encodeURIComponent(county)}/${encodeURIComponent(subCounty)}`
    );
    return res.data;
  }
);

const deliverySlice = createSlice({
  name: "shopDelivery",
  initialState,
  reducers: {
    clearSubCounties: (state) => { state.subCounties = []; state.locations = []; },
    clearLocations: (state) => { state.locations = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCounties.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCounties.fulfilled, (state, action) => { state.isLoading = false; state.counties = action.payload.data || []; })
      .addCase(fetchCounties.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchSubCounties.pending, (state) => { state.isLoading = true; state.subCounties = []; state.locations = []; })
      .addCase(fetchSubCounties.fulfilled, (state, action) => { state.isLoading = false; state.subCounties = action.payload.data || []; })
      .addCase(fetchSubCounties.rejected, (state) => { state.isLoading = false; })
      .addCase(fetchLocations.pending, (state) => { state.isLoading = true; state.locations = []; })
      .addCase(fetchLocations.fulfilled, (state, action) => { state.isLoading = false; state.locations = action.payload.data || []; })
      .addCase(fetchLocations.rejected, (state) => { state.isLoading = false; });
  },
});

export const { clearSubCounties, clearLocations } = deliverySlice.actions;
export default deliverySlice.reducer;