import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Redirects non-admin users to home page.
 * Admin is determined by user.role === 'admin' or user.is_admin === true.
 */
export default function AdminRoute() {
  const { user, token } = useSelector((state) => state.auth);

  if (!token) return <Navigate to="/login" replace />;

  const isAdmin = user?.role === 'admin' || user?.is_admin === true || user?.is_admin === 1;

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
