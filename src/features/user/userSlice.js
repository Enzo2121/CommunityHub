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
      const { token, user } = getState().auth;
      return await get(`/events/index.php?registered_user_id=${user.id}`, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyEvents = createAsyncThunk(
  'user/fetchEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      return await get(`/events/index.php?creator_id=${user.id}`, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const likeOrganizer = createAsyncThunk(
  'user/likeOrganizer',
  async (likedUserId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/users/like.php', { liked_user_id: likedUserId }, token);
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

      .addCase(likeOrganizer.pending, pending)
      .addCase(likeOrganizer.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Organisateur apprecie.';
      })
      .addCase(likeOrganizer.rejected, rejected);
  },
});

export const { clearUserStatus } = userSlice.actions;
export default userSlice.reducer;
