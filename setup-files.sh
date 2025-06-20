#!/bin/bash

# Script to create all necessary files for DRC Tax Platform in VS Code
# Run this in your project root directory

echo "Creating DRC Tax Platform files..."

# Create directories
mkdir -p src/components src/services src/styles src/types

# Create API Service
cat > src/services/api.js << 'EOF'
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('drc_token');
      window.location.href = '/';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Authentication service
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('drc_token');
    }
  }
};

// Tax configuration service
export const taxService = {
  // Tax Configurations
  getTaxConfigurations: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/taxes/configurations${queryString ? `?${queryString}` : ''}`);
    return response;
  },

  getTaxConfiguration: async (id) => {
    const response = await api.get(`/taxes/configurations/${id}`);
    return response;
  },

  createTaxConfiguration: async (data) => {
    const response = await api.post('/taxes/configurations', data);
    return response;
  },

  updateTaxConfiguration: async (id, data) => {
    const response = await api.put(`/taxes/configurations/${id}`, data);
    return response;
  },

  deleteTaxConfiguration: async (id) => {
    const response = await api.delete(`/taxes/configurations/${id}`);
    return response;
  },

  // Tax Exemptions
  getTaxExemptions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/taxes/exemptions${queryString ? `?${queryString}` : ''}`);
    return response;
  },

  createTaxExemption: async (data) => {
    const response = await api.post('/taxes/exemptions', data);
    return response;
  },

  updateTaxExemption: async (id, data) => {
    const response = await api.put(`/taxes/exemptions/${id}`, data);
    return response;
  },

  deleteTaxExemption: async (id) => {
    const response = await api.delete(`/taxes/exemptions/${id}`);
    return response;
  },

  // Tax Reports
  getTaxReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/taxes/report${queryString ? `?${queryString}` : ''}`);
    return response;
  },

  // Tax Calculation
  calculateTax: async (data) => {
    const response = await api.post('/taxes/calculate', data);
    return response;
  }
};

// Establishment service
export const establishmentService = {
  getEstablishments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/establishments${queryString ? `?${queryString}` : ''}`);
    return response;
  }
};

// Client service
export const clientService = {
  getClients: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/clients${queryString ? `?${queryString}` : ''}`);
    return response;
  }
};

export default api;
EOF

# Create Login Component
cat > src/components/Login.js << 'EOF'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.login(data.username, data.password);
      toast.success('Connexion réussie!');
      onLogin(response.token, response.user);
    } catch (error) {
      toast.error('Erreur de connexion. Vérifiez vos identifiants.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Plateforme Fiscale DRC
            </h2>
            <p className="text-gray-600 mb-8">
              Connectez-vous à votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                id="username"
                type="text"
                {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre nom d'utilisateur"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Le mot de passe est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez votre mot de passe"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Besoin d'aide? Contactez votre administrateur système
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
EOF

# Create Sidebar Component
cat > src/components/Sidebar.js << 'EOF'
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
EOF

# Create Header Component  
cat > src/components/Header.js << 'EOF'
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
EOF

# Create Dashboard Component (simplified for development)
cat > src/components/Dashboard.js << 'EOF'
import React, { useState, useEffect } from 'react';
import { ChartBarIcon, CogIcon, ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { taxService } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTaxConfigurations: 0,
    activeTaxConfigurations: 0,
    totalExemptions: 0,
    activeExemptions: 0,
    monthlyRevenue: 15240,
    yearlyRevenue: 182880
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real data, but use mock data if API is not available
      try {
        const configs = await taxService.getTaxConfigurations();
        const exemptions = await taxService.getTaxExemptions();
        
        setStats(prev => ({
          ...prev,
          totalTaxConfigurations: configs.data?.length || 0,
          activeTaxConfigurations: configs.data?.filter(c => c.isActive)?.length || 0,
          totalExemptions: exemptions.data?.length || 0,
          activeExemptions: exemptions.data?.filter(e => e.isActive)?.length || 0
        }));
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Use mock data for development
        setStats({
          totalTaxConfigurations: 5,
          activeTaxConfigurations: 4,
          totalExemptions: 8,
          activeExemptions: 6,
          monthlyRevenue: 15240,
          yearlyRevenue: 182880
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord fiscal</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble de votre système fiscal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Configurations actives"
          value={stats.activeTaxConfigurations}
          subtitle={`sur ${stats.totalTaxConfigurations} total`}
          icon={CogIcon}
          color="blue"
        />
        <StatCard
          title="Exonérations actives"
          value={stats.activeExemptions}
          subtitle={`sur ${stats.totalExemptions} total`}
          icon={ExclamationTriangleIcon}
          color="green"
        />
        <StatCard
          title="Revenus mensuel"
          value={`${stats.monthlyRevenue.toLocaleString('fr-FR')} €`}
          subtitle="Mois en cours"
          icon={ChartBarIcon}
          color="yellow"
        />
        <StatCard
          title="Revenus annuel"
          value={`${stats.yearlyRevenue.toLocaleString('fr-FR')} €`}
          subtitle="Année en cours"
          icon={DocumentTextIcon}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/configurations'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CogIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouvelle configuration</p>
            <p className="text-xs text-gray-500 mt-1">Ajouter un nouveau taux de taxe</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/exemptions'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouvelle exonération</p>
            <p className="text-xs text-gray-500 mt-1">Créer une exemption fiscale</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/rapports'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Générer rapport</p>
            <p className="text-xs text-gray-500 mt-1">Créer un rapport fiscal</p>
          </button>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Mode développement
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Cette interface utilise des données de démonstration. 
                Connectez votre API DRC pour afficher les vraies données.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
EOF

echo "✅ Core files created successfully!"
echo ""
echo "Next: Create the main App.js file with the content from the artifacts above"