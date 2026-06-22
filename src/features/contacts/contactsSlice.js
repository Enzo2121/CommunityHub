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

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/contacts/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'contacts/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/users/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const sendContactRequest = createAsyncThunk(
  'contacts/send',
  async (receiverId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/contacts/store.php', { receiver_id: receiverId }, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const acceptContactRequest = createAsyncThunk(
  'contacts/accept',
  async (contactId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/contacts/accept.php', { contact_id: contactId }, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    contacts: [],
    users: [],
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearContactStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.contacts = toArray(action.payload);
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.contacts = [];
      })

      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = toArray(action.payload);
      })
      .addCase(fetchUsers.rejected, (state) => { state.users = []; })

      .addCase(sendContactRequest.fulfilled, (state) => {
        state.success = 'Demande de contact envoyée !';
      })
      .addCase(sendContactRequest.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(acceptContactRequest.fulfilled, (state, action) => {
        state.success = 'Contact accepté !';
        const updated = action.payload?.contact || action.payload;
        if (updated?.id) {
          const idx = state.contacts.findIndex((c) => c.id === updated.id);
          if (idx !== -1) state.contacts[idx] = updated;
        }
      })
      .addCase(acceptContactRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearContactStatus } = contactsSlice.actions;
export default contactsSlice.reducer;
