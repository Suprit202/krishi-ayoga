// src/components/Farm/Farm.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Loader from '../components/UI/Loader';

const Farm = () => {
  const [farmData, setFarmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFarmData();
  }, []);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farm/profile');
      setFarmData(response.data);
    } catch (error) {
      console.error('Error fetching farm data:', error);
      showNotification('Failed to load farm data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-48">
          <Loader />
        </div>
      </div>
    );
  }

  if (!farmData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Farm Management</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No farm data found</p>
          <p className="text-sm mt-2">Please complete your farm profile</p>
        </div>
      </div>
    );
  }

  const { farm, farmer } = farmData;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Farm Management</h2>
      
      {/* Farm Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-700 text-lg">
              {farm?.name || 'Unnamed Farm'}
            </h3>
            <p className="text-sm text-gray-500">
              {farm?.location?.city || 'City'}, {farm?.location?.state || 'State'}, {farm?.location?.country || 'Country'}
            </p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full capitalize">
            {farm?.type || 'mixed'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-3">🏭 Farm Information</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Type:</span> {farm?.type ? farm.type.charAt(0).toUpperCase() + farm.type.slice(1) : 'Not specified'}</p>
              <p><span className="font-medium">Size:</span> {farm?.size ? `${farm.size} acres` : 'Not specified'}</p>
              <p><span className="font-medium">Established:</span> {farm?.establishedYear || 'Not specified'}</p>
              <p><span className="font-medium">Registration ID:</span> {farm?.registrationId || 'Not registered'}</p>
              {farm?.description && (
                <p><span className="font-medium">Description:</span> {farm.description}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3">📞 Contact Details</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Farmer Phone:</span> {farmer?.profile?.phone || 'Not specified'}</p>
              <p><span className="font-medium">Farmer Email:</span> {farmer?.email}</p>
              {farmer?.profile?.address && (
                <p><span className="font-medium">Address:</span> {farmer.profile.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Farmer Profile */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-3">👨‍🌾 Farmer Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-medium">Name:</span> {farmer?.name}</p>
              <p><span className="font-medium">Role:</span> {farmer?.role?.charAt(0).toUpperCase() + farmer.role?.slice(1)}</p>
              <p><span className="font-medium">Experience:</span> {farmer?.profile?.experience ? `${farmer.profile.experience} years` : 'Not specified'}</p>
            </div>
            <div>
              {farmer?.profile?.qualifications?.length > 0 && (
                <p><span className="font-medium">Qualifications:</span> {farmer.profile.qualifications.join(', ')}</p>
              )}
              {farmer?.profile?.specialization?.length > 0 && (
                <p><span className="font-medium">Specialization:</span> {farmer.profile.specialization.join(', ')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Details */}
        {farm?.location && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-3">📍 Location Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><span className="font-medium">Address:</span> {farm.location.address || 'Not specified'}</p>
                <p><span className="font-medium">City:</span> {farm.location.city || 'Not specified'}</p>
              </div>
              <div>
                <p><span className="font-medium">State:</span> {farm.location.state || 'Not specified'}</p>
                <p><span className="font-medium">Pincode:</span> {farm.location.pincode || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Farm;