// client/src/store/shop/wishlist-slice/index.js
// FIX: all three thunks were calling relative URLs (e.g. "/api/wishlist/:id").
// In production the client (shop.rekker.co.ke) and the API (Render) live on
// different origins, so a relative URL just hits the client's own host and
// 404s — which is why "Add to wishlist" silently did nothing. Every call now
// goes through API_BASE_URL, same as every other slice in the app.
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '@/config/config.js';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/api/wishlist/${userId}`, { withCredentials: true });
  return res.data;
});

export const addToWishlist = createAsyncThunk('wishlist/add', async ({ userId, productId }) => {
  const res = await axios.post(`${API_BASE_URL}/api/wishlist`, { userId, productId }, { withCredentials: true });
  return res.data.wishlist;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async ({ userId, productId }) => {
  const res = await axios.post(`${API_BASE_URL}/api/wishlist/remove`, { userId, productId }, { withCredentials: true });
  return res.data.wishlist;
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = action.payload.products || [];
      });
  },
});

export default wishlistSlice.reducer;
