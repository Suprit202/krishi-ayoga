// src/pages/Reports.jsx (with your original colors)
import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import Loader from '../components/UI/Loader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [treatmentsRes, livestockRes, drugsRes] = await Promise.all([
        api.get(`/reports/treatments?range=${timeRange}`),
        api.get('/reports/livestock'),
        api.get(`/reports/drug-usage?range=${timeRange}`)
      ]);

      setReportData({
        treatments: treatmentsRes.data,
        livestock: livestockRes.data,
        drugUsage: drugsRes.data
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      showNotification('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Treatment Trends Chart - KEEPING YOUR ORIGINAL COLORS
  const treatmentTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Treatments Administered',
        data: reportData?.treatments?.byMonth || [],
        backgroundColor: 'rgba(44, 75, 110, 0.8)', // YOUR ORIGINAL primary color
        borderColor: 'rgba(44, 75, 110, 1)',       // YOUR ORIGINAL border color
        borderWidth: 2,
      },
    ],
  };

  // Livestock Distribution Chart - KEEPING YOUR ORIGINAL COLORS
  const livestockDistributionData = {
    labels: reportData?.livestock?.bySpecies ? Object.keys(reportData.livestock.bySpecies) : [],
    datasets: [
      {
        data: reportData?.livestock?.bySpecies ? Object.values(reportData.livestock.bySpecies) : [],
        backgroundColor: [
          'rgba(44, 110, 73, 0.8)',   // YOUR ORIGINAL primary-500
          'rgba(254, 71, 32, 0.8)',   // YOUR ORIGINAL secondary-500 (reddish)
          'rgba(255, 33, 244, 0.8)',  // YOUR ORIGINAL primary-600 (pink)
          'rgba(46, 33, 255, 0.8)',   // YOUR ORIGINAL secondary-600 (blue)
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Drug Usage Chart - KEEPING YOUR ORIGINAL COLORS
  const drugUsageData = {
    labels: reportData?.drugUsage?.topDrugs ? reportData.drugUsage.topDrugs.map(d => d.drug) : [],
    datasets: [
      {
        label: 'Cost ($)',
        data: reportData?.drugUsage?.topDrugs ? reportData.drugUsage.topDrugs.map(d => d.cost) : [],
        backgroundColor: 'rgba(250, 0, 0, 0.6)', // YOUR ORIGINAL secondary color
        borderColor: 'rgba(250, 0, 0, 1)',       // YOUR ORIGINAL border color
        borderWidth: 2,
        type: 'line',
        yAxisID: 'y1',
      },
      {
        label: 'Usage Count',
        data: reportData?.drugUsage?.topDrugs ? reportData.drugUsage.topDrugs.map(d => d.usage) : [],
        backgroundColor: 'rgba(44, 110, 73, 0.6)',  // YOUR ORIGINAL primary color
        borderColor: 'rgba(44, 110, 73, 1)',        // YOUR ORIGINAL border color
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, font: { size: 16 } }
    },
    maintainAspectRatio: false,
  };

  const drugUsageOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Usage Count' }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: { display: true, text: 'Cost ($)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">No Data Available</h2>
          <p className="text-gray-600">Unable to load report data. Please try again.</p>
          <button 
            onClick={fetchReportData}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Farm Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive insights into your farm operations</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field w-40"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600">{reportData.treatments?.total || 0}</h3>
          <p className="text-gray-600">Total Treatments</p>
        </div>
        
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600">{reportData.livestock?.totalAnimals || 0}</h3>
          <p className="text-gray-600">Total Animals</p>
        </div>
        
        <div className="card text-center">
          <h3 className="text-2xl font-bold text-primary-600">
            {reportData.livestock?.healthStatus?.healthy || 0}%
          </h3>
          <p className="text-gray-600">Healthy Animals</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Treatment Trends */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Treatment Trends</h3>
          <div className="h-80">
            <Bar data={treatmentTrendsData} options={chartOptions} />
          </div>
        </div>

        {/* Livestock Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Livestock Distribution</h3>
          <div className="h-80">
            <Doughnut data={livestockDistributionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Drug Usage Chart */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Drug Usage & Cost Analysis</h3>
        <div className="h-96">
          <Bar data={drugUsageData} options={drugUsageOptions} />
        </div>
      </div>

      {/* Health Status */}
      {reportData.livestock?.healthStatus && (
        <div className="card mt-6">
          <h3 className="text-xl font-semibold mb-4">Health Status Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(reportData.livestock.healthStatus).map(([status, percentage]) => (
              <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{percentage}%</div>
                <div className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;