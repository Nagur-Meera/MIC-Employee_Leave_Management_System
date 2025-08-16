// api/demo-login.js - Special endpoint for demo login
const jwt = require('jsonwebtoken');

// Demo user data
const demoUser = {
  _id: "demo123456789",
  employeeId: "MIC2024ADMIN",
  name: "Admin Demo",
  email: "admin@mic.edu",
  role: "admin",
  department: "Computer Science & Engineering (CSE)",
  leaveBalance: {
    cl: 12,
    scl: 8,
    el: 15,
    hpl: 10,
    ccl: 7
  }
};

// Generate JWT Token with fallback secret and include user data
const generateToken = (id, userData) => {
  const secret = process.env.JWT_SECRET || 'mic-elms-super-secret-jwt-key-2024-fallback';
  return jwt.sign({ 
    id,
    user: userData // Include the user data in the token
  }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = (req, res) => {
  try {
    console.log('Demo login endpoint called');
    console.log('Request body:', req.body);
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }
    
    const { email, password } = req.body;
    
    // Check for correct demo credentials
    if (email !== 'admin@mic.edu') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    console.log('Demo login successful');
    
    // Generate demo token with user data embedded
    const token = generateToken(demoUser._id, demoUser);
    
    // Return successful response with token
    return res.json({
      success: true,
      message: 'Login successful (Demo Mode)',
      data: {
        user: demoUser,
        token
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during demo login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
