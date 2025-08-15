// api/index.js - Special entry point for Vercel API deployment
const app = require('../server');

// Export the Express API for Vercel serverless functions
module.exports = app;
