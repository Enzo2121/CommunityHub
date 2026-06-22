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

export const fetchSkills = createAsyncThunk(
  'skills/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await get('/skills/index.php', token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createSkill = createAsyncThunk(
  'skills/create',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await post('/skills/store.php', payload, token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState: {
    skills: [],
    isLoading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearSkillStatus(state) {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.skills = toArray(action.payload);
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.skills = [];
      })

      .addCase(createSkill.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.isLoading = false;
        const skill = action.payload?.skill || action.payload;
        if (skill && typeof skill === 'object' && skill.id) {
          state.skills.unshift(skill);
        }
        state.success = 'Compétence ajoutée avec succès !';
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSkillStatus } = skillsSlice.actions;
export default skillsSlice.reducer;
