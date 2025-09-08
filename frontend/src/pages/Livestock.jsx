// src/pages/Livestock.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import LivestockGroupCard from '../components/Livestock/LivestockGroupCard';
import LivestockForm from '../components/Livestock/LivestockForm';
import api from '../services/api';
import Loader from '../components/UI/Loader';

const Livestock = () => {
  const [showForm, setShowForm] = useState(false);
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Fetch livestock groups from API
  useEffect(() => {
    fetchLivestockGroups();
  }, []);

  const fetchLivestockGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/livestock');
      setLivestockGroups(response.data);
    } catch (error) {
      console.error('Error fetching livestock groups:', error);
      showNotification('Failed to load livestock groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (formData) => {
    try {
      const response = await api.post('/livestock', formData);
      setLivestockGroups(prev => [...prev, response.data]);
      setShowForm(false);
      showNotification('Livestock group created successfully!', 'success');
    } catch (error) {
      console.error('Error creating group:', error);
      showNotification(error.response?.data?.message || 'Failed to create group', 'error');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Livestock Management</h1>
          <p className="text-gray-600">Manage your livestock groups and track their health status</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            + Add New Group
          </button>
        )}
      </div>

      {showForm ? (
        <LivestockForm 
          onSubmit={handleCreateGroup}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <>
          {livestockGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                <span className="text-2xl">🐄</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No livestock groups yet</h3>
              <p className="text-gray-500">Create your first livestock group to get started</p>
              <button 
                onClick={() => setShowForm(true)}
                className="btn-primary mt-4"
              >
                Create First Group
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestockGroups.map(group => (
                <LivestockGroupCard key={group._id} group={group} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Livestock;