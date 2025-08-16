// api/index.js - Special entry point for Vercel API deployment
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// Try to load config from config.env, fall back to .env if that doesn't exist
const configPath = fs.existsSync(path.resolve(__dirname, '../config.env')) 
  ? '../config.env' 
  : '../.env';
require('dotenv').config({ path: configPath });

const app = express();

// Security middleware
app.use(helmet());

// Load custom CORS middleware
const corsMiddleware = require('../middleware/cors');

// Apply custom CORS middleware first
app.use(corsMiddleware);

// Also apply the cors package as a backup
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    callback(null, true); // Allow all origins while custom middleware handles specifics
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Accept-Version', 
    'Content-Length', 
    'Content-MD5', 
    'Date', 
    'X-Api-Version'
  ]
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
console.log('Attempting MongoDB connection with URI:', 
  process.env.MONGODB_URI ? 
  `${process.env.MONGODB_URI.substring(0, 20)}...` : 
  'MONGODB_URI not found'
);

mongoose.connect(process.env.MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Connection details:', {
    uri: process.env.MONGODB_URI ? `${process.env.MONGODB_URI.substring(0, 20)}...` : 'undefined',
    env: process.env.NODE_ENV,
    mongooseVersion: mongoose.version
  });
});

// Routes
try {
  console.log('Loading routes...');
  
  // Auth routes
  console.log('Loading auth routes...');
  const authRoutes = require('../routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes loaded successfully');
  
  // User routes
  console.log('Loading user routes...');
  const userRoutes = require('../routes/users');
  app.use('/api/users', userRoutes);
  console.log('User routes loaded successfully');
  
  // Leave routes
  console.log('Loading leave routes...');
  const leaveRoutes = require('../routes/leaves');
  app.use('/api/leaves', leaveRoutes);
  console.log('Leave routes loaded successfully');
  
  // Department routes
  console.log('Loading department routes...');
  const deptRoutes = require('../routes/departments');
  app.use('/api/departments', deptRoutes);
  console.log('Department routes loaded successfully');
  
  // Dashboard routes
  console.log('Loading dashboard routes...');
  const dashboardRoutes = require('../routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('Dashboard routes loaded successfully');
  
  // Excel routes
  console.log('Loading excel routes...');
  const excelRoutes = require('../routes/excel');
  app.use('/api/excel', excelRoutes);
  console.log('Excel routes loaded successfully');
  
  console.log('All routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MIC ELMS API is running via Vercel serverless function',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: process.env.VERCEL === '1' ? 'true' : 'false'
  });
});

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MIC ELMS API',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/users',
      '/api/leaves',
      '/api/departments',
      '/api/dashboard',
      '/api/excel'
    ]
  });
});

// Root endpoint handler - important for Vercel deployment
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MIC ELMS API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    documentation: '/api'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be last
app.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// For Vercel serverless functions, we need to export a handler function
// Use a function-style export that Vercel expects
module.exports = (req, res) => {
  // This ensures that the Express app handles all requests correctly in the serverless environment
  return app(req, res);
};
