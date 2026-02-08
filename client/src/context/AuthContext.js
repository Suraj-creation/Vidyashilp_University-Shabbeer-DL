import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Restore cached admin data for instant render, validate in background
  const [admin, setAdmin] = useState(() => {
    try {
      const cached = localStorage.getItem('adminData');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(() => {
    // Only show loading if we have a token but no cached admin
    const hasToken = !!localStorage.getItem('token');
    const hasCached = !!localStorage.getItem('adminData');
    return hasToken && !hasCached;
  });
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      loadAdmin();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadAdmin = async () => {
    try {
      const response = await authAPI.getCurrentAdmin();
      const adminData = response.data.data;
      setAdmin(adminData);
      // Cache admin data for instant render on next visit
      localStorage.setItem('adminData', JSON.stringify(adminData));
    } catch (error) {
      console.error('Failed to load admin:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, admin } = response.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setAdmin(admin);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    setToken(null);
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
