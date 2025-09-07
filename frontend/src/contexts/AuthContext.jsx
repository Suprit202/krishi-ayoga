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
    const email = localStorage.getItem('email');
    
    if (token && email) {
      setUser({ email });
    }
    setLoading(false);
  }, []);

  const login = async (formData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', formData);
      const { token, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      setUser({ email });
      
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
      const { token, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('email', email);
      setUser({ email });
      
      showNotification('Registration successful! Please login to continue.', 'success');
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
    localStorage.removeItem('email');
    setUser(null);
    showNotification('You have been logged out.', 'info');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};