// src/components/Dashboard/Charts.jsx
import React from 'react';
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

const Charts = ({ treatmentsData, livestockData }) => {
  // Default data structure if no data is provided
  const defaultTreatments = {
    byMonth: Array(12).fill(0),
    byStatus: { completed: 0, inProgress: 0, scheduled: 0 }
  };

  const defaultLivestock = {
    bySpecies: {},
    healthStatus: { healthy: 0, under_treatment: 0 }
  };

  const treatments = treatmentsData || defaultTreatments;
  const livestock = livestockData || defaultLivestock;

  // Treatment Trends Chart (Monthly)
  const monthlyTreatmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Treatments per Month',
        data: treatments.byMonth || Array(12).fill(0),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      },
    ],
  };

  const monthlyOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Treatment Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Treatments',
        },
      },
    },
  };

  // Treatment Status Chart (Doughnut)
  const statusData = {
    labels: ['Completed', 'In Progress', 'Scheduled'],
    datasets: [
      {
        data: [
          treatments.byStatus?.completed || 0,
          treatments.byStatus?.inProgress || 0,
          treatments.byStatus?.scheduled || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)', // Green for completed
          'rgba(59, 130, 246, 0.6)', // Blue for in progress
          'rgba(249, 115, 22, 0.6)', // Orange for scheduled
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Treatment Status Distribution',
      },
    },
  };

  // Species Distribution Chart
  const speciesLabels = Object.keys(livestock.bySpecies || {});
  const speciesData = {
    labels: speciesLabels,
    datasets: [
      {
        label: 'Number of Animals',
        data: speciesLabels.map(species => livestock.bySpecies[species]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const speciesOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Livestock by Species',
      },
    },
  };

  // Health Status Chart
  const healthData = {
    labels: ['Healthy', 'Under Treatment'],
    datasets: [
      {
        data: [
          livestock.healthStatus?.healthy || 0,
          livestock.healthStatus?.under_treatment || 0,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const healthOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Health Status Overview',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Farm Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Treatment Trends */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Bar data={monthlyTreatmentData} options={monthlyOptions} />
        </div>

        {/* Treatment Status Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Doughnut data={statusData} options={statusOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Bar data={speciesData} options={speciesOptions} />
        </div>

        {/* Health Status Overview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Doughnut data={healthData} options={healthOptions} />
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {treatments.byMonth?.reduce((sum, num) => sum + num, 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Treatments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Object.values(livestock.bySpecies || {}).reduce((sum, num) => sum + num, 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Animals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Object.keys(livestock.bySpecies || {}).length || 0}
          </div>
          <div className="text-sm text-gray-600">Species Types</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {livestock.healthStatus?.healthy || 0}
          </div>
          <div className="text-sm text-gray-600">Healthy Groups</div>
        </div>
      </div>
    </div>
  );
};

export default Charts;