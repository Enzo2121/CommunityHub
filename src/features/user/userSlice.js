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

export const fetchMyRegistrations = createAsyncThunk(
  'user/fetchRegistrations',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/users/me/registrations.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'user/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/users/me/events.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchEarnings = createAsyncThunk(
  'user/fetchEarnings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/users/me/earnings.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const rateOrganizer = createAsyncThunk(
  'user/rateOrganizer',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/rate-organizer.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const requestWithdrawal = createAsyncThunk(
  'user/requestWithdrawal',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/users/me/withdraw.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    registrations: [],
    myEvents: [],
    earnings: null,
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearUserStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchMyRegistrations.pending, pending)
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrations = toArray(action.payload);
      })
      .addCase(fetchMyRegistrations.rejected, rejected)

      .addCase(fetchMyEvents.pending, pending)
      .addCase(fetchMyEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEvents = toArray(action.payload);
      })
      .addCase(fetchMyEvents.rejected, rejected)

      .addCase(fetchEarnings.pending, pending)
      .addCase(fetchEarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.earnings = action.payload?.earnings || action.payload || null;
      })
      .addCase(fetchEarnings.rejected, rejected)

      .addCase(rateOrganizer.pending, pending)
      .addCase(rateOrganizer.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Organisateur noté avec succès !';
      })
      .addCase(rateOrganizer.rejected, rejected)

      .addCase(requestWithdrawal.pending, pending)
      .addCase(requestWithdrawal.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Demande de paiement envoyée.';
      })
      .addCase(requestWithdrawal.rejected, rejected);
  },
});

export const { clearUserStatus } = userSlice.actions;
export default userSlice.reducer;
