const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create a specific rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 login attempts in production, 50 in development
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT Token
const generateToken = (id) => {
  // Check if JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables!');
    // Use a fallback secret for development only
    return jwt.sign({ id }, 'mic-elms-super-secret-jwt-key-2024-fallback', {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }
  
  console.log('JWT_SECRET is available, generating token with expiry:', process.env.JWT_EXPIRE || '7d');
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Private (Admin only)
router.post('/register', [
  protect,
  authorize('admin'),
  body('employeeId').optional().trim().isLength({ min: 5 }).withMessage('If provided, employee ID must be at least 5 characters'),
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('department').isIn(['Bachelor of Education (BED)', 'Civil Engineering (CIVIL)', 'Computer Science & Engineering (CSE)', 'Artificial Intelligence Data Science & Machine Learning (AIDS & ML)', 'Information Technology & Master of Computer Applications (IT & MCA)', 'Electronics & Communication Engineering (ECE)', 'Electrical & Electronics Engineering (EEE)', 'Mechanical Engineering (MECH)']).withMessage('Invalid department'),
  body('role').isIn(['admin', 'hod', 'employee']).withMessage('Invalid role'),
  body('designation').trim().isLength({ min: 2, max: 100 }).withMessage('Designation must be between 2 and 100 characters'),
  body('qualification').trim().isLength({ min: 2, max: 200 }).withMessage('Qualification must be between 2 and 200 characters'),
  body('mobileNo').matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('dateOfBirth').isISO8601().withMessage('Please provide a valid date of birth'),
  body('dateOfJoining').optional().isISO8601().withMessage('Please provide a valid date of joining')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      employeeId,
      name,
      email,
      password,
      department,
      role,
      designation,
      qualification,
      mobileNo,
      dateOfBirth,
      dateOfJoining
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Check if employeeId exists and is already used
    if (employeeId) {
      const existingId = await User.findOne({ employeeId });
      if (existingId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID already exists'
        });
      }
    }

    // Create user with or without employeeId
    const userData = {
      name,
      email,
      password,
      department,
      role,
      designation,
      qualification,
      mobileNo,
      dateOfBirth,
      dateOfJoining: dateOfJoining || new Date()
    };

    // Add employeeId only if provided
    if (employeeId && employeeId.trim() !== '') {
      userData.employeeId = employeeId;
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  // Temporarily disable rate limiter for debugging
  // loginLimiter, 
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('Login attempt received:', { 
      email: req.body.email,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log('Attempting login for email:', email);

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', {
      id: user._id,
      name: user.name,
      role: user.role
    });

    // Check if user is active
    if (!user.isActive) {
      console.log('User account deactivated:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    console.log('Verifying password...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    console.log('Updating last login time');
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    console.log('Generating JWT token');
    const token = generateToken(user._id);

    console.log('Login successful for user:', user.email);
    
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          leaveBalance: user.leaveBalance
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          employeeId: user.employeeId,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          qualification: user.qualification,
          mobileNo: user.mobileNo,
          dateOfBirth: user.dateOfBirth,
          dateOfJoining: user.dateOfJoining,
          profilePicture: user.profilePicture,
          leaveBalance: user.leaveBalance,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router; 