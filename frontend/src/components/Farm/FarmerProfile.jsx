// src/components/Profile/FarmerProfile.jsx
import React from 'react';
import FarmCreate from '../Farm/FarmCreate';
import FarmView from '../Farm/FarmView';

const FarmerProfile = ({ profileData, mode, onCreateSuccess, onEditSuccess, onCancel, onEdit }) => {
  switch (mode) {
    case 'create':
      return (
        <FarmCreate
          onSuccess={onCreateSuccess}
          onCancel={onCancel}
        />
      );

    case 'edit':
      return (
        <FarmCreate
          farmData={profileData}
          onSuccess={onEditSuccess}
          onCancel={onCancel}
          isEditing={true}
        />
      );

    case 'view':
      return (
        <FarmView
          farmData={profileData}
          onEdit={onEdit}
        />
      );

    default:
      return null;
  }
};

export default FarmerProfile;