// src/hooks/useReports.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback');
      setReports(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData) => {
    try {
      console.log('Creating report with data:', reportData);

      const response = await api.post('/feedback', reportData);

      console.log('Report created successfully:', response.data);
      setReports(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating report:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to create report';
      return { success: false, error: errorMsg };
    }
  };

  // src/hooks/useReports.js - Improve error handling
  const addMessage = async (reportId, content) => {
    try {
      console.log('Sending message to report:', reportId);

      const response = await api.post(`/feedback/${reportId}/messages`, {
        content: content.trim()
      });

      console.log('Message sent successfully');

      // Update the specific report in state
      setReports(prev => prev.map(report =>
        report._id === reportId ? response.data : report
      ));

      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error sending message:', err.response?.data);
      const errorMsg = err.response?.data?.message || 'Failed to send message';
      return { success: false, error: errorMsg };
    }
  };

  const updateStatus = async (reportId, status) => {
    try {
      const response = await api.patch(`/feedback/${reportId}/status`, { status });

      // Update the specific report in state
      setReports(prev => prev.map(report =>
        report._id === reportId ? response.data : report
      ));

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update status';
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    createReport,
    addMessage,
    updateStatus,
    refetch: fetchReports
  };
};