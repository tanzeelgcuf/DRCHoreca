// src/components/TaxReports.js - Fixed with correct icon imports
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowDownTrayIcon as DownloadIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { taxService, establishmentService } from '../services/api';

const TaxReports = () => {
  const [reportData, setReportData] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      establishmentId: '',
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Début d'année
      endDate: new Date().toISOString().split('T')[0], // Aujourd'hui
      format: 'json'
    }
  });

  useEffect(() => {
    fetchEstablishments();
  }, []);

  const fetchEstablishments = async () => {
    try {
      const response = await establishmentService.getEstablishments();
      setEstablishments(response.data || []);
    } catch (error) {
      console.error('Error fetching establishments:', error);
      toast.error('Erreur lors du chargement des établissements');
    }
  };

  const handleGenerateReport = async (data) => {
    try {
      setLoading(true);
      const response = await taxService.getTaxReport(data);
      setReportData(response);
      setShowReport(true);
      toast.success('Rapport généré avec succès');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Couleurs pour les graphiques
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  // Préparation des données pour les graphiques
  const chartData = reportData?.summary?.byTaxType?.map((item, index) => ({
    name: item.name,
    amount: item.amountCollected,
    transactions: item.numberOfTransactions,
    rate: item.rate,
    color: COLORS[index % COLORS.length]
  })) || [];

  const categoryData = reportData?.summary?.byCategory ? 
    Object.entries(reportData.summary.byCategory).map(([key, value], index) => ({
      name: key,
      value: value,
      color: COLORS[index % COLORS.length]
    })) : [];

  const dailyData = reportData?.dailyBreakdown?.slice(-30) || []; // Derniers 30 jours

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rapports fiscaux</h1>
        <p className="text-gray-600 mt-2">Générez et analysez vos rapports de taxes</p>
      </div>

      {/* Formulaire de génération */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Générer un rapport</h2>
        
        <form onSubmit={handleSubmit(handleGenerateReport)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Établissement
              </label>
              <select
                {...register('establishmentId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les établissements</option>
                {establishments.map(est => (
                  <option key={est.id} value={est.id}>{est.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                {...register('startDate', { required: 'La date de début est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin *
              </label>
              <input
                type="date"
                {...register('endDate', { required: 'La date de fin est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Génération...
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Générer
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Affichage du rapport */}
      {showReport && reportData && (
        <div className="space-y-6">
          {/* Résumé */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Rapport fiscal - {reportData.establishmentName || 'Tous les établissements'}
              </h2>
              <div className="text-sm text-gray-500">
                Période: {formatDate(reportData.period.start)} - {formatDate(reportData.period.end)}
              </div>
            </div>

            {/* Métriques principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-600">Total collecté</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(reportData.summary.totalTaxCollected)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DocumentTextIcon className="w-8 h-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-600">Types de taxes</p>
                    <p className="text-2xl font-bold text-green-900">
                      {reportData.summary.byTaxType?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CalendarIcon className="w-8 h-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-yellow-600">Exonérations</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {formatCurrency(reportData.exemptions?.total || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="w-8 h-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-600">Nb. exonérations</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {reportData.exemptions?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Graphique en barres - Taxes par type */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Taxes collectées par type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="amount" fill="#3B82F6" name="Montant collecté" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique circulaire - Répartition par catégorie */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par catégorie</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Évolution quotidienne */}
            {dailyData.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution quotidienne (30 derniers jours)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `Date: ${formatDate(value)}`}
                      formatter={(value, name) => [
                        name === 'totalTax' ? formatCurrency(value) : value,
                        name === 'totalTax' ? 'Taxes' : 'Transactions'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="totalTax" fill="#10B981" name="Taxes collectées" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Détails par type de taxe */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Détail par type de taxe</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type de taxe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taux
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transactions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant collecté
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.summary.byTaxType?.map((tax, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {tax.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tax.rate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tax.numberOfTransactions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(tax.amountCollected)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exonérations détaillées */}
            {reportData.exemptions?.byType && reportData.exemptions.byType.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Détail des exonérations</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type d'exonération
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant exonéré
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.exemptions.byType.map((exemption, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {exemption.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {exemption.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {formatCurrency(exemption.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions d'export */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  const data = JSON.stringify(reportData, null, 2);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `rapport_fiscal_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                Télécharger JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message quand aucun rapport n'est affiché */}
      {!showReport && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rapport généré</h3>
          <p className="mt-1 text-sm text-gray-500">
            Sélectionnez une période et cliquez sur "Générer" pour voir votre rapport fiscal.
          </p>
        </div>
      )}
    </div>
  );
};

export default TaxReports;