// src/components/Profile/ProfileManager.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Loader from '../UI/Loader';
import FarmerProfile from './FarmerProfile';
import AdminProfile from './AdminProfile';
import VeterinarianProfile from './VeterinarianProfile';

const ProfileManager = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('view'); // 'view', 'create', 'edit'
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Fetch profile data using the /farm/profile endpoint for all roles
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Use the same endpoint for all roles
      const response = await api.get('/farm/profile');
      setProfileData(response.data);
      
      // For farmers, check if farm exists to determine mode
      if (user.role === 'farmer') {
        if (response.data.farm) {
          setMode('view');
        } else {
          setMode('create');
        }
      } else {
        // For admin/veterinarian, always show view mode
        setMode('view');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user.role]);

  const handleCreateSuccess = () => {
    setMode('view');
    fetchProfileData();
    showNotification('Profile created successfully!', 'success');
  };

  const handleEditSuccess = () => {
    setMode('view');
    fetchProfileData();
    showNotification('Profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    if (user.role === 'farmer') {
      if (profileData?.farm) {
        setMode('view');
      } else {
        setMode('create');
      }
    } else {
      setMode('view');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  // Render appropriate component based on user role
  switch (user.role) {
    case 'farmer':
      return (
        <FarmerProfile
          profileData={profileData}
          mode={mode}
          onCreateSuccess={handleCreateSuccess}
          onEditSuccess={handleEditSuccess}
          onCancel={handleCancel}
          onEdit={() => setMode('edit')}
        />
      );
    
    case 'admin':
      return (
        <AdminProfile
          profileData={profileData}
          mode={mode}
          onCreateSuccess={handleCreateSuccess}
          onEditSuccess={handleEditSuccess}
          onCancel={handleCancel}
          onEdit={() => setMode('edit')}
        />
      );
    
    case 'veterinarian':
      return (
        <VeterinarianProfile
          profileData={profileData}
          mode={mode}
          onCreateSuccess={handleCreateSuccess}
          onEditSuccess={handleEditSuccess}
          onCancel={handleCancel}
          onEdit={() => setMode('edit')}
        />
      );
    
    default:
      return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Profile</h2>
          <p>No profile available for your role.</p>
        </div>
      );
  }
};

export default ProfileManager;