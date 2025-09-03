// src/pages/Livestock.jsx
import React, { useState } from 'react';
import LivestockGroupCard from '../components/Livestock/LivestockGroupCard';
import LivestockForm from '../components/Livestock/LivestockForm';

const Livestock = () => {
  const [showForm, setShowForm] = useState(false);
  
  // Mock data - this will come from your API
  const livestockGroups = [
    {
      _id: '1',
      name: 'Dairy Cows - Block A',
      species: 'Cattle',
      count: 25,
      status: 'healthy',
      currentTreatments: []
    },
    {
      _id: '2',
      name: 'Organic Chickens',
      species: 'Poultry',
      count: 500,
      status: 'under_treatment',
      currentTreatments: [
        {
          drugName: 'Oxytetracycline',
          withdrawalEndDate: '2025-09-18T15:12:16.557Z'
        }
      ]
    }
  ];

  const handleCreateGroup = (formData) => {
    console.log('Creating new group:', formData);
    // Here you would call your API to create the group
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Livestock Management</h1>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            + Add New Group
          </button>
        )}
      </div>

      {showForm ? (
        <LivestockForm 
          onSubmit={handleCreateGroup}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livestockGroups.map(group => (
            <LivestockGroupCard key={group._id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Livestock;