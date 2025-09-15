// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import api from '../services/api';

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
  const { showNotification } = useNotification();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    
    if (token && userData) {
      setUser(userData);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // NEW: Enhanced role checking functions
  const hasRole = (roles) => {
    if (!user?.role) return false;
    // If roles is a string, convert it to an array
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  // Convenience functions for common role checks
  const isAdmin = () => hasRole('admin');
  const isVeterinarian = () => hasRole('veterinarian');
  const isAdminOrVeterinarian = () => hasRole(['admin', 'veterinarian']);
  const isFarmer = () => hasRole('farmer');
  const isUser = () => hasRole('user');

  const login = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', formData);
      const { token, _id, name, email, role } = response.data;

      const userData = { _id, name, email, role };

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
      showNotification('Login successful! Welcome back.', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      showNotification(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', formData);
      const { token, _id, name, email, role } = response.data;

      const userData = { _id, name, email, role };

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      
      showNotification('Registration successful! Welcome.', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      showNotification(message, 'error');
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    showNotification('You have been logged out.', 'info');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    // NEW: Export all role checking functions
    hasRole,
    isAdmin,
    isVeterinarian,
    isAdminOrVeterinarian,
    isFarmer,
    isUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};