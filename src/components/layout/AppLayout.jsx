import { useEffect } from 'react';
import './layout.css';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../../features/auth/authSlice';
import MainNavbar from './MainNavbar';

export default function AppLayout() {
  const dispatch = useDispatch();
  const { token, isInitialized } = useSelector((state) => state.auth);

  // On mount, if we have a token in localStorage, restore the session
  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
    // If no token, isInitialized will be false but ProtectedRoute will just redirect to login
    // We mark initialized via the auth slice's initial state when no token
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-layout">
      <MainNavbar />
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} CommunityHub — Plateforme communautaire premium</p>
        </div>
      </footer>
    </div>
  );
}
