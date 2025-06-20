import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Vue d\'ensemble des taxes'
    },
    {
      name: 'Configurations fiscales',
      href: '/configurations',
      icon: CogIcon,
      description: 'Gérer les taux de taxe'
    },
    {
      name: 'Exonérations',
      href: '/exemptions',
      icon: ExclamationTriangleIcon,
      description: 'Gérer les exemptions fiscales'
    },
    {
      name: 'Rapports',
      href: '/rapports',
      icon: ChartBarIcon,
      description: 'Rapports et analyses fiscales'
    }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">DRC Fiscalité</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                ${isActive(item.href)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`
                  w-5 h-5 mr-3
                  ${isActive(item.href) ? 'text-blue-600' : 'text-gray-400'}
                `}
              />
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-500 mt-1">{item.description}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>© 2024 DRC API</p>
          <p>Plateforme de gestion fiscale</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
