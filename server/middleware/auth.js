const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateToken(payload) {
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Generic auth middleware - Verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    const userId = payload.id;
    const email = payload.email;
    const role = payload.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token: missing user ID' });
    }
    
    req.user = {
      id: userId,
      email: email,
      role: role || 'student',
    };
    
    console.log('User authenticated:', req.user.email, 'Role:', req.user.role);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role-specific middleware
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Access denied. Required role: ${role}` });
    }
    next();
  };
}

module.exports = { generateToken, authenticate, requireRole };
