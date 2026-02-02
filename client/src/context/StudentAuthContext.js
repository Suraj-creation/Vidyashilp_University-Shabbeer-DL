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
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
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
      setStudent(response.data.user);
    } catch (error) {
      console.error('Failed to load student:', error);
      // Clear invalid token
      localStorage.removeItem('studentToken');
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
