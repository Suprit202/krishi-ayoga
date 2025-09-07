// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  BarChart3,
  LogOut,
  Users,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Treatments', href: '/treatments', icon: PlusCircle },
    { name: 'Livestock', href: '/livestock', icon: Users },
    { name: 'Farms', href: '/farms', icon: Building2 },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-white w-64 fixed top-16 left-0 bottom-0 border-r border-gray-200 hidden md:block z-40">
      <div className="p-4 h-full flex flex-col">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Navigation</h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-auto">
          <div className="px-3 py-2">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="text-sm font-medium text-gray-800">{user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors mt-2"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;