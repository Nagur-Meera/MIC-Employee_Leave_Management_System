// middleware/cors.js
/**
 * Enhanced CORS middleware for handling preflight requests and providing better 
 * cross-origin support, especially for Vercel deployments
 */

const corsMiddleware = (req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;

  // List of allowed origins
  const corsOrigins = [
    process.env.CORS_ORIGIN || 'https://mic-employee-leave-management-syste.vercel.app',
    'https://mic-elms.vercel.app',
    'https://mic-elms-frontend.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://mic-elms-frontend.vercel.app',
    'https://mic-employee-leave-management-system-n2buo4zih.vercel.app',
    'https://mic-employee-leave-management-syste-ebon.vercel.app'
  ];

  // Always allow local development
  if (process.env.NODE_ENV !== 'production') {
    corsOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }

  // Set CORS headers based on origin
  if (origin && (corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For production, be more strict with origins
    res.setHeader('Access-Control-Allow-Origin', corsOrigins[0]);
  }

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allow specific headers
  res.setHeader('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token, X-Api-Version');
  
  // Allow specific methods
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Received OPTIONS request from origin:', origin);
    return res.status(200).send();
  }

  // Continue to next middleware
  next();
};

module.exports = corsMiddleware;
