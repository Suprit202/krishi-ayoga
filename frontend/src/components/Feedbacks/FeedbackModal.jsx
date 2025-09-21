// src/components/Feedbacks/FeedbackModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    livestockGroupId: '',
    treatmentId: '',
    priority: 'medium',
    initialMessage: ''
  });
  
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  
  useEffect(() => {
    if (isOpen) {
      fetchFarms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedFarmId) {
      fetchLivestockGroups(selectedFarmId);
    }
  }, [selectedFarmId]);

  useEffect(() => {
    if (formData.livestockGroupId) {
      fetchTreatments(formData.livestockGroupId);
    }
  }, [formData.livestockGroupId]);

  const fetchFarms = async () => {
    try {
      const response = await api.get('/livestock/farms');
      setFarms(response.data);
    } catch (error) {
      console.error('Failed to fetch farms:', error);
    }
  };

  const fetchLivestockGroups = async (farmId) => {
    try {
      const response = await api.get(`/livestock/farm-dropdown/${farmId}`);
      setLivestockGroups(response.data);
    } catch (error) {
      console.error('Failed to fetch livestock groups:', error);
    }
  };

  const fetchTreatments = async (livestockGroupId) => {
    try {
      setLoading(true);
      const response = await api.get(`/treatments?livestockGroupId=${livestockGroupId}`);
      setTreatments(response.data);
    } catch (error) {
      console.error('Failed to fetch treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely render location
  const renderLocation = (location) => {
    if (typeof location === 'string') {
      return location;
    }
    if (typeof location === 'object' && location !== null) {
      return location.country || JSON.stringify(location);
    }
    return 'Unknown location';
  };
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.livestockGroupId) newErrors.livestockGroupId = 'Livestock group is required';
    if (!formData.treatmentId) newErrors.treatmentId = 'Treatment is required';
    if (!formData.initialMessage) newErrors.initialMessage = 'Initial message is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Prepare the data for submission - NO farmerId
    const submissionData = {
      title: formData.title,
      livestockGroupId: formData.livestockGroupId,
      treatmentId: formData.treatmentId,
      priority: formData.priority,
      veterinarianId: user._id,
      messages: [{
        senderId: user._id,
        senderRole: user.role,
        content: formData.initialMessage
      }]
    };
    
    console.log('Submitting data to API:', submissionData);
    onSubmit(submissionData);
  };
  
  const handleLivestockChange = (e) => {
    const livestockGroupId = e.target.value;
    setFormData(prev => ({
      ...prev,
      livestockGroupId,
      treatmentId: '' // Reset treatment when livestock changes
    }));
  };

  const handleFarmChange = (e) => {
    setSelectedFarmId(e.target.value);
    setFormData(prev => ({
      ...prev,
      livestockGroupId: '',
      treatmentId: ''
    }));
    setErrors({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="e.g., Treatment follow-up for dairy herd"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          {/* Farm selection for admin/vet */}
          {(user.role === 'admin' || user.role === 'veterinarian') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Farm *
              </label>
              <select
                value={selectedFarmId}
                onChange={handleFarmChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select a farm</option>
                {farms.map(farm => (
                  <option key={farm._id} value={farm._id}>
                    {farm.name} - {renderLocation(farm.location)}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Livestock Group *
            </label>
            <select
              value={formData.livestockGroupId}
              onChange={handleLivestockChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!selectedFarmId && (user.role === 'admin' || user.role === 'veterinarian')}
              required
            >
              <option value="">Select livestock group</option>
              {livestockGroups.map(group => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.species}) - {group.count} animals
                </option>
              ))}
            </select>
            {errors.livestockGroupId && <p className="text-red-500 text-sm mt-1">{errors.livestockGroupId}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Related Treatment *
            </label>
            <select
              value={formData.treatmentId}
              onChange={(e) => setFormData({...formData, treatmentId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!formData.livestockGroupId || loading}
              required
            >
              <option value="">Select treatment</option>
              {treatments.map(treatment => (
                <option key={treatment._id} value={treatment._id}>
                  {treatment.drugName} - {new Date(treatment.dateAdministered).toLocaleDateString()}
                </option>
              ))}
            </select>
            {loading && <p className="text-sm text-gray-500">Loading treatments...</p>}
            {errors.treatmentId && <p className="text-red-500 text-sm mt-1">{errors.treatmentId}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Message *
            </label>
            <textarea
              value={formData.initialMessage}
              onChange={(e) => setFormData({...formData, initialMessage: e.target.value})}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe the purpose of this report..."
            />
            {errors.initialMessage && <p className="text-red-500 text-sm mt-1">{errors.initialMessage}</p>}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Create Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;