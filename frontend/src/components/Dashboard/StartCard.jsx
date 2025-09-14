// src/components/Dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, icon, color, subtitle, trend }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50'
  };

  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend > 0 ? '↗' : trend < 0 ? '↘' : '→';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mb-2">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`text-sm font-medium ${trendColor}`}>
              <span className="mr-1">{trendIcon}</span>
              {Math.abs(trend)}% from last week
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color] || colorClasses.blue}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;