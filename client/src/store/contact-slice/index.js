import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "@/config/config.js";

const initialState = {
  isLoading: false,
  messages: [],
  unread: 0,
};

export const fetchContactMessages = createAsyncThunk(
  "contact/fetchContactMessages",
  async ({ source = "all", status = "all" } = {}) => {
    const res = await axios.get(`${API_BASE_URL}/api/contact/messages`, {
      params: { source, status },
      withCredentials: true,
    });
    return res.data;
  }
);

export const updateContactStatus = createAsyncThunk(
  "contact/updateContactStatus",
  async ({ id, status }) => {
    const res = await axios.put(
      `${API_BASE_URL}/api/contact/messages/${id}/status`,
      { status },
      { withCredentials: true }
    );
    return res.data;
  }
);

export const deleteContactMessage = createAsyncThunk(
  "contact/deleteContactMessage",
  async (id) => {
    await axios.delete(`${API_BASE_URL}/api/contact/messages/${id}`, {
      withCredentials: true,
    });
    return id;
  }
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload?.data || [];
        state.unread = action.payload?.unread || 0;
      })
      .addCase(fetchContactMessages.rejected, (state) => {
        state.isLoading = false;
        state.messages = [];
      })
      .addCase(updateContactStatus.fulfilled, (state, action) => {
        const updated = action.payload?.data;
        if (!updated) return;
        state.messages = state.messages.map((m) => (m._id === updated._id ? updated : m));
      })
      .addCase(deleteContactMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter((m) => m._id !== action.payload);
      });
  },
});

export default contactSlice.reducer;
