import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [role, setRole] = useState('student');
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', company_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const userRole = user.user_metadata?.role || user.role || 'student';
      console.log('Redirecting authenticated user with role:', userRole);
      navigate(userRole === 'student' ? '/student/internships' : '/company/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      if (isLogin) {
        // Login with backend
        const endpoint = role === 'student' ? '/auth/student/login' : '/auth/company/login';
        const response = await fetch(`${apiBase}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        
        // Store token
        localStorage.setItem('auth_token', data.token);
        console.log('Login successful, role:', role);
        
        // Redirect
        setTimeout(() => {
          window.location.href = role === 'student' ? '/student/internships' : '/company/dashboard';
        }, 100);
      } else {
        // Signup with backend
        const endpoint = role === 'student' ? '/auth/student/signup' : '/auth/company/signup';
        const body = role === 'student' 
          ? { name: form.name, email: form.email, password: form.password }
          : { company_name: form.company_name, email: form.email, password: form.password };
        
        const response = await fetch(`${apiBase}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Signup failed');
        
        // Store token
        localStorage.setItem('auth_token', data.token);
        console.log('Signup successful, role:', role);
        
        // Redirect
        setTimeout(() => {
          window.location.href = role === 'student' ? '/student/internships' : '/company/dashboard';
        }, 100);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎓 InternHub</h1>
          <p>Your gateway to amazing internship opportunities</p>
        </div>

        <div className="role-toggle">
          <button
            className={`role-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => { setRole('student'); setError(''); }}
          >
            👨‍🎓 Student
          </button>
          <button
            className={`role-btn ${role === 'company' ? 'active' : ''}`}
            onClick={() => { setRole('company'); setError(''); }}
          >
            🏢 Company
          </button>
        </div>

        <div className="auth-mode">
          <button
            className={`mode-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`mode-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && role === 'student' && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" name="name" placeholder="John Doe"
                value={form.name} onChange={handleChange} required
              />
            </div>
          )}
          {!isLogin && role === 'company' && (
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text" name="company_name" placeholder="Acme Corp"
                value={form.company_name} onChange={handleChange} required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password" placeholder="Min 6 characters"
              value={form.password} onChange={handleChange} required minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
