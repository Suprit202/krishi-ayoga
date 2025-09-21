// src/hooks/useLivestock.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useLivestock = () => {
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLivestockGroups = async (farmId = '') => {
    try {
      setLoading(true);
      const url = farmId && farmId !== 'all' 
        ? `/livestock?farmId=${farmId}`
        : '/livestock';
      
      const response = await api.get(url);
      setLivestockGroups(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch livestock groups');
    } finally {
      setLoading(false);
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await api.get('/livestock/farms');
      setFarms(response.data);
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    }
  };

  const createLivestockGroup = async (groupData) => {
    try {
      const response = await api.post('/livestock', groupData);
      setLivestockGroups(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create livestock group';
      return { success: false, error: errorMsg };
    }
  };

  const updateLivestockGroupStatus = async (id, status) => {
    try {
      const response = await api.put(`/livestock/${id}/status`, { status });
      setLivestockGroups(prev => prev.map(group => 
        group._id === id ? response.data : group
      ));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update livestock group status';
      return { success: false, error: errorMsg };
    }
  };

  const getLivestockGroup = async (id) => {
    try {
      const response = await api.get(`/livestock/${id}`);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to fetch livestock group';
      return { success: false, error: errorMsg };
    }
  };

  useEffect(() => {
    fetchLivestockGroups();
    fetchFarms();
  }, []);

  return {
    livestockGroups,
    farms,
    loading,
    error,
    createLivestockGroup,
    updateLivestockGroupStatus,
    getLivestockGroup,
    refetch: fetchLivestockGroups,
    refetchWithFilter: fetchLivestockGroups
  };
};