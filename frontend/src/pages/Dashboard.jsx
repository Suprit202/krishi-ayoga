// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import AlertFeed from '../components/Dashboard/AlertFeed';
import StatCard from '../components/Dashboard/StartCard';
import DashboardOverview from '../components/Dashboard/DashboardOverview';
import RecentActivity from '../components/Dashboard/RecentActivity';
import LivestockGroupsOverview from '../components/Dashboard/LivestockGroupsOverview';
import Charts from '../components/Dashboard/Charts';

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
          <DashboardOverview 
            treatments={treatments}
            livestock={livestock}
            recentTreatments={recentTreatments}
          />
          
          <RecentActivity recentTreatments={recentTreatments} />
          
          {/* Charts Section */}
          {/* <Charts dashboardData={dashboardData} /> */}
        </div>

        {/* Right Column - Alerts and Livestock Groups */}
        <div className="space-y-6">
          <AlertFeed />
          <LivestockGroupsOverview 
            livestockGroups={livestockGroups}
            loading={loadingGroups}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;