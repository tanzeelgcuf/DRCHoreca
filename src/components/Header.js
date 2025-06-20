import React from 'react';
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Plateforme de gestion fiscale
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Administrateur' : 
                 user?.role === 'manager' ? 'Gestionnaire' : 'Utilisateur'}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
