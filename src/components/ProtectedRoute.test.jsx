import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoute from '../routes/ProtectedRoute';

function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      auth: (state = preloadedState.auth) => state,
    },
    preloadedState,
  });
}

const routes = [
  { path: '/login', element: <div>Login page</div> },
  {
    element: <ProtectedRoute />,
    children: [{ path: '/dashboard', element: <div>Dashboard page</div> }],
  },
];

describe('ProtectedRoute', () => {
  it('redirige vers /login quand le token est absent', () => {
    const store = createTestStore({
      auth: { user: null, token: null, isLoading: false, error: null, isInitialized: true },
    });

    const router = createMemoryRouter(routes, {
      initialEntries: ['/dashboard'],
    });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
});
