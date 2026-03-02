import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role if specified
  if (role) {
    const userRole = user.user_metadata?.role || 'student';
    if (userRole !== role) {
      // Wrong role - redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // User is authenticated with correct role
  return children;
}
