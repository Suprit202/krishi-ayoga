// src/components/Treatments/TreatmentList.jsx
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const TreatmentList = ({ treatments, onRefresh, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [expandedTreatment, setExpandedTreatment] = useState(null);
  const { showNotification } = useNotification();

  const handleDelete = async (treatmentId) => {
    if (!window.confirm('Are you sure you want to delete this treatment record?')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/treatments/${treatmentId}`);
      showNotification('Treatment record deleted successfully', 'success');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete treatment record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-red-600 bg-red-100';
    if (confidence >= 0.6) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (treatments.length === 0) {
    return (
      <div className="card text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Treatments Yet</h3>
        <p className="text-gray-500">Start by creating your first disease diagnosis using AI analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Treatment History ({treatments.length})
        </h2>
        <button
          onClick={onRefresh}
          className="btn-outline text-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {treatments.map((treatment) => (
          <div key={treatment._id} className="card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{treatment.drugName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(treatment.aiAnalysis?.confidence || 0.8)}`}>
                    {((treatment.aiAnalysis?.confidence || 0.8) * 100).toFixed(0)}% confident
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Livestock:</span> {treatment.groupName}
                  </div>
                  <div>
                    <span className="font-medium">Species:</span> {treatment.species}
                  </div>

                  {isAdmin ? (
                      <div>
                        {/* Safely access the new farmDetails field */}
                        <span className="font-medium">Farm:</span> {treatment.farmDetails?.name || 'N/A'}
                      </div>
                    ) : (
                      <div>
                        <span className="font-medium">Dosage:</span> {treatment.dosage}
                      </div>
                     )
                  }
                  {isAdmin  && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Dosage:</span> {treatment.dosage}
                    </div>
                  )}
                </div>

                {expandedTreatment === treatment._id && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-3 space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Drug:</h4>
                      <p className="text-gray-700">{treatment.drugName}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Group:</h4>
                      <p className="text-gray-700">{treatment.groupName} ({treatment.species})</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Administered:</h4>
                      <p className="text-gray-700">{new Date(treatment.dateAdministered).toLocaleDateString()}</p>
                    </div>

                    {treatment.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                        <p className="text-gray-700">{treatment.notes}</p>
                      </div>
                    )}

                    {treatment.aiAnalysis?.anomalies?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-900 mb-1">Anomalies:</h4>
                        {treatment.aiAnalysis.anomalies.map((anomaly, index) => (
                          <p key={index} className="text-red-700 text-sm">⚠️ {anomaly.message}</p>
                        ))}
                      </div>
                    )}

                    {treatment.aiAnalysis?.warnings?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-1">Warnings:</h4>
                        {treatment.aiAnalysis.warnings.map((warning, index) => (
                          <p key={index} className="text-yellow-700 text-sm">⚠️ {warning.message}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentList;