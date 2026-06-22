import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../services/api';

export const upgradeToPremium = createAsyncThunk(
  'payments/premium',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/payments/premium.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPayments = createAsyncThunk(
  'payments/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/payments/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const key = Object.keys(payload).find((k) => Array.isArray(payload[k]));
    if (key) return payload[key];
  }
  return [];
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState: {
    payments: [],
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearPaymentStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(upgradeToPremium.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(upgradeToPremium.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Félicitations ! Vous êtes maintenant membre premium 🎉';
      })
      .addCase(upgradeToPremium.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = toArray(action.payload);
      });
  },
});

export const { clearPaymentStatus } = paymentsSlice.actions;
export default paymentsSlice.reducer;
