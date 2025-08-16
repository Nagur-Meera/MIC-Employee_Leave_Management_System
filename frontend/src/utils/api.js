import axios from 'axios';

// Determine if we're using local development or production
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// Get API URL from environment variable or use default values
const apiUrl = import.meta.env.VITE_API_URL;

// Use the deployed API URL for both development and production
// This is useful when you want to develop against the live API
const useLocalBackend = false; // Set this to true only when running backend locally

const baseURL = useLocalBackend && isDevelopment
  ? 'http://localhost:5000/api'  // Only use local backend if explicitly enabled
  : apiUrl || 'https://mic-employee-leave-management-syste.vercel.app/api';  // Use deployed backend URL

console.log('API configured with baseURL:', baseURL);

const api = axios.create({
  baseURL,
  timeout: 60000, // Increased timeout to 60 seconds for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure Authorization header is set regardless of Content-Type
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    
    // Add special handling for large data payloads
    let dataSize = 'N/A';
    if (config.data) {
      if (typeof config.data === 'object') {
        // Check for file data in JSON
        if (config.data.fileData) {
          dataSize = `fileData: ~${Math.round(config.data.fileData.length / 1024)}KB`;
        } else {
          dataSize = `${JSON.stringify(config.data).length} chars`;
        }
      } else if (typeof config.data === 'string') {
        dataSize = `${config.data.length} chars`;
      }
    }
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      dataSize
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      statusText: response.statusText,
      isBlob: response.config.responseType === 'blob'
    });
    return response;
  },
  (error) => {
    // Don't try to parse blob responses when there's an error
    if (error.response && error.response.config && error.response.config.responseType === 'blob') {
      // For blob responses, read the blob as text for better error handling
      if (error.response.data instanceof Blob) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              error.response.data = JSON.parse(reader.result);
            } catch (e) {
              error.response.data = { message: reader.result };
            }
            console.log('API Error (blob):', {
              url: error.config.url,
              method: error.config.method,
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            });
            reject(error);
          };
          reader.onerror = () => reject(error);
          reader.readAsText(error.response.data);
        });
      }
    } else {
      console.log('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 