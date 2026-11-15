import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guards routes by role. Guests go to /login (and come back afterwards);
 * a logged-in user with the wrong role goes to their own home page.
 */
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, message: `Please log in as a ${role} to open that page.` }}
      />
    );
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'school' ? '/school' : '/matches'} replace />;
  }
  return <Outlet />;
}
