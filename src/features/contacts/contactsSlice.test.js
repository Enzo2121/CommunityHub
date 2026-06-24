import { describe, it, expect } from 'vitest';
import contactsReducer, { clearContactStatus, sendContactRequest } from './contactsSlice';

describe('contactsSlice', () => {
  const initialState = {
    contacts: [],
    users: [],
    isLoading: false,
    error: null,
    success: null,
  };

  it('clearContactStatus vide error', () => {
    const state = contactsReducer(
      { ...initialState, error: 'Une erreur' },
      clearContactStatus()
    );
    expect(state.error).toBeNull();
  });

  it('clearContactStatus vide successMessage', () => {
    const state = contactsReducer(
      { ...initialState, success: 'Un message' },
      clearContactStatus()
    );
    expect(state.success).toBeNull();
  });

  it('sendContactRequest.fulfilled met success', () => {
    const state = contactsReducer(
      initialState,
      sendContactRequest.fulfilled()
    );
    expect(state.success).toBe('Demande de contact envoyée !');
  });

  it('sendContactRequest.rejected met error', () => {
    const state = contactsReducer(
      initialState,
      sendContactRequest.rejected(null, '', 1, 'Erreur reseau')
    );
    expect(state.error).toBe('Erreur reseau');
  });
});
