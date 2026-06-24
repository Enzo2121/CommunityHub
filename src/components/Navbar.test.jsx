import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import MainNavbar from '../components/layout/MainNavbar';
import authReducer from '../features/auth/authSlice';

function renderWithProviders(ui, { preloadedState = {} } = {}) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}

describe('Navbar', () => {
  it('affiche Connexion et Inscription pour un visiteur, pas Profil ni Administration', () => {
    renderWithProviders(<MainNavbar />, {
      preloadedState: { auth: { user: null, token: null, isLoading: false, error: null, isInitialized: true } },
    });

    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
    expect(screen.queryByText('Mon profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Administration')).not.toBeInTheDocument();
  });

  it('affiche Profil et Déconnexion pour un utilisateur connecte, pas Connexion', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MainNavbar />, {
      preloadedState: {
        auth: {
          user: { id: 1, pseudo: 'jean', is_premium: true },
          token: 'fake-token',
          isLoading: false,
          error: null,
          isInitialized: true,
        },
      },
    });

    await user.click(screen.getByText('jean'));

    expect(screen.getByText('Mon profil')).toBeInTheDocument();
    expect(screen.getAllByText('Déconnexion')[0]).toBeInTheDocument();
    expect(screen.queryByText('Connexion')).not.toBeInTheDocument();
  });

  it('affiche Administration pour un admin', () => {
    renderWithProviders(<MainNavbar />, {
      preloadedState: {
        auth: {
          user: { id: 1, pseudo: 'admin', is_admin: true },
          token: 'admin-token',
          isLoading: false,
          error: null,
          isInitialized: true,
        },
      },
    });

    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('au clic sur Déconnexion, le token et l utilisateur sont supprimes et on redirige vers /login', async () => {
    const user = userEvent.setup();

    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    ));

    const { store } = renderWithProviders(
      <Routes>
        <Route path="*" element={<MainNavbar />} />
      </Routes>,
      {
        preloadedState: {
          auth: {
            user: { id: 1, pseudo: 'jean' },
            token: 'fake-token',
            isLoading: false,
            error: null,
            isInitialized: true,
          },
        },
      }
    );

    await user.click(screen.getByText('jean'));
    const logoutBtn = screen.getAllByText('Déconnexion')[0];
    await user.click(logoutBtn);

    await new Promise((r) => setTimeout(r, 100));

    expect(store.getState().auth.token).toBeNull();
    expect(store.getState().auth.user).toBeNull();

    vi.unstubAllGlobals();
  });
});
