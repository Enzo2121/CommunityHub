import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../services/api';

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const key = Object.keys(payload).find((k) => Array.isArray(payload[k]));
    if (key) return payload[key];
  }
  return [];
}

export const fetchReceivedMessages = createAsyncThunk(
  'messages/fetchReceived',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/messages/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSentMessages = createAsyncThunk(
  'messages/fetchSent',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/messages/index.php?type=sent', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/messages/send.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    received: [],
    sent: [],
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessageStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceivedMessages.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchReceivedMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.received = toArray(action.payload);
      })
      .addCase(fetchReceivedMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.received = [];
      })

      .addCase(fetchSentMessages.fulfilled, (state, action) => {
        state.sent = toArray(action.payload);
      })
      .addCase(fetchSentMessages.rejected, (state) => { state.sent = []; })

      .addCase(sendMessage.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Message envoyé !';
        const msg = action.payload?.message || action.payload;
        if (msg && typeof msg === 'object') state.sent.unshift(msg);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessageStatus } = messagesSlice.actions;
export default messagesSlice.reducer;
