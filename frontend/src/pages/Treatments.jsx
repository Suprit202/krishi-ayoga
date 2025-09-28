// src/pages/Treatments.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import TreatmentForm from '../components/Treatments/TreatmentForm';
import TreatmentList from '../components/Treatments/TreatmentList';

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [filteredTreatments, setFilteredTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [sortFilter, setSortFilter] = useState('all');
  const { showNotification } = useNotification();
  const { isAdmin, isVeterinarian, isFarmer } = useAuth();
  const [searchParams] = useSearchParams();

  // Determine user type for cleaner logic
  const isAdminOrVet = isAdmin || isVeterinarian;
  const isRegularUser = isFarmer; // Farmers or other users
// console.log(isRegularUser);
  useEffect(() => {
    fetchTreatments();
    
    const groupId = searchParams.get('group');
    if (groupId) {
      setSelectedGroupId(groupId);
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilter();
  }, [sortFilter, treatments]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/treatments');
      setTreatments(response.data);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      if (error.response?.status !== 401) {
        showNotification('Failed to load treatments', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (sortFilter === 'all') {
      setFilteredTreatments(treatments);
    } else {
      const filtered = treatments.filter(treatment => 
        treatment.farmDetails?.name?.toLowerCase().includes(sortFilter.toLowerCase())
      );
      setFilteredTreatments(filtered);
    }
  };

  const getFarmOptions = () => {
    if (!isAdminOrVet) return [];
    
    const farmNames = treatments
      .map(treatment => treatment.farmDetails?.name)
      .filter(name => name)
      .filter((name, index, array) => array.indexOf(name) === index);
    
    return farmNames.sort();
  };

  const handleNewTreatment = (newTreatment) => {
    setTreatments(prev => [newTreatment, ...prev]);
    setShowForm(false);
    setSelectedGroupId('');
    showNotification('Treatment created successfully!', 'success');
  };

  const handleFilterChange = (e) => {
    setSortFilter(e.target.value);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disease Treatments</h1>
          <p className="text-gray-600">Livestock disease diagnosis and treatment</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Filter dropdown - only show for admin/vet */}
          {isAdminOrVet && treatments.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="farm-filter" className="text-sm font-medium text-gray-700">
                Filter by Farm:
              </label>
              <select
                id="farm-filter"
                value={sortFilter}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Farms</option>
                {getFarmOptions().map(farmName => (
                  <option key={farmName} value={farmName}>
                    {farmName}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Show "New Diagnosis" button ONLY for regular users AND when form is not open */}
          {isRegularUser && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Diagnosis
            </button>
          )}
        </div>
      </div>

      {/* Filter status for admin/vet */}
      {isAdminOrVet && sortFilter !== 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            Showing treatments for: <span className="font-semibold">{sortFilter}</span>
            <button
              onClick={() => setSortFilter('all')}
              className="ml-3 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Show all farms
            </button>
          </p>
        </div>
      )}

      {showForm ? (
        <TreatmentForm 
          onSuccess={handleNewTreatment}
          onCancel={() => {
            setShowForm(false);
            setSelectedGroupId('');
          }}
          preSelectedGroupId={selectedGroupId}
        />
      ) : (
        <TreatmentList 
          treatments={filteredTreatments}
          onRefresh={fetchTreatments} 
          isAdmin={isAdminOrVet} // Pass the combined check
        />
      )}
    </div>
  );
};

export default Treatments;