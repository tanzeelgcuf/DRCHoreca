// src/components/Sidebar.js - Updated with user management and better navigation
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Vue d\'ensemble des taxes',
      roles: ['admin', 'manager', 'staff']
    },
    {
      name: 'Configurations fiscales',
      href: '/configurations',
      icon: CogIcon,
      description: 'Gérer les taux de taxe',
      roles: ['admin', 'manager']
    },
    {
      name: 'Exonérations',
      href: '/exemptions',
      icon: ExclamationTriangleIcon,
      description: 'Gérer les exemptions fiscales',
      roles: ['admin', 'manager', 'staff']
    },
    {
      name: 'Calculateur',
      href: '/calculateur',
      icon: CalculatorIcon,
      description: 'Calculer les taxes',
      roles: ['admin', 'manager', 'staff']
    },
    {
      name: 'Rapports',
      href: '/rapports',
      icon: ChartBarIcon,
      description: 'Rapports et analyses fiscales',
      roles: ['admin', 'manager']
    },
    {
      name: 'Utilisateurs',
      href: '/utilisateurs',
      icon: UserGroupIcon,
      description: 'Gestion des utilisateurs',
      roles: ['admin']
    }
  ];

  const isActive = (href) => location.pathname === href;

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !user?.role || item.roles.includes(user.role)
  );

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">DRC Fiscalité</h1>
          <p className="text-xs text-blue-100">Plateforme de gestion</p>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {user.role === 'admin' ? 'Administrateur' : 
                 user.role === 'manager' ? 'Gestionnaire' : 'Personnel'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                ${active
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`
                  w-5 h-5 mr-3
                  ${active ? 'text-blue-600' : 'text-gray-400'}
                `}
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              </div>
              {item.name === 'Utilisateurs' && user?.role === 'admin' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Admin
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex items-center justify-between">
            <span>© 2024 DRC API</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-600">Connecté</span>
            </div>
          </div>
          
          <div className="text-center">
            <p>Plateforme de gestion fiscale</p>
            <p className="text-blue-600">Version 1.0.0</p>
          </div>

          {user?.establishmentId && (
            <div className="flex items-center text-gray-600">
              <BuildingOfficeIcon className="w-3 h-3 mr-1" />
              <span>Établissement #{user.establishmentId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;