// src/components/Dashboard/LivestockGroupsOverview.jsx
import React from 'react';
import Loader from '../UI/Loader';

const LivestockGroupsOverview = ({ livestockGroups, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Livestock Groups</h3>
        <div className="flex justify-center items-center h-32">
          <Loader size="small" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
        </svg>
        Livestock Groups
      </h3>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {livestockGroups.length > 0 ? (
          livestockGroups.map((group) => (
            <div key={group._id} className={`p-4 rounded-lg border-l-4 ${
              group.status === 'healthy' 
                ? 'border-green-400 bg-green-50' 
                : 'border-orange-400 bg-orange-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{group.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.status === 'healthy' 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-orange-200 text-orange-800'
                }`}>
                  {group.status === 'healthy' ? 'Healthy' : 'Needs Care'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                <div>
                  <span className="font-medium">Species:</span> {group.species}
                </div>
                <div>
                  <span className="font-medium">Count:</span> {group.count} animals
                </div>
                <div>
                  <span className="font-medium">Location:</span> {group.location || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Age:</span> {group.age || 'N/A'}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created: {new Date(group.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(group.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-4 0H9m4 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v12m4 0V9" />
            </svg>
            <p>No livestock groups found</p>
            <p className="text-sm mt-1">Create your first group to get started</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total Groups: {livestockGroups.length || 0}</span>
          <span>Total Animals: {livestockGroups.reduce((sum, group) => sum + (group.count || 0), 0) || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default LivestockGroupsOverview;