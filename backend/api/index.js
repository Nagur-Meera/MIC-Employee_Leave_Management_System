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

// CORS configuration
const corsOrigins = [
  process.env.CORS_ORIGIN || 'https://mic-employee-leave-management-syste.vercel.app',
  'https://mic-elms.vercel.app',
  'https://mic-elms-frontend.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  }
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/leaves', require('../routes/leaves'));
app.use('/api/departments', require('../routes/departments'));
app.use('/api/dashboard', require('../routes/dashboard'));
app.use('/api/excel', require('../routes/excel'));

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
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// For Vercel serverless functions, we need to export a handler function
module.exports = app;
