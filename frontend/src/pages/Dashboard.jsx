// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import AlertFeed from '../components/Dashboard/AlertFeed';
import StatCard from '../components/Dashboard/StartCard'; // Fixed typo: StartCard → StatCard

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [livestockGroups, setLivestockGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { showNotification } = useNotification();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchDashboardData();
    fetchLivestockGroups();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      </div>
    );
  }

  const { treatments, livestock, recentTreatments } = dashboardData || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Farm Dashboard</h1>
        <button 
          onClick={() => {
            fetchDashboardData();
            fetchLivestockGroups();
          }}
          className="btn-secondary flex items-center text-sm"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Animals"
          value={livestock?.totalAnimals || 0}
          icon="🐄"
          color="blue"
          subtitle="across all groups"
        />
        <StatCard
          title="Livestock Groups"
          value={livestock?.totalGroups || 0}
          icon="🏘️"
          color="green"
          subtitle="managed"
        />
        <StatCard
          title="Total Treatments"
          value={treatments?.total || 0}
          icon="💉"
          color="purple"
          subtitle="administered"
        />
        <StatCard
          title="Healthy Groups"
          value={livestock?.healthy || 0}
          icon="✅"
          color="green"
          subtitle={`of ${livestock?.totalGroups || 0}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dashboard Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dashboard Overview */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">📊 Dashboard Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Quick Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-700">📈 Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Treatment Completion</span>
                    <span className="font-semibold text-green-600">
                      {treatments?.completed || 0}/{treatments?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Healthy Groups</span>
                    <span className="font-semibold text-blue-600">
                      {livestock?.healthy || 0}/{livestock?.totalGroups || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg. Animals/Group</span>
                    <span className="font-semibold text-purple-600">
                      {livestock?.totalGroups > 0 ? Math.round(livestock.totalAnimals / livestock.totalGroups) : 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 text-gray-700">🎯 Action Items</h4>
                <div className="space-y-2">
                  {livestock?.underTreatment > 0 && (
                    <div className="flex items-center text-sm text-orange-600">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {livestock.underTreatment} groups need attention
                    </div>
                  )}
                  {treatments?.inProgress > 0 && (
                    <div className="flex items-center text-sm text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {treatments.inProgress} treatments in progress
                    </div>
                  )}
                  {(!livestock?.underTreatment && !treatments?.inProgress) && (
                    <div className="text-sm text-green-600">
                      ✅ All systems operational
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Highlights */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-yellow-800">⭐ Today's Highlights</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{treatments?.completed || 0}</div>
                  <div className="text-gray-600">Completed Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{livestock?.healthy || 0}</div>
                  <div className="text-gray-600">Healthy Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {recentTreatments?.length || 0}
                  </div>
                  <div className="text-gray-600">Recent Activities</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">🕒 Recent Activity</h3>
            <div className="space-y-3">
              {recentTreatments?.length > 0 ? (
                recentTreatments.slice(0, 5).map((treatment, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {treatment.drugName} administered to {treatment.groupName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(treatment.dateAdministered).toLocaleDateString()} • 
                        {new Date(treatment.dateAdministered).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No recent activity</p>
                  <p className="text-sm">Treatments will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Alerts and Livestock Groups */}
        <div className="space-y-6">
          <AlertFeed />
          
          {/* Livestock Groups Overview */}
          {loadingGroups ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Livestock Groups</h3>
              <div className="flex justify-center items-center h-32">
                <Loader size="small" />
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                </svg>
                Livestock Groups
              </h3>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {livestockGroups.length > 0 ? (
                  livestockGroups.map((group) => (
                    <div key={group._id} className={`p-4 rounded-lg border-l-4 ${
                      group.status === 'healthy' 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-orange-400 bg-orange-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{group.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          group.status === 'healthy' 
                            ? 'bg-green-200 text-green-800' 
                            : 'bg-orange-200 text-orange-800'
                        }`}>
                          {group.status === 'healthy' ? 'Healthy' : 'Needs Care'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                        <div>
                          <span className="font-medium">Species:</span> {group.species}
                        </div>
                        <div>
                          <span className="font-medium">Count:</span> {group.count} animals
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {group.location || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Age:</span> {group.age || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(group.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
                    </svg>
                    <p>No livestock groups found</p>
                    <p className="text-sm mt-1">Create your first group to get started</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Total Groups: {livestockGroups.length || 0}</span>
                  <span>Total Animals: {livestockGroups.reduce((sum, group) => sum + (group.count || 0), 0) || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;