// src/components/Farm/FarmView.jsx
import React from 'react';

const FarmView = ({ farmData, onEdit }) => {
  const { farm, farmer } = farmData;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Farm Profile</h1>
        <button
          onClick={onEdit}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Farm Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800 mb-3">🏭 Farm Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {farm.name}</p>
            <p><span className="font-medium">Type:</span> {farm.type}</p>
            <p><span className="font-medium">Size:</span> {farm.size} acres</p>
            <p><span className="font-medium">Established:</span> {farm.establishedYear}</p>
            {farm.registrationId && (
              <p><span className="font-medium">Registration ID:</span> {farm.registrationId}</p>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-3">📞 Contact Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Farmer Name:</span> {farmer.name}</p>
            <p><span className="font-medium">Email:</span> {farmer.email}</p>
            <p><span className="font-medium">Phone:</span> {farmer.profile?.phone || 'Not provided'}</p>
            {farmer.profile?.address && (
              <p><span className="font-medium">Address:</span> {farmer.profile.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">ℹ️ Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span className="font-medium">Role:</span> {farmer.role}</p>
            {farmer.profile?.experience && (
              <p><span className="font-medium">Experience:</span> {farmer.profile.experience} years</p>
            )}
          </div>
          <div>
            {farmer.profile?.qualifications?.length > 0 && (
              <p><span className="font-medium">Qualifications:</span> {farmer.profile.qualifications.join(', ')}</p>
            )}
            {farmer.profile?.specialization?.length > 0 && (
              <p><span className="font-medium">Specialization:</span> {farmer.profile.specialization.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmView;