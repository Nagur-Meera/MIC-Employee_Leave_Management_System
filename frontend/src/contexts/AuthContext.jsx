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
      
      // Check if token is the demo token
      const token = localStorage.getItem('token');
      const isDemoToken = token && token.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8');
      
      if (isDemoToken) {
        console.log('Demo token detected, using mock user');
        
        // Create a mock user object for the demo
        const mockUser = {
          id: "demo123456789",
          employeeId: "MIC2025ADMIN",
          name: "Admin Demo",
          email: "admin@mic.edu",
          role: "admin",
          department: "Computer Science & Engineering (CSE)",
          leaveBalance: {
            cl: 12,
            scl: 8,
            el: 15,
            hpl: 10,
            ccl: 7
          }
        };
        
        setUser(mockUser);
        console.log('Demo user set successfully:', mockUser);
      } else {
        // Regular auth check
        const response = await api.get('/auth/me');
        console.log('Auth check response:', response.data);
        setUser(response.data.data.user);
        console.log('User set successfully:', response.data.data.user);
      }
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
      logout();
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('AuthContext login called with:', email); // Debug log
    try {
      // HARDCODED DEMO LOGIN FOR ADMIN@MIC.EDU
      if (email === 'admin@mic.edu') {
        console.log('Using hardcoded demo login for admin@mic.edu');
        
        // Create a mock JWT token (this is just for demo purposes)
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8xMjM0NTY3ODkiLCJpYXQiOjE2OTIxMTY4MDAsImV4cCI6MTY5MjcyMTYwMH0.mZhbAKSR7Xv9W6Q0KNP9XJ8MZ8VJZ7HcZyGlLnQQ9yI';
        
        // Create a mock user object
        const mockUser = {
          id: "demo123456789",
          employeeId: "MIC2025ADMIN",
          name: "Admin Demo",
          email: "admin@mic.edu",
          role: "admin",
          department: "Computer Science & Engineering (CSE)",
          leaveBalance: {
            cl: 12,
            scl: 8,
            el: 15,
            hpl: 10,
            ccl: 7
          }
        };
        
        // Store token in localStorage
        localStorage.setItem('token', mockToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        
        // Set user state
        setUser(mockUser);
        
        // Show success message
        toast.success('Login successful! (Demo Mode)');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
        
        console.log('Demo login successful, returning success=true');
        return { success: true };
      }
      
      // For non-demo users, try regular login
      try {
        console.log('Attempting regular login...');
        const response = await api.post('/auth/login', { email, password });
        
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
        console.log('Regular login failed:', error.message);
        throw error; // Re-throw the error to be handled below
      }
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

  const logout = () => {
    // Check if it's a demo user first
    const isDemoUser = user?.email === 'admin@mic.edu' && user?.id === 'demo123456789';
    
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    
    if (isDemoUser) {
      toast.success('Logged out from Demo Mode successfully');
    } else {
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