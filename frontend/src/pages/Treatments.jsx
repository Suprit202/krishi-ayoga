// src/pages/Treatments.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useSearchParams } from 'react-router-dom'; // Add this import
import api from '../services/api';
import Loader from '../components/UI/Loader';
import TreatmentForm from '../components/Treatments/TreatmentForm';
import TreatmentList from '../components/Treatments/TreatmentList';

const Treatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(''); // Add this state
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams(); // Get query parameters

  useEffect(() => {
    fetchTreatments();
    
    // Check for pre-selected group from query params
    const groupId = searchParams.get('group');
    if (groupId) {
      setSelectedGroupId(groupId);
      setShowForm(true); // Auto-open form if group is specified
    }
  }, [searchParams]);

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

  const handleNewTreatment = (newTreatment) => {
    setTreatments(prev => [newTreatment, ...prev]);
    setShowForm(false);
    setSelectedGroupId(''); // Reset selected group
    showNotification('Treatment created successfully!', 'success');
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disease Treatments</h1>
          <p className="text-gray-600">AI-powered livestock disease diagnosis and treatment</p>
        </div>
        {!showForm && (
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

      {showForm ? (
        <TreatmentForm 
          onSuccess={handleNewTreatment}
          onCancel={() => {
            setShowForm(false);
            setSelectedGroupId(''); // Reset on cancel
          }}
          preSelectedGroupId={selectedGroupId} // Pass the pre-selected group
        />
      ) : (
        <TreatmentList treatments={treatments} onRefresh={fetchTreatments} />
      )}
    </div>
  );
};

export default Treatments;