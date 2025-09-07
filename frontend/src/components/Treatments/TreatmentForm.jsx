// src/components/Treatments/TreatmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const TreatmentForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    livestockGroupId: '',
    drugId: '',
    dosage: '',
    notes: ''
  });
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const { showNotification } = useNotification();

  // Fetch livestock groups and drugs on component mount
  useEffect(() => {
    fetchLivestockGroups();
    fetchDrugs();
  }, []);

  const fetchLivestockGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await api.get('/livestock'); // Adjust endpoint as needed
      setLivestockGroups(response.data);
    } catch (error) {
      console.error('Error fetching livestock groups:', error);
      showNotification('Failed to load livestock groups', 'error');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchDrugs = async () => {
    try {
      setLoadingDrugs(true);
      const response = await api.get('/drugs'); // Adjust endpoint as needed
      setDrugs(response.data);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      showNotification('Failed to load drugs', 'error');
    } finally {
      setLoadingDrugs(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.livestockGroupId || !formData.drugId || !formData.dosage) {
      showNotification('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/treatments', formData);
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
        <p className="text-center text-gray-600 mt-4">AI is analyzing treatment...</p>
      </div>
    );
  }

  if (aiResult) {
    return (

      <div className="card">
        {
          aiResult.aiAnalysis?.confidence ? (
            aiResult.aiAnalysis.confidence > 0.9 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">AI Analysis Complete</h3>
                <p className="text-red-700 font-semibold">
                  High Confidence: {(aiResult.aiAnalysis.confidence * 100).toFixed(1)}%
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-green-800 mb-2">AI Analysis Complete</h3>
                <p className="text-green-700 font-medium">
                  Low Confidence: {(aiResult.aiAnalysis.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Analysis Complete</h3>
              <p className="text-gray-500">Confidence: Not available</p>
            </div>
          )
        }


        {
          aiResult.aiAnalysis.anomalies?.length > 0 ?
            (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Diagnosis</h4>
                <p className="text-yellow-700">{aiResult.aiAnalysis.anomalies[0].message}</p>
              </div>
            ) : (
              <></>
            )
        }

        {
          aiResult.aiAnalysis.warnings?.length > 0 ?
            (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">Diagnosis</h4>
                <p className="text-yellow-700">{aiResult.aiAnalysis.warnings[0].message}</p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-green-800 mb-2">Diagnosis</h4>
                <p className="text-green-700">Safe To Use</p>
              </div>
            )
        }



        <div className="flex space-x-4">
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
      <h2 className="text-xl font-semibold mb-6">New Treatment Analysis</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Livestock Group Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Livestock Group *
          </label>
          {loadingGroups ? (
            <div className="input-field flex items-center">
              <Loader size="small" />
              <span className="ml-2 text-gray-500">Loading groups...</span>
            </div>
          ) : (
            <select
              required
              className="input-field"
              value={formData.livestockGroupId}
              onChange={(e) => setFormData({ ...formData, livestockGroupId: e.target.value })}
            >
              <option value="">Select a livestock group</option>
              {livestockGroups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name} ({group.species}) {group.location && `- ${group.location}`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Drug Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Drug *
          </label>
          {loadingDrugs ? (
            <div className="input-field flex items-center">
              <Loader size="small" />
              <span className="ml-2 text-gray-500">Loading drugs...</span>
            </div>
          ) : (
            <select
              required
              className="input-field"
              value={formData.drugId}
              onChange={(e) => setFormData({ ...formData, drugId: e.target.value })}
            >
              <option value="">Select a drug</option>
              {drugs.map((drug) => (
                <option key={drug._id} value={drug._id}>
                  {drug.name} {drug.withdrawalPeriod && `(Withdrawal: ${drug.withdrawalPeriod} days)`}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Dosage Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dosage *
          </label>
          <input
            type="text"
            required
            className="input-field"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="e.g., 35 mg/kg, 60 mg/kg"
          />
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes & Observations
          </label>
          <textarea
            rows={3}
            className="input-field"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes, observations, or special instructions..."
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="btn-primary flex"
            disabled={loading || !formData.livestockGroupId || !formData.drugId || !formData.dosage}
          >
            {loading ? (
              <>
                <Loader size="small" />
                <span className="ml-2">Analyzing...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Analyze with AI
              </>
            )}
          </button>
          <button type="button" onClick={onCancel} className="bg-red-600 rounded-md px-3 text-white hover:bg-red-700">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm;