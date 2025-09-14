// src/components/Treatments/TreatmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const TreatmentForm = ({ onSuccess, onCancel, preSelectedGroupId }) => {
  const [formData, setFormData] = useState({
    livestockGroupId: '',
    drugId: '',
    dosage: '',
    dateAdministered: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingDrugs, setLoadingDrugs] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchLivestockGroups();
    fetchDrugs();
    
    if (preSelectedGroupId) {
      setFormData(prev => ({
        ...prev,
        livestockGroupId: preSelectedGroupId
      }));
    }
  }, [preSelectedGroupId]);

  const fetchLivestockGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await api.get('/livestock');
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
      const response = await api.get('/drugs');
      setDrugs(response.data);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      showNotification('Failed to load drugs', 'error');
    } finally {
      setLoadingDrugs(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!formData.livestockGroupId || !formData.drugId || !formData.dosage) {
      showNotification('Please fill all required fields for analysis', 'error');
      return;
    }

    setAnalysisLoading(true);
    try {
      const response = await api.post('/treatments/analyze', {
        livestockGroupId: formData.livestockGroupId,
        drugId: formData.drugId,
        dosage: formData.dosage,
        dateAdministered: formData.dateAdministered
      });
      
      setAiResult(response.data);
      showNotification('AI analysis completed! Review the results.', 'success');
    } catch (error) {
      console.error('Analysis error:', error);
      showNotification(error.response?.data?.message || 'Analysis failed. Please try again.', 'error');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSaveTreatment = async () => {
    try {
      setLoading(true);
      const response = await api.post('/treatments', {
        ...formData,
        notes: formData.notes
      });
      
      onSuccess(response.data);
      showNotification('Treatment saved successfully!', 'success');
    } catch (error) {
      console.error('Save error:', error);
      showNotification(error.response?.data?.message || 'Failed to save treatment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAnalysis = () => {
    setAiResult(null);
  };

  if (analysisLoading) {
    return (
      <div className="card">
        <Loader />
        <p className="text-center text-gray-600 mt-4">AI is analyzing your treatment plan...</p>
      </div>
    );
  }

  if (aiResult) {
    return (
      <div className="card">
        <div className={`p-4 rounded-lg mb-6 ${
          aiResult.analysis.anomalies.length > 0 || aiResult.analysis.warnings.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        } border`}>
          <h3 className="text-lg font-semibold mb-2">
            {aiResult.analysis.anomalies.length > 0 || aiResult.analysis.warnings.length > 0 ? '⚠️ Issues Detected' : '✅ Analysis Complete'}
          </h3>
          <p className={
            aiResult.analysis.anomalies.length > 0 || aiResult.analysis.warnings.length > 0 ? 'text-red-700' : 'text-green-700'
          }>
            Confidence: {((aiResult.analysis.confidence || 0) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-2">Treatment Plan</h4>
            <div className="space-y-2">
              <p><span className="font-medium">Drug:</span> {aiResult.drug.name}</p>
              <p><span className="font-medium">Group:</span> {aiResult.group.name}</p>
              <p><span className="font-medium">Dosage:</span> {aiResult.dosage}</p>
              <p><span className="font-medium">Withdrawal Period:</span> {aiResult.drug.withdrawalPeriod} days</p>
              <p><span className="font-medium">Safe After:</span> {new Date(aiResult.withdrawalEndDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Drug Description</h4>
            <p className="text-gray-700">{aiResult.drug.description || 'Standard treatment protocol'}</p>
            <h4 className="font-semibold my-2">Drug Price</h4>
            <p className="text-gray-700">{aiResult.drug.price || 'Standard price system'} $</p>
          </div>
        </div>

        {aiResult.analysis.anomalies.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-red-800 mb-2">🚨 Critical Issues</h4>
            {aiResult.analysis.anomalies.map((anomaly, index) => (
              <p key={index} className="text-red-700 text-sm">• {anomaly.message}</p>
            ))}
          </div>
        )}

        {aiResult.analysis.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warnings</h4>
            {aiResult.analysis.warnings.map((warning, index) => (
              <p key={index} className="text-yellow-700 text-sm">• {warning.message}</p>
            ))}
          </div>
        )}

        <div className="flex space-x-4">
          <button 
            onClick={handleSaveTreatment} 
            className="btn-primary"
            disabled={loading || aiResult.analysis.anomalies.length > 0 || aiResult.analysis.warnings.length > 0}
          >
            {loading ? 'Saving...' : 'Confirm & Save Treatment'}
          </button>
          <button 
            onClick={handleResetAnalysis} 
            className="btn-outline"
            disabled={loading}
          >
            Edit Details
          </button>
          <button 
            onClick={onCancel} 
            className="text-sm px-3 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        {aiResult.analysis.anomalies.length > 0 && (
          <p className="text-red-600 text-sm mt-4">
            ⚠️ Please address the critical issues before saving this treatment.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-6">New Treatment Analysis</h2>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
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
              onChange={(e) => setFormData({...formData, livestockGroupId: e.target.value})}
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
              onChange={(e) => setFormData({...formData, drugId: e.target.value})}
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
            onChange={(e) => setFormData({...formData, dosage: e.target.value})}
            placeholder="e.g., 35 mg/kg, 10 ml/animal, 2 tablets"
          />
        </div>

        {/* Date Administered */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Administered
          </label>
          <input
            type="date"
            className="input-field"
            value={formData.dateAdministered}
            onChange={(e) => setFormData({...formData, dateAdministered: e.target.value})}
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
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional notes, observations, or special instructions..."
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button 
            type="submit" 
            className="btn-primary flex items-center"
            disabled={analysisLoading}  
          >
            {analysisLoading ? (  
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
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentForm;