// Direct entrypoint file for Vercel
// This handles direct access to the root URL

// Redirect all requests to the API handler
module.exports = require('./api/index');
