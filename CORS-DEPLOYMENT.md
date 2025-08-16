# CORS Configuration for Vercel Deployment

This document provides guidance on resolving CORS (Cross-Origin Resource Sharing) issues when deploying the MIC-ELMS application to Vercel.

## Recent Changes

We've implemented a comprehensive CORS solution to address issues with the frontend deployed at https://mic-employee-leave-management-syste-ebon.vercel.app being unable to communicate with the backend API.

### Key Changes:

1. **Custom CORS Middleware**
   - Created a dedicated middleware (`middleware/cors.js`) to handle CORS preflight requests properly
   - Explicitly handles OPTIONS requests with appropriate status codes

2. **Enhanced Vercel Configuration**
   - Updated `vercel.json` to include proper CORS headers for serverless functions
   - Added support for preflight requests via OPTIONS method

3. **API Routes**
   - Updated API handlers to support proper CORS with credentials
   - Added additional headers and methods support

## Deployment Steps

To properly deploy with these CORS fixes:

1. **Deploy Backend**
   ```
   cd backend
   vercel --prod
   ```

2. **Verify API Endpoints**
   Test the health check endpoint to ensure the API is running properly:
   ```
   curl -I https://your-backend-url.vercel.app/api/health
   ```
   
   Check for proper CORS headers:
   ```
   curl -I -X OPTIONS -H "Origin: https://mic-employee-leave-management-syste-ebon.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        https://your-backend-url.vercel.app/api/health
   ```

3. **Test Frontend Integration**
   - Open the frontend deployment
   - Open browser dev tools (F12)
   - Check for any CORS-related errors in the Console tab
   - Try logging in to verify API communication

## Troubleshooting

If CORS issues persist:

1. **Check Backend Logs**
   - Review Vercel function logs for the backend
   - Look for CORS-related warnings or errors

2. **Verify Origins**
   - Ensure all frontend URLs are properly listed in the CORS middleware
   - Remember that protocol, domain, and port all matter for CORS

3. **Test with CURL**
   ```
   curl -v -H "Origin: https://mic-employee-leave-management-syste-ebon.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS https://your-backend-url.vercel.app/api/auth/login
   ```
   
   The response should include:
   ```
   Access-Control-Allow-Origin: https://mic-employee-leave-management-syste-ebon.vercel.app
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, ...
   Access-Control-Allow-Credentials: true
   ```

## Additional Resources

- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Express CORS middleware](https://expressjs.com/en/resources/middleware/cors.html)
