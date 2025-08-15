// This file will run in Vercel environment as a serverless function
// It imports Express app and handles incoming requests

// Import necessary packages
const express = require('express');
const app = express();

// Import the API handler
const apiHandler = require('./api');

// Use the API handler for all requests
app.use(apiHandler);

// Export the Express app
module.exports = app;
