// src/components/Layout/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../UI/Loader';

const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Fixed Header */}
      <Header />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden pt-16"> {/* Add pt-16 for header height */}
        {/* Fixed Sidebar */}
        <Sidebar />
        
        {/* Main content - pushed right by sidebar width and down by header height */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto md:ml-64">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;