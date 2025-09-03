import { useState, useEffect } from 'react';
import api from '../services/api';

export const useTreatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/treatments');
      setTreatments(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch treatments');
    } finally {
      setLoading(false);
    }
  };

  const createTreatment = async (treatmentData) => {
    try {
      const response = await api.post('/treatments', treatmentData);
      setTreatments(prev => [response.data, ...prev]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create treatment';
      return { success: false, error: errorMsg };
    }
  };

  const checkSaleReadiness = async (groupId) => {
    try {
      const response = await api.get(`/treatments/check-sale/${groupId}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to check sale readiness';
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    fetchTreatments();
  }, []);

  return {
    treatments,
    loading,
    error,
    createTreatment,
    checkSaleReadiness,
    refetch: fetchTreatments
  };
};