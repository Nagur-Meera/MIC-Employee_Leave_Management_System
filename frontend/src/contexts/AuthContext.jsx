import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'Found' : 'Not found');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await api.get('/auth/me');
      console.log('Auth check response:', response.data);
      setUser(response.data.data.user);
      console.log('User set successfully:', response.data.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      // Instead of logging out immediately, try to extract user data from token
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Parse the JWT token (it's in format header.payload.signature)
          const payload = token.split('.')[1];
          // The payload is base64 encoded, decode it and parse as JSON
          const decodedPayload = JSON.parse(atob(payload));
          
          console.log('Extracted token payload:', decodedPayload);
          
          // If token has user info embedded (from demo login) use that
          if (decodedPayload.user) {
            console.log('Using user data from token');
            setUser(decodedPayload.user);
          } else {
            // Only logout if we can't recover any user information
            console.log('No user data in token, logging out');
            logout(false); // Pass false to avoid redirect
          }
        } else {
          logout(false); // Pass false to avoid redirect
        }
      } catch (tokenError) {
        console.error('Error parsing token:', tokenError);
        logout(false); // Pass false to avoid redirect
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('AuthContext login called with:', email); // Debug log
    try {
      // First try regular login
      let response;
      
      try {
        console.log('Attempting regular login...');
        response = await api.post('/auth/login', { email, password });
      } catch (regularLoginError) {
        console.log('Regular login failed:', regularLoginError.message);
        
        // If the main login fails, try the fallback demo login endpoint
        if (email === 'admin@mic.edu') {
          console.log('Attempting demo login fallback...');
          try {
            response = await api.post('/demo-login', { email, password });
            console.log('Demo login successful!');
          } catch (demoLoginError) {
            console.error('Demo login also failed:', demoLoginError);
            throw demoLoginError; // Re-throw if demo login also fails
          }
        } else {
          // If not the demo user, re-throw the original error
          throw regularLoginError;
        }
      }
      
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'hod') {
        navigate('/hod/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
      
      console.log('Login successful, returning success=true'); // Debug log
      return { success: true };
    } catch (error) {
      console.log('AuthContext login error:', error); // Debug log
      let message = 'Login failed. Please try again.';
      
      if (error.response?.status === 401) {
        message = 'Invalid credentials';
      } else if (error.response?.status === 429) {
        message = 'Too many login attempts. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      console.log('Login failed, returning:', { success: false, message }); // Debug log
      // Don't set user or navigate on failed login
      // Don't show toast - let login form handle error display
      return { success: false, message };
    }
  };

  const logout = (shouldRedirect = true) => {
    console.log('Logging out, redirect:', shouldRedirect);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    
    if (shouldRedirect) {
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'hod') {
        navigate('/hod/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const userId = user.id || user._id;
      const response = await api.put(`/users/${userId}`, userData);
      setUser(response.data.data.user);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isHOD: user?.role === 'hod',
    isEmployee: user?.role === 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 