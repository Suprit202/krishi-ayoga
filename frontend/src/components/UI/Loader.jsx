// src/components/UI/Loader.jsx
import React from 'react';

const Loader = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };
  
  return (
    <div className={`flex justify-center items-center min-h-screen ${className}`}>
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}></div>
    </div>
  );
};

export default Loader;