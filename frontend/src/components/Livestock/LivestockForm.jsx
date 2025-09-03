// src/components/Livestock/LivestockForm.jsx
import React, { useState } from 'react';

const LivestockForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    count: '',
    notes: ''
  });

  const speciesOptions = [
    { value: 'Cattle', label: 'Cattle 🐄' },
    { value: 'Poultry', label: 'Poultry 🐔' },
    { value: 'Swine', label: 'Swine 🐖' },
    { value: 'Sheep', label: 'Sheep 🐑' },
    { value: 'Goat', label: 'Goat 🐐' },
    { value: 'Fish', label: 'Fish 🐟' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Livestock Group</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Dairy Cows - Block A"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select Species</option>
            {speciesOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Animals
          </label>
          <input
            type="number"
            name="count"
            value={formData.count}
            onChange={handleChange}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., 25"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Any additional information about this group..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Create Group
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LivestockForm;