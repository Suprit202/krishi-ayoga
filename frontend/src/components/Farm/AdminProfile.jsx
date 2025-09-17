// src/components/Profile/AdminProfile.jsx - UPDATED
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import Loader from '../UI/Loader';

const AdminProfileCreate = ({ profileData, onSuccess, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isEditing && profileData?.farmer) {
      setFormData({
        name: profileData.farmer.name || '',
        email: profileData.farmer.email || '',
        phone: profileData.farmer.profile?.phone || '',
        department: profileData.farmer.profile?.department || '',
        position: profileData.farmer.profile?.position || '',
        address: profileData.farmer.profile?.address || ''
      });
    }
  }, [isEditing, profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the farm profile endpoint with admin-specific fields
      await api.put('/farm/profile', {
        phone: formData.phone,
        address: formData.address,
        name: formData.name,
        email: formData.email,
        // Store admin-specific fields in profile
        department: formData.department,
        position: formData.position
      });

      onSuccess();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} admin profile:`, error);
      showNotification(`Failed to ${isEditing ? 'update' : 'create'} admin profile`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit' : 'Create'} Admin Profile
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
            Contact Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
            Department *
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="position">
            Position *
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

const AdminProfileView = ({ profileData, onEdit }) => {
  if (!profileData?.farmer) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="mb-4">No admin profile found.</p>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Admin Profile
        </button>
      </div>
    );
  }

  const { name, email, profile } = profileData.farmer;
  const { phone, department, position, address } = profile || {};

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Profile</h2>
        <button
          onClick={onEdit}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">👤 Personal Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {name}</p>
            <p><span className="font-medium">Email:</span> {email}</p>
            <p><span className="font-medium">Contact Number:</span> {phone || 'Not provided'}</p>
            {address && <p><span className="font-medium">Address:</span> {address}</p>}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-3">🏢 Professional Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Department:</span> {department || 'Not provided'}</p>
            <p><span className="font-medium">Position:</span> {position || 'Not provided'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProfile = ({ profileData, mode, onCreateSuccess, onEditSuccess, onCancel, onEdit }) => {
  switch (mode) {
    case 'create':
      return (
        <AdminProfileCreate
          onSuccess={onCreateSuccess}
          onCancel={onCancel}
        />
      );

    case 'edit':
      return (
        <AdminProfileCreate
          profileData={profileData}
          onSuccess={onEditSuccess}
          onCancel={onCancel}
          isEditing={true}
        />
      );

    case 'view':
      return (
        <AdminProfileView
          profileData={profileData}
          onEdit={onEdit}
        />
      );

    default:
      return null;
  }
};

export default AdminProfile;