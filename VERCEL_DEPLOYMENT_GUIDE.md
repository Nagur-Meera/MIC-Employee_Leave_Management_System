# Vercel Deployment Guide for MIC-ELMS

## Prerequisites
- A [Vercel](https://vercel.com) account (you can sign up with your GitHub account)
- Your repository pushed to GitHub (which we've just done)

## Deploying the Backend

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account

2. **Import your project**
   - Click "Add New..." → "Project"
   - Select the "MIC-Employee_Leave_Management_System" repository
   - Click "Import"

3. **Configure backend deployment**
   - Set Project Name: `mic-elms-api` (or any name you prefer)
   - Set Root Directory: `backend`
   - Framework Preset: `Other`
   - Build Command: `npm install`
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Add environment variables**
   - Click on "Environment Variables" and add the following:
     - `MONGODB_URI`: Your MongoDB connection string (from config.env)
     - `JWT_SECRET`: Your JWT secret key (from config.env)
     - `NODE_ENV`: Set to `production`
     - `CORS_ORIGIN`: Set to your frontend URL once it's deployed (we'll update this later)

5. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete

6. **Copy your backend API URL**
   - Once deployment is complete, you'll get a URL like `https://mic-elms-api.vercel.app`
   - Copy this URL for use in the frontend deployment

## Deploying the Frontend

1. **Import your project again**
   - Click "Add New..." → "Project"
   - Select the same repository "MIC-Employee_Leave_Management_System" again
   - Click "Import"

2. **Configure frontend deployment**
   - Set Project Name: `mic-elms` (or any name you prefer)
   - Set Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variables**
   - Click on "Environment Variables" and add the following:
     - `VITE_API_URL`: Set to your backend URL + `/api` (e.g., `https://mic-elms-api.vercel.app/api`)

4. **Deploy**
   - Click "Deploy"
   - Wait for the deployment to complete

5. **Update CORS settings in the backend**
   - Go to your backend project in Vercel
   - Go to "Settings" → "Environment Variables"
   - Add/update `CORS_ORIGIN` to your frontend URL (e.g., `https://mic-elms.vercel.app`)
   - Click "Save" and redeploy the backend

## Testing the Deployment

1. Open your deployed frontend URL
2. Try to log in using the admin credentials
3. Verify that you can access the dashboard and interact with the application

## Troubleshooting

If you encounter issues:

1. **CORS errors**
   - Verify that the `CORS_ORIGIN` environment variable in the backend is set correctly
   - Check browser console for specific error messages

2. **API connection issues**
   - Make sure the `VITE_API_URL` is set correctly in the frontend
   - Verify that the backend API is running by visiting `https://your-backend-url.vercel.app/api/health`

3. **Database issues**
   - Check that your MongoDB Atlas connection string is correct
   - Ensure your MongoDB Atlas cluster IP whitelist includes Vercel's IPs (or is set to allow access from anywhere)
