// src/components/Livestock/LivestockGroupCard.jsx
import React from 'react';

const LivestockGroupCard = ({ group }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'under_treatment':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_sale':
        return 'bg-blue-100 text-blue-800';
      case 'quarantined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSpeciesIcon = (species) => {
    switch (species) {
      case 'Cattle':
        return '🐄';
      case 'Poultry':
        return '🐔';
      case 'Swine':
        return '🐖';
      case 'Sheep':
        return '🐑';
      case 'Goat':
        return '🐐';
      case 'Fish':
        return '🐟';
      default:
        return '🐾';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getSpeciesIcon(group.species)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{group.species}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(group.status)}`}>
          {group.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Total Animals</p>
          <p className="text-2xl font-bold text-gray-800">{group.count}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Active Treatments</p>
          <p className="text-2xl font-bold text-gray-800">
            {group.currentTreatments?.length || 0}
          </p>
        </div>
      </div>

      {group.currentTreatments && group.currentTreatments.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Treatments</h4>
          <div className="space-y-2">
            {group.currentTreatments.map((treatment, index) => (
              <div key={index} className="bg-yellow-50 p-2 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">{treatment.drugName}</span> - until {new Date(treatment.withdrawalEndDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
          View Details
        </button>
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm transition-colors">
          Add Treatment
        </button>
      </div>
    </div>
  );
};

export default LivestockGroupCard;