// src/components/Dashboard/AlertFeed.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Add auth context
import api from '../../services/api';
import Loader from '../UI/Loader';

const AlertFeed = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth(); // Get current user

  useEffect(() => {
    if (user) {
      fetchAlerts();
      // Set up interval to refresh alerts every 5 minutes
      const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]); // Add user as dependency

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alerts');
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Fallback to user-specific static alerts
      setAlerts(getFallbackAlerts());
      showNotification('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackAlerts = () => {
    // User-specific fallback alerts
    return [
      { 
        type: 'info', 
        message: 'Welcome to your farm dashboard!', 
        timestamp: new Date().toISOString(),
        priority: 'low'
      },
      { 
        type: 'success', 
        message: 'Your farm data is loading', 
        timestamp: new Date().toISOString(),
        priority: 'low'
      }
    ];
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      default: return '📢';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'info': return 'blue';
      case 'success': return 'green';
      default: return 'gray';
    }
  };

  const prioritizeAlerts = (alertsList) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
    return alertsList.sort((a, b) => {
      const priorityA = priorityOrder[a.type] || 4;
      const priorityB = priorityOrder[b.type] || 4;
      return priorityA - priorityB;
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-5 h-5 mr-2 text-yellow-600">🔔</span>
          Alerts & Notifications
        </h3>
        <div className="flex justify-center items-center h-32">
          <Loader size="small" />
        </div>
      </div>
    );
  }

  const prioritizedAlerts = prioritizeAlerts([...alerts]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <span className="w-5 h-5 mr-2 text-yellow-600">🔔</span>
          Alerts & Notifications
          {alerts.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
              {alerts.length}
            </span>
          )}
        </h3>
        <button
          onClick={fetchAlerts}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1"
          title="Refresh alerts"
          disabled={loading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {prioritizedAlerts.length > 0 ? (
          prioritizedAlerts.map((alert, index) => {
            const color = getAlertColor(alert.type);
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  color === 'red' ? 'border-red-400 bg-red-50' :
                  color === 'yellow' ? 'border-yellow-400 bg-yellow-50' :
                  color === 'blue' ? 'border-blue-400 bg-blue-50' :
                  'border-green-400 bg-green-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="mr-2">{getAlertIcon(alert.type)}</span>
                      <p className="text-sm font-medium">{alert.message}</p>
                    </div>
                    {alert.details && (
                      <p className="text-xs text-gray-600 mt-1">{alert.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {getTimeAgo(alert.timestamp)}
                    </p>
                  </div>
                  {alert.actionRequired && (
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full whitespace-nowrap">
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto text-gray-300 mb-2 text-2xl">🎉</div>
            <p>No alerts at the moment</p>
            <p className="text-sm mt-1">Everything looks good!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertFeed;