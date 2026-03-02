import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Helper function to decode JWT
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state - synchronous, no async calls to avoid hanging
    console.log('🔐 AuthContext initializing...');
    
    try {
      // Check for stored token from backend auth
      const storedToken = localStorage.getItem('auth_token');
      console.log('✅ Stored token exists:', !!storedToken);
      
      if (storedToken) {
        try {
          // Decode the stored JWT token
          const decoded = decodeToken(storedToken);
          console.log('📋 Decoded token:', decoded);
          
          if (decoded) {
            // For Supabase tokens, check sub (user ID) instead of id
            const userId = decoded.id || decoded.sub;
            const email = decoded.email;
            
            if (userId && email) {
              console.log('✅ Valid token found, user:', email, 'Role:', decoded.role);
              setUser({
                id: userId,
                email: email,
                role: decoded.role || 'student',
                user_metadata: { role: decoded.role || 'student' }
              });
            } else {
              console.warn('⚠️ Token missing userId or email');
              setUser(null);
            }
          }
        } catch (decodeErr) {
          console.warn('⚠️ Could not decode token:', decodeErr.message);
          setUser(null);
        }
      } else {
        console.log('❌ No stored token found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      setUser(null);
    } finally {
      console.log('✅ Auth initialization complete');
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      localStorage.removeItem('auth_token');
      setUser(null);
      console.log('✅ Logged out');
    } catch (error) {
      console.error('❌ Logout error:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
