// src/components/Farm/FarmManager.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';
import FarmCreate from './FarmCreate';
import FarmView from './FarmView';

const FarmManager = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view'); // 'view', 'create', 'edit'
  const { showNotification } = useNotification();

  // Fetch farm data
  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farm/profile');
      setFarmData(response.data);
      
      // Set mode based on whether farm exists
      if (response.data.farm) {
        setMode('view');
      } else {
        setMode('create');
      }
    } catch (error) {
      console.error('Error fetching farm data:', error);
      showNotification('Failed to load farm data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  const handleCreateSuccess = () => {
    setMode('view');
    fetchFarmData();
    showNotification('Farm profile created successfully!', 'success');
  };

  const handleEditSuccess = () => {
    setMode('view');
    fetchFarmData();
    showNotification('Farm profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    if (farmData?.farm) {
      setMode('view');
    } else {
      setMode('create');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  // Render appropriate component based on mode
  switch (mode) {
    case 'create':
      return (
        <FarmCreate
          onSuccess={handleCreateSuccess}
          onCancel={handleCancel}
        />
      );

    case 'edit':
      return (
        <FarmCreate
          farmData={farmData}
          onSuccess={handleEditSuccess}
          onCancel={handleCancel}
          isEditing={true}
        />
      );

    case 'view':
      return (
        <FarmView
          farmData={farmData}
          onEdit={() => setMode('edit')}
        />
      );

    default:
      return null;
  }
};

export default FarmManager;