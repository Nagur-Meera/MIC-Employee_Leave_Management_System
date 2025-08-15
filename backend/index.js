// Root index.js - Main entry point for Vercel
// This file redirects all requests to the API handler

// Import the API handler
const apiHandler = require('./api/index');
  
// Export the handler directly
module.exports = apiHandler;
