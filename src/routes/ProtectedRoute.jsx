import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Redirects unauthenticated users to /login.
 */
export default function ProtectedRoute() {
  const { token, isInitialized } = useSelector((state) => state.auth);

  // No token = not logged in, go to login immediately
  if (!token) return <Navigate to="/login" replace />;

  // Token present but profile not yet loaded = show spinner
  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return <Outlet />;
}
