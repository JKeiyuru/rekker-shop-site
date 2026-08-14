import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (userId) => {
  const res = await axios.get(`/api/wishlist/${userId}`);
  return res.data;
});

export const addToWishlist = createAsyncThunk('wishlist/add', async ({ userId, productId }) => {
  const res = await axios.post('/api/wishlist', { userId, productId });
  return res.data.wishlist;
});

export const removeFromWishlist = createAsyncThunk('wishlist/remove', async ({ userId, productId }) => {
  const res = await axios.post('/api/wishlist/remove', { userId, productId });
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
