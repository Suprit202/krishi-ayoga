// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16 cache-bust-1"> {/* Added h-16 */}
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full"> {/* Changed to h-full */}
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center justify-between text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-green-600 to-blue-800">
              <img src=".\favicon.png" width='40' height='40' />
              KrishiAyoga
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔔</span>
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">👤</span>
              <span className="text-sm text-gray-700">{user?.email}</span> {/* Changed to email */}
              
              <button
                onClick={logout}
                className="text-sm px-3 py-2 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 absolute top-16 left-0 right-0 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center space-x-2 py-2">
              <span className="text-lg">👤</span>
              <span className="text-sm text-gray-700">{user?.email}</span> {/* Changed to email */}
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <span className="text-lg">🔔</span>
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            
            <button
              onClick={logout}
              className="text-sm p-3 bg-primary-500 text-white hover:bg-primary-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;