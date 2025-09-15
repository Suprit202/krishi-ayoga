// src/components/Dashboard/RecentActivity.jsx
import React from 'react';

const RecentActivity = ({ recentTreatments }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">🕒 Recent Activity</h3>
      <div className="space-y-3">
        {recentTreatments?.length > 0 ? (
          recentTreatments.slice(0, 5).map((treatment, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {treatment.drugName} administered to {treatment.groupName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(treatment.dateAdministered).toLocaleDateString()} • 
                  {new Date(treatment.dateAdministered).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No recent activity</p>
            <p className="text-sm">Treatments will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;