// Root index.js - Main entry point for local development
// For Vercel, the api/index.js file is used directly

// Load environment variables
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try to load config from config.env, fall back to .env if that doesn't exist
const configPath = fs.existsSync(path.resolve(__dirname, './config.env')) 
  ? './config.env' 
  : './.env';
dotenv.config({ path: configPath });

// Import the server app
const app = require('./server');

// Start the server only in local development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  });
}

// Export the app for testing purposes
module.exports = app;
