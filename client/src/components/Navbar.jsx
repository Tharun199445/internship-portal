import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userRole = user?.user_metadata?.role || 'student';
  const userName = user?.user_metadata?.name || user?.user_metadata?.company_name || user?.email || '';

  // Debug logging
  useEffect(() => {
    if (user) {
      console.log('Navbar User Object:', user);
      console.log('User Metadata:', user.user_metadata);
      console.log('Detected Role:', userRole);
    }
  }, [user, userRole]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/', { replace: true });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to={user ? (userRole === 'student' ? '/student/internships' : '/company/dashboard') : '/'}>
          <span className="logo-icon">🎓</span> InternHub
        </Link>
      </div>

      <div className="navbar-links">
        {user && userRole === 'student' && (
          <>
            <Link to="/student/internships">Browse Internships</Link>
            <Link to="/student/applications">My Applications</Link>
          </>
        )}
        {user && userRole === 'company' && (
          <>
            <Link to="/company/dashboard">My Internships</Link>
            <Link to="/company/create">Post Internship</Link>
          </>
        )}

        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <div className="user-menu">
            <span className="user-name">
              {userName}
            </span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/" className="btn btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
}
