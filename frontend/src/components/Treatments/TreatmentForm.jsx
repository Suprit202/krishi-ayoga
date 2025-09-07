// src/components/Treatments/TreatmentForm.jsx
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const TreatmentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    livestockId: '',
    symptoms: '',
    observations: ''
  });
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/treatments/analyze', formData);
      setAiResult(response.data);
      showNotification('AI analysis completed!', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      showNotification(error.response?.data?.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTreatment = async () => {
    try {
      setLoading(true);
      const response = await api.post('/treatments', {
        ...formData,
        diagnosis: aiResult.diagnosis,
        confidence: aiResult.confidence,
        treatmentPlan: aiResult.treatmentPlan
      });
      onSuccess(response.data);
    } catch (error) {
      console.error('Save error:', error);
      showNotification('Failed to save treatment', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <Loader />
        <p className="text-center text-gray-600 mt-4">AI is analyzing symptoms...</p>
      </div>
    );
  }

  if (aiResult) {
    return (
      <div className="card">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">AI Diagnosis Complete</h3>
          <p className="text-green-700">Confidence: {(aiResult.confidence * 100).toFixed(1)}%</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-2">Diagnosis</h4>
            <p className="text-gray-700">{aiResult.diagnosis}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Recommended Treatment</h4>
            <p className="text-gray-700">{aiResult.treatmentPlan}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button onClick={handleSaveTreatment} className="btn-primary">
            Save Treatment Plan
          </button>
          <button onClick={() => setAiResult(null)} className="btn-outline">
            Re-analyze
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">New Disease Analysis</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Livestock ID
          </label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.livestockId}
            onChange={(e) => setFormData({...formData, livestockId: e.target.value})}
            placeholder="Enter livestock identification"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symptoms
          </label>
          <textarea
            required
            rows={4}
            className="input-field"
            value={formData.symptoms}
            onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
            placeholder="Describe all observed symptoms..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Observations
          </label>
          <textarea
            rows={3}
            className="input-field"
            value={formData.observations}
            onChange={(e) => setFormData({...formData, observations: e.target.value})}
            placeholder="Any additional notes or observations..."
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button type="submit" className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze with AI
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm;