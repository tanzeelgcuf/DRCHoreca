// src/components/Header.js - Enhanced with connection status and better UX
import React, { useState } from 'react';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Header = ({ user, onLogout, connectionStatus }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm">Connecté au serveur</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center text-yellow-600">
            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm">Mode hors ligne</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
            <span className="text-sm">Erreur de connexion</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm">Vérification...</span>
          </div>
        );
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Plateforme de gestion fiscale DRC
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                {getConnectionStatusBadge()}
                <div className="text-xs text-gray-500">
                  Serveur: {process.env.REACT_APP_API_URL?.includes('34.30.198.6') ? '34.30.198.6' : 'Local'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full">
              <BellIcon className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <div className="text-xs text-gray-500">
                      {user?.role === 'admin' ? 'Administrateur' : 
                       user?.role === 'manager' ? 'Gestionnaire' : 'Personnel'}
                    </div>
                  </div>
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon className="w-4 h-4 mr-3" />
                      Mon profil
                    </button>
                    
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3" />
                      Paramètres
                    </button>
                    
                    <div className="border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;