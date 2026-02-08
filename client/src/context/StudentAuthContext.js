import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

const StudentAuthContext = createContext();

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within StudentAuthProvider');
  }
  return context;
};

export const StudentAuthProvider = ({ children }) => {
  // Restore cached student data for instant render, validate in background
  const [student, setStudent] = useState(() => {
    try {
      const cached = localStorage.getItem('studentData');
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('studentToken');
    const hasCached = !!localStorage.getItem('studentData');
    return hasToken && !hasCached;
  });
  const [token, setToken] = useState(localStorage.getItem('studentToken'));

  useEffect(() => {
    if (token) {
      loadStudent();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudent = async () => {
    try {
      const currentToken = localStorage.getItem('studentToken');
      if (!currentToken) {
        setLoading(false);
        return;
      }
      
      const response = await userAPI.getMe(currentToken);
      const studentData = response.data.user;
      setStudent(studentData);
      // Cache student data for instant render on next visit
      localStorage.setItem('studentData', JSON.stringify(studentData));
    } catch (error) {
      console.error('Failed to load student:', error);
      // Clear invalid token and cached data
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentData');
      setToken(null);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    try {
      const response = await userAPI.register(credentials);
      const { token: newToken, user } = response.data;
      
      localStorage.setItem('studentToken', newToken);
      localStorage.setItem('studentData', JSON.stringify(user));
      setToken(newToken);
      setStudent(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await userAPI.login(credentials);
      const { token: newToken, user } = response.data;
      
      localStorage.setItem('studentToken', newToken);
      localStorage.setItem('studentData', JSON.stringify(user));
      setToken(newToken);
      setStudent(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentData');
    setToken(null);
    setStudent(null);
  };

  const updateProfile = async (data) => {
    try {
      const currentToken = localStorage.getItem('studentToken');
      const response = await userAPI.updateProfile(data, currentToken);
      setStudent(response.data.user);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed'
      };
    }
  };

  const value = {
    student,
    loading,
    isAuthenticated: !!student,
    register,
    login,
    logout,
    updateProfile,
    refreshStudent: loadStudent
  };

  return (
    <StudentAuthContext.Provider value={value}>
      {children}
    </StudentAuthContext.Provider>
  );
};
