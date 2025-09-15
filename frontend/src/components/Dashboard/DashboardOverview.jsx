// src/components/Dashboard/DashboardOverview.jsx
import React from 'react';

const DashboardOverview = ({ treatments, livestock, recentTreatments }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">📊 Dashboard Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-700">📈 Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Treatment Completion</span>
              <span className="font-semibold text-green-600">
                {treatments?.completed || 0}/{treatments?.total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Healthy Groups</span>
              <span className="font-semibold text-blue-600">
                {livestock?.healthy || 0}/{livestock?.totalGroups || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Animals/Group</span>
              <span className="font-semibold text-purple-600">
                {livestock?.totalGroups > 0 ? Math.round(livestock.totalAnimals / livestock.totalGroups) : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 text-gray-700">🎯 Action Items</h4>
          <div className="space-y-2">
            {livestock?.underTreatment > 0 && (
              <div className="flex items-center text-sm text-orange-600">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                {livestock.underTreatment} groups need attention
              </div>
            )}
            {treatments?.inProgress > 0 && (
              <div className="flex items-center text-sm text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {treatments.inProgress} treatments in progress
              </div>
            )}
            {(!livestock?.underTreatment && !treatments?.inProgress) && (
              <div className="text-sm text-green-600">
                ✅ All systems operational
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Highlights */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-yellow-800">⭐ Today's Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{treatments?.completed || 0}</div>
            <div className="text-gray-600">Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{livestock?.healthy || 0}</div>
            <div className="text-gray-600">Healthy Groups</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {recentTreatments?.length || 0}
            </div>
            <div className="text-gray-600">Recent Activities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;