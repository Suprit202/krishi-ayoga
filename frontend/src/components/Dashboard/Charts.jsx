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

const Charts = ({ dashboardData }) => {
  // Extract data from dashboard response
  const treatments = dashboardData?.treatments || [];
  const livestockGroups = dashboardData?.livestock?.groups || [];
  const livestockStats = dashboardData?.livestock || {};

  // Calculate monthly treatment data
  const calculateMonthlyTreatments = () => {
    const monthlyData = Array(12).fill(0);
    
    treatments.forEach(treatment => {
      if (treatment.dateAdministered) {
        const month = new Date(treatment.dateAdministered).getMonth();
        monthlyData[month] += 1;
      }
    });
    
    return monthlyData;
  };

  // Calculate species distribution
  const calculateSpeciesDistribution = () => {
    const bySpecies = {};
    
    livestockGroups.forEach(group => {
      if (group.species) {
        bySpecies[group.species] = (bySpecies[group.species] || 0) + (group.count || 0);
      }
    });
    
    return bySpecies;
  };

  // Calculate health status
  const calculateHealthStatus = () => {
    const healthStatus = { healthy: 0, under_treatment: 0 };
    
    livestockGroups.forEach(group => {
      if (group.status === 'healthy') {
        healthStatus.healthy += 1;
      } else if (group.status === 'under_treatment') {
        healthStatus.under_treatment += 1;
      }
    });
    
    return healthStatus;
  };

  // Calculate treatment status
  const calculateTreatmentStatus = () => {
    const statusCount = { completed: 0, inProgress: 0, scheduled: 0 };
    
    treatments.forEach(treatment => {
      if (treatment.status === 'completed') {
        statusCount.completed += 1;
      } else if (treatment.status === 'in_progress') {
        statusCount.inProgress += 1;
      } else if (treatment.status === 'scheduled') {
        statusCount.scheduled += 1;
      }
    });
    
    return statusCount;
  };

  // Get calculated data
  const monthlyTreatmentData = calculateMonthlyTreatments();
  const speciesDistribution = calculateSpeciesDistribution();
  const healthStatus = calculateHealthStatus();
  const treatmentStatus = calculateTreatmentStatus();

  // Treatment Trends Chart (Monthly)
  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Treatments per Month',
        data: monthlyTreatmentData,
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
  const statusChartData = {
    labels: ['Completed', 'In Progress', 'Scheduled'],
    datasets: [
      {
        data: [
          treatmentStatus.completed,
          treatmentStatus.inProgress,
          treatmentStatus.scheduled,
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
  const speciesLabels = Object.keys(speciesDistribution);
  const speciesChartData = {
    labels: speciesLabels,
    datasets: [
      {
        label: 'Number of Animals',
        data: speciesLabels.map(species => speciesDistribution[species]),
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
  const healthChartData = {
    labels: ['Healthy', 'Under Treatment'],
    datasets: [
      {
        data: [
          healthStatus.healthy,
          healthStatus.under_treatment,
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

  // Calculate totals for summary
  const totalTreatments = treatments.length;
  const totalAnimals = livestockStats.totalAnimals || 0;
  const totalSpecies = Object.keys(speciesDistribution).length;
  const healthyGroups = healthStatus.healthy;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-6">Farm Analytics Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Monthly Treatment Trends */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Bar data={monthlyChartData} options={monthlyOptions} />
        </div>

        {/* Treatment Status Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Doughnut data={statusChartData} options={statusOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Bar data={speciesChartData} options={speciesOptions} />
        </div>

        {/* Health Status Overview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Doughnut data={healthChartData} options={healthOptions} />
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600">
            {totalTreatments}
          </div>
          <div className="text-sm text-gray-600">Total Treatments</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalAnimals}
          </div>
          <div className="text-sm text-gray-600">Total Animals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalSpecies}
          </div>
          <div className="text-sm text-gray-600">Species Types</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {healthyGroups}
          </div>
          <div className="text-sm text-gray-600">Healthy Groups</div>
        </div>
      </div>

      {/* Empty State */}
      {totalTreatments === 0 && livestockGroups.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h4>
          <p className="text-gray-600">
            Start adding livestock and treatments to see analytics here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Charts;