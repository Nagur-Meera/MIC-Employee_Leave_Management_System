const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require authentication
const protect = async (req, res, next) => {
  console.log('Protect middleware called');
  console.log('Headers:', req.headers);
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? token.substring(0, 10) + '...' : 'none');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully, user id:', decoded.id);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found:', req.user ? `${req.user.name} (${req.user.role})` : 'No user found');

      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        console.log('User account is deactivated');
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      console.log('Authentication successful for user:', req.user.name);
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }
  } else {
    console.log('No authorization header or not Bearer token');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten roles array if it's nested
    const flatRoles = roles.flat();
    
    console.log('Authorize middleware called with roles:', flatRoles);
    console.log('Current user:', req.user ? `${req.user.name} (${req.user.role})` : 'No user');
    
    if (!req.user) {
      console.log('No user found in request object');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no user found'
      });
    }

    if (!flatRoles.includes(req.user.role)) {
      console.log(`User role '${req.user.role}' is not in authorized roles:`, flatRoles);
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    console.log(`Authorization successful for user: ${req.user.name} with role: ${req.user.role}`);
    next();
  };
};

// Check if user can access department-specific data
const authorizeDepartment = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user found'
    });
  }

  // Admin can access all departments
  if (req.user.role === 'admin') {
    return next();
  }

  // HOD can only access their own department
  if (req.user.role === 'hod') {
    const targetDepartment = req.params.department || req.body.department || req.query.department;
    
    if (targetDepartment && targetDepartment !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only access data from your own department'
      });
    }
  }

  next();
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth: Invalid token');
    }
  }

  next();
};

module.exports = {
  protect,
  authorize,
  authorizeDepartment,
  optionalAuth
}; 