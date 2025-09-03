// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmGuard
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔔</span> {/* Bell emoji */}
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">👤</span> {/* User emoji */}
              <span className="text-sm text-gray-700">{user?.name}</span>
              
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 ml-4"
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
              {isMobileMenuOpen ? '✕' : '☰'} {/* Hamburger and close icons */}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <div className="flex items-center space-x-2 py-2">
              <span className="text-lg">👤</span> {/* User emoji */}
              <span className="text-sm text-gray-700">{user?.name}</span>
            </div>
            
            <div className="flex items-center space-x-2 py-2">
              <span className="text-lg">🔔</span> {/* Bell emoji */}
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            
            <button
              onClick={logout}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; // ✅ Make sure this is default export