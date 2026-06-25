import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, post } from '../../services/api';

// ─── Helper : extrait toujours un tableau depuis la réponse API ───────────────
function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  // L'API peut renvoyer { data: [...] } ou { events: [...] } etc.
  if (payload && typeof payload === 'object') {
    const key = Object.keys(payload).find((k) => Array.isArray(payload[k]));
    if (key) return payload[key];
  }
  return [];
}

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const params = new URLSearchParams(filters).toString();
      const path = `/events/index.php${params ? '?' + params : ''}`;
      return await get(path, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get(`/events/show.php?id=${id}`, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/store.php', formData, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerToEvent = createAsyncThunk(
  'events/register',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/register.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const postEventMessage = createAsyncThunk(
  'events/postMessage',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/message.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const moderateEventMessage = createAsyncThunk(
  'events/moderateMessage',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/moderate-message.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/events/update.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'events/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/categories/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'events/createCategory',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/categories/store.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    events: [],
    currentEvent: null,
    categories: [],
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearEventStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.isLoading = true;  state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchEvents.pending, pending)
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = toArray(action.payload);
      })
      .addCase(fetchEvents.rejected, rejected)

      .addCase(fetchEventById.pending, (state) => { state.isLoading = true; state.currentEvent = null; })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Single event — could be wrapped in { event: {...} }
        state.currentEvent = action.payload?.event || action.payload || null;
      })
      .addCase(fetchEventById.rejected, rejected)

      .addCase(createEvent.pending, pending)
      .addCase(createEvent.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Événement créé avec succès !';
      })
      .addCase(createEvent.rejected, rejected)

      .addCase(registerToEvent.pending, pending)
      .addCase(registerToEvent.fulfilled, (state) => {
        state.isLoading = false;
        state.success = 'Inscription confirmée ! Un email vous a été envoyé.';
      })
      .addCase(registerToEvent.rejected, rejected)

      .addCase(postEventMessage.fulfilled, (state, action) => {
        if (state.currentEvent) {
          if (!state.currentEvent.messages) state.currentEvent.messages = [];
          state.currentEvent.messages.push(action.payload?.message || action.payload);
        }
      })

      .addCase(moderateEventMessage.pending, pending)
      .addCase(moderateEventMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload?.message || action.payload;
        if (state.currentEvent && updated && updated.id && Array.isArray(state.currentEvent.messages)) {
          const idx = state.currentEvent.messages.findIndex((m) => m.id === updated.id);
          if (idx !== -1) {
            state.currentEvent.messages[idx] = { ...state.currentEvent.messages[idx], ...updated };
          }
        }
      })
      .addCase(moderateEventMessage.rejected, rejected)

      .addCase(updateEvent.pending, pending)
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = 'Événement mis à jour';
        const updated = action.payload?.event || action.payload;
        if (updated && state.currentEvent && state.currentEvent.id === updated.id) {
          state.currentEvent = { ...state.currentEvent, ...updated };
        }
      })
      .addCase(updateEvent.rejected, rejected)

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = toArray(action.payload);
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        const cat = action.payload?.category || action.payload;
        if (cat) state.categories.push(cat);
        state.success = 'Catégorie créée !';
      });
  },
});

export const { clearEventStatus } = eventsSlice.actions;
export default eventsSlice.reducer;
