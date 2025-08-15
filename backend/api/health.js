// api/health.js - Special endpoint for health check
const app = require('../server');

// Export the Express app for health check
module.exports = (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MIC ELMS API health check via serverless function',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    vercel: process.env.VERCEL === '1' ? 'true' : 'false'
  });
};
