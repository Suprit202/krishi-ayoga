// src/pages/LivestockGroupDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Loader from '../components/UI/Loader';

const LivestockGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/livestock/${id}`);
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group details:', error);
      showNotification('Failed to load group details', 'error');
      navigate('/livestock');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'under_treatment': return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_sale': return 'bg-blue-100 text-blue-800';
      case 'quarantined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeciesIcon = (species) => {
    switch (species) {
      case 'Cattle': return '🐄';
      case 'Poultry': return '🐔';
      case 'Swine': return '🐖';
      case 'Sheep': return '🐑';
      case 'Goat': return '🐐';
      case 'Fish': return '🐟';
      default: return '🐾';
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!group) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Group not found</h2>
          <button 
            onClick={() => navigate('/livestock')}
            className="btn-primary mt-4"
          >
            Back to Livestock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => navigate('/livestock')}
          className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Group Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getSpeciesIcon(group.species)}</span>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold">{group.name}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Species</p>
              <p className="text-lg font-medium capitalize">{group.species}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(group.status)}`}>
                {group.status.replace('_', ' ')}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600">Total Animals</p>
              <p className="text-2xl font-bold">{group.count}</p>
            </div>
          </div>
        </div>

        {/* Treatments Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Treatment History</h2>
          {group.currentTreatments && group.currentTreatments.length > 0 ? (
            <div className="space-y-3">
              {group.currentTreatments.map((treatment, index) => (
                <div key={index} className="bg-yellow-100 p-4 rounded-lg">
                  <p className="font-semibold py-1 px-3 bg-blue-200 inline rounded-full">{treatment.drugName}</p>
                  <p className="text-sm px-4 py-4 text-green-700">
                    Date Administered: {new Date(treatment.dateAdministered).toLocaleDateString('en-US',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true})}
                  </p>
                  <p className="text-sm px-4 text-yellow-700">
                    Until: {new Date(treatment.withdrawalEndDate).toLocaleDateString('en-US',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',hour12:true})}
                  </p>
                  {treatment.notes && (
                    <p className="text-sm text-yellow-600 mt-1">{treatment.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active treatments</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LivestockGroupDetails;