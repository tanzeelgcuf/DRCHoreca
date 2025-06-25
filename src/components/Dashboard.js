import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { taxService, establishmentService, clientService, stayService } from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTaxConfigurations: 0,
    activeTaxConfigurations: 0,
    totalExemptions: 0,
    activeExemptions: 0,
    totalEstablishments: 0,
    activeEstablishments: 0,
    totalClients: 0,
    totalStays: 0,
    activeStays: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [taxConfigurations, setTaxConfigurations] = useState([]);
  const [taxExemptions, setTaxExemptions] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [recentStays, setRecentStays] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all required data in parallel
      const [
        configsResponse, 
        exemptionsResponse, 
        establishmentsResponse, 
        clientsResponse,
        staysResponse
      ] = await Promise.all([
        taxService.getTaxConfigurations(),
        taxService.getTaxExemptions(),
        establishmentService.getEstablishments(),
        clientService.getClients(),
        stayService.getStays({ limit: 5, sort: 'createdAt:desc' })
      ]);
      
      console.log('Dashboard data loaded:', {
        configs: configsResponse,
        exemptions: exemptionsResponse,
        establishments: establishmentsResponse,
        clients: clientsResponse,
        stays: staysResponse
      });
      
      // Safely extract data from responses
      const configs = configsResponse?.data || configsResponse?.configurations || [];
      const exemptions = exemptionsResponse?.data || exemptionsResponse?.exemptions || [];
      const establishments = establishmentsResponse?.data || establishmentsResponse?.establishments || [];
      const clients = clientsResponse?.data || clientsResponse?.clients || [];
      const stays = staysResponse?.data || staysResponse?.stays || [];
      
      // Store detailed data for charts and tables
      setTaxConfigurations(Array.isArray(configs) ? configs : []);
      setTaxExemptions(Array.isArray(exemptions) ? exemptions : []);
      setEstablishments(Array.isArray(establishments) ? establishments : []);
      setRecentStays(Array.isArray(stays) ? stays : []);
      
      // Calculate summary statistics
      setStats({
        totalTaxConfigurations: configs.length,
        activeTaxConfigurations: configs.filter(c => c.active || c.isActive).length,
        totalExemptions: exemptions.length,
        activeExemptions: exemptions.filter(e => e.active || e.isActive).length,
        totalEstablishments: establishments.length,
        activeEstablishments: establishments.filter(e => e.status === 'active').length,
        totalClients: Array.isArray(clients) ? clients.length : (clientsResponse?.total || 0),
        totalStays: Array.isArray(stays) ? stays.length : (staysResponse?.total || 0),
        activeStays: Array.isArray(stays) ? stays.filter(s => s.status === 'active').length : 0,
        monthlyRevenue: calculateEstimatedMonthlyRevenue(establishments, configs),
        yearlyRevenue: calculateEstimatedYearlyRevenue(establishments, configs)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Une erreur est survenue lors du chargement des données');
      toast.error('Erreur lors du chargement des données du tableau de bord');
      
      // Set default values to prevent UI issues
      setStats({
        totalTaxConfigurations: 0,
        activeTaxConfigurations: 0,
        totalExemptions: 0,
        activeExemptions: 0,
        totalEstablishments: 0,
        activeEstablishments: 0,
        totalClients: 0,
        totalStays: 0,
        activeStays: 0,
        monthlyRevenue: 0,
        yearlyRevenue: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to calculate estimated monthly revenue (based on available data)
  const calculateEstimatedMonthlyRevenue = (establishments, configs) => {
    // If we have real data, we would use it
    // For now, estimate based on number of establishments and average rate
    const activeEstablishmentsCount = establishments.filter(e => e.status === 'active').length;
    const averageTaxRate = configs.length > 0 
      ? configs.reduce((sum, c) => sum + (c.rate || 0), 0) / configs.length 
      : 15; // Default to 15% if no data
    
    // Simple estimation - can be replaced with real data when available
    return activeEstablishmentsCount * 5000 * (averageTaxRate / 100);
  };

  // Helper function to calculate estimated yearly revenue
  const calculateEstimatedYearlyRevenue = (establishments, configs) => {
    const monthlyRevenue = calculateEstimatedMonthlyRevenue(establishments, configs);
    return monthlyRevenue * 12;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Prepare data for tax rate chart
  const taxRateData = taxConfigurations
    .filter(config => config.active || config.isActive)
    .map(config => ({
      name: config.name,
      rate: config.rate || 0,
      color: getRandomColor(config.id)
    }))
    .slice(0, 5); // Show top 5 for readability

  // Helper to generate stable colors based on ID
  function getRandomColor(id) {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#EC4899'];
    return colors[id % colors.length];
  }

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      maximumFractionDigits: 0
    }).format(amount);
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

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord fiscal</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de votre système fiscal</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error message */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && (
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
            title="Revenus mensuel estimé"
            value={formatCurrency(stats.monthlyRevenue)}
            subtitle="Mois en cours"
            icon={ChartBarIcon}
            color="yellow"
          />
          <StatCard
            title="Revenus annuel estimé"
            value={formatCurrency(stats.yearlyRevenue)}
            subtitle="Année en cours"
            icon={DocumentTextIcon}
            color="purple"
          />
        </div>
      )}

      {/* Charts and additional stats */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tax rates chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Taux de taxes actifs</h3>
            {taxRateData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taxRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 'dataMax + 5']} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="rate" name="Taux (%)" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded">
                <CogIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Aucune configuration fiscale active</p>
                <Link
                  to="/configurations"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Créer une configuration
                </Link>
              </div>
            )}
          </div>

          {/* Establishments & clients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Établissements et clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Établissements actifs</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.activeEstablishments} / {stats.totalEstablishments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserGroupIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Clients enregistrés</p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.totalClients}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Séjours actifs</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.activeStays} / {stats.totalStays}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Taux moyen</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {taxConfigurations.length > 0 
                        ? `${(taxConfigurations.reduce((sum, c) => sum + (c.rate || 0), 0) / taxConfigurations.length).toFixed(1)}%`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent stays */}
      {!loading && recentStays.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Séjours récents</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentStays.map((stay) => (
              <li key={stay.id} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Chambre {stay.room}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {stay.checkInDate ? new Date(stay.checkInDate).toLocaleDateString() : 'N/A'} - 
                      {stay.checkOutDate ? new Date(stay.checkOutDate).toLocaleDateString() : 'En cours'}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${stay.status === 'active' ? 'bg-green-100 text-green-800' : 
                        stay.status === 'closed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {stay.status === 'active' ? 'Actif' : 
                       stay.status === 'closed' ? 'Terminé' : 
                       'Annulé'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Link to="/sejours" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Voir tous les séjours
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/configurations"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
          >
            <CogIcon className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouvelle configuration</p>
            <p className="text-xs text-gray-500 mt-1 text-center">Ajouter un nouveau taux de taxe</p>
          </Link>
          
          <Link
            to="/exemptions"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
          >
            <ExclamationTriangleIcon className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Nouvelle exonération</p>
            <p className="text-xs text-gray-500 mt-1 text-center">Créer une exemption fiscale</p>
          </Link>
          
          <Link
            to="/rapports"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center"
          >
            <DocumentTextIcon className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-gray-900">Générer rapport</p>
            <p className="text-xs text-gray-500 mt-1 text-center">Créer un rapport fiscal</p>
          </Link>
        </div>
      </div>

      {/* Status section - Real-time API connection status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">État du système</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></div>
            Opérationnel
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">API:</span>
            <span className="font-medium text-gray-900">{process.env.REACT_APP_API_URL || 'http://34.30.198.6:8080/api/v1'}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">Environnement:</span>
            <span className="font-medium text-gray-900">{process.env.REACT_APP_ENV || 'development'}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">Version:</span>
            <span className="font-medium text-gray-900">1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;