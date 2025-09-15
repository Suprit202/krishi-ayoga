// src/components/Farm/FarmCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const FarmCreate = ({ farmData, onSuccess, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'dairy',
    size: '',
    establishedYear: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Pre-fill form if editing
  useEffect(() => {
    if (isEditing && farmData) {
      const { farm, farmer } = farmData;
      setFormData({
        name: farm.name || '',
        type: farm.type || 'dairy',
        size: farm.size || '',
        establishedYear: farm.establishedYear || '',
        phone: farmer.profile?.phone || '',
        address: farmer.profile?.address || ''
      });
    }
  }, [isEditing, farmData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        size: formData.size ? Number(formData.size) : 0,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : new Date().getFullYear(),
        phone: formData.phone,
        address: formData.address
      };

      if (isEditing) {
        await api.put('/farm/profile', payload);
      } else {
        await api.post('/farm/profile', payload);
      }

      onSuccess();
    } catch (error) {
      showNotification(
        error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} farm profile`,
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Edit Farm Profile' : 'Create Farm Profile'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farm Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter farm name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Farm Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="dairy">Dairy</option>
            <option value="poultry">Poultry</option>
            <option value="swine">Swine</option>
            <option value="aquaculture">Aquaculture</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Farm Size (acres)
            </label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Established Year
            </label>
            <input
              type="number"
              name="establishedYear"
              value={formData.establishedYear}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+91-9876543210"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your address"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader size="small" /> : (isEditing ? 'Update Profile' : 'Create Profile')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FarmCreate;