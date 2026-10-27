import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { homePathFor, useAuth } from '../context/AuthContext';
import PageLoader from './PageLoader';

// Guards nested routes: requires login, and optionally one of the given roles.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePathFor(user)} replace />;

  return <Outlet />;
}

// For login/signup pages: logged-in users go back to the page they were sent
// away from (if any), otherwise to their role's home page.
export function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Outlet />;
  const from = location.state?.from?.pathname;
  return <Navigate to={from || homePathFor(user)} replace />;
}
