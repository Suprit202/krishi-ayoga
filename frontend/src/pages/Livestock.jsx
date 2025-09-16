// src/pages/Livestock.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext'; // ADD THIS
import LivestockGroupCard from '../components/Livestock/LivestockGroupCard';
import LivestockForm from '../components/Livestock/LivestockForm';
import api from '../services/api';
import Loader from '../components/UI/Loader';

const Livestock = () => {
  const [showForm, setShowForm] = useState(false);
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [farms, setFarms] = useState([]); // NEW: For filter dropdown
  const [selectedFarm, setSelectedFarm] = useState('all'); // NEW: Filter state
  const [loading, setLoading] = useState(true);
  const [loadingFarms, setLoadingFarms] = useState(false); // NEW: Loading for farms
  const { showNotification } = useNotification();
  const { isAdmin, isVeterinarian, user } = useAuth(); // NEW: Auth context

  // Determine user type
  const isAdminOrVet = isAdmin || isVeterinarian;
  const isRegularUser = !isAdmin && !isVeterinarian;

  // Fetch livestock groups from API
  useEffect(() => {
    fetchLivestockGroups();
    if (isAdminOrVet) {
      fetchFarms(); // NEW: Fetch farms for admin/vet filter
    }
  }, [selectedFarm]); // NEW: Refetch when filter changes

  const fetchLivestockGroups = async () => {
    try {
      setLoading(true);
      // NEW: Add farm filter to API call for admin/vet
      const url = isAdminOrVet && selectedFarm !== 'all' 
        ? `/livestock?farmId=${selectedFarm}`
        : '/livestock';
      
      const response = await api.get(url);
      setLivestockGroups(response.data);
    } catch (error) {
      console.error('Error fetching livestock groups:', error);
      showNotification('Failed to load livestock groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch farms for filter dropdown
  const fetchFarms = async () => {
    try {
      setLoadingFarms(true);
      const response = await api.get('/livestock/farms');
      setFarms(response.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
      showNotification('Failed to load farms', 'error');
    } finally {
      setLoadingFarms(false);
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

  // NEW: Handle farm filter change
  const handleFarmFilterChange = (e) => {
    setSelectedFarm(e.target.value);
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
        
        <div className="flex items-center space-x-4">
          {/* NEW: Farm filter dropdown for admin/vet */}
          {isAdminOrVet && farms.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="farm-filter" className="text-sm font-medium text-gray-700">
                Filter by Farm:
              </label>
              <select
                id="farm-filter"
                value={selectedFarm}
                onChange={handleFarmFilterChange}
                disabled={loadingFarms}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Farms</option>
                {farms.map(farm => (
                  <option key={farm._id} value={farm._id}>
                    {farm.name} 
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* HIDE Add button for admin/vet - only show for regular users */}
          {!showForm && isRegularUser && (
            <button 
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + Add New Group
            </button>
          )}
        </div>
      </div>

      {/* NEW: Show filter status for admin/vet */}
      {isAdminOrVet && selectedFarm !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-sm text-blue-800">
            Showing livestock for: <span className="font-semibold">
              {farms.find(f => f._id === selectedFarm)?.name || 'Selected Farm'}
            </span>
            <button
              onClick={() => setSelectedFarm('all')}
              className="ml-3 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Show all farms
            </button>
          </p>
        </div>
      )}

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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isAdminOrVet ? 'No livestock groups found' : 'No livestock groups yet'}
              </h3>
              <p className="text-gray-500">
                {isAdminOrVet ? 'Try selecting a different farm filter' : 'Create your first livestock group to get started'}
              </p>
              {isRegularUser && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="btn-primary mt-4"
                >
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestockGroups.map(group => (
                <LivestockGroupCard 
                  key={group._id} 
                  group={group} 
                  // showFarmInfo={isAdminOrVet} // NEW: Pass prop to show farm info
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Livestock;