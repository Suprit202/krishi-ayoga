// src/components/Farm/Farm.jsx
import React from 'react';

const Farms = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Farm Management</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-700">Green Valley Dairy Farm</h3>
            <p className="text-sm text-gray-500">Maharashtra, India</p>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Contact Information</h4>
            <p className="text-sm text-blue-700">📞 +91-9876543210</p>
            <p className="text-sm text-blue-700">📧 info@greenvalleydairy.com</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Farm Details</h4>
            <p className="text-sm text-green-700">🏭 Type: Dairy</p>
            <p className="text-sm text-green-700">📋 ID: FARM-001</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Quick Actions</h4>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
              Edit Farm
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
              Add Livestock
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farms;