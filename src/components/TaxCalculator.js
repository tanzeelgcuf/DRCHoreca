import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { taxService, establishmentService, clientService, stayService } from '../services/api';

const TaxCalculator = () => {
  const [establishments, setEstablishments] = useState([]);
  const [clients, setClients] = useState([]);
  const [stays, setStays] = useState([]);
  const [taxConfigurations, setTaxConfigurations] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      establishmentId: '',
      stayId: '',
      clientId: '',
      items: [
        {
          type: 'accommodation',
          description: 'Chambre standard',
          quantity: 1,
          unitPrice: 100,
          totalPrice: 100
        }
      ],
      checkForExemptions: true
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchEstablishmentId = watch('establishmentId');
  const watchClientId = watch('clientId');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (watchEstablishmentId) {
      fetchStaysForEstablishment(watchEstablishmentId);
      fetchTaxConfigurations(watchEstablishmentId);
    }
  }, [watchEstablishmentId]);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      console.log('Fetching initial data for tax calculator');
      
      const [establishmentsResponse, clientsResponse] = await Promise.all([
        establishmentService.getEstablishments(),
        clientService.getClients()
      ]);
      
      console.log('Initial data responses:', {
        establishments: establishmentsResponse,
        clients: clientsResponse
      });
      
      // Safely handle the response structure
      const establishmentsData = establishmentsResponse?.data || establishmentsResponse?.establishments || [];
      const clientsData = clientsResponse?.data || clientsResponse?.clients || [];
      
      setEstablishments(Array.isArray(establishmentsData) ? establishmentsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error.message || 'Erreur lors du chargement des données initiales');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  };

  const fetchStaysForEstablishment = async (establishmentId) => {
    try {
      console.log('Fetching stays for establishment:', establishmentId);
      
      const response = await stayService.getStays({ 
        establishmentId,
        status: 'active'
      });
      
      console.log('Stays response:', response);
      
      // Safely handle the response structure
      const staysData = response?.data || response?.stays || [];
      setStays(Array.isArray(staysData) ? staysData : []);
    } catch (error) {
      console.error('Error fetching stays:', error);
      setStays([]);
    }
  };

  const fetchTaxConfigurations = async (establishmentId) => {
    try {
      console.log('Fetching tax configurations for establishment:', establishmentId);
      
      const response = await taxService.getTaxConfigurations({ 
        establishmentId,
        active: true
      });
      
      console.log('Tax configurations response:', response);
      
      // Safely handle the response structure
      const configsData = response?.data || response?.configurations || [];
      setTaxConfigurations(Array.isArray(configsData) ? configsData : []);
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
      setTaxConfigurations([]);
    }
  };

  const handleCalculate = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare data for API call according to backend spec
      const calculationData = {
        establishmentId: parseInt(data.establishmentId),
        stayId: data.stayId ? parseInt(data.stayId) : undefined,
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
        items: data.items.map(item => ({
          type: item.type,
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0
        })),
        checkForExemptions: data.checkForExemptions
      };

      console.log('Sending calculation request:', calculationData);
      
      const response = await taxService.calculateTax(calculationData);
      console.log('Calculation response:', response);
      
      setCalculation(response);
      toast.success('Calcul effectué avec succès');
    } catch (error) {
      console.error('Error calculating tax:', error);
      setError(error.message || 'Erreur lors du calcul des taxes');
      toast.error(error.message || 'Erreur lors du calcul des taxes');
      
      // Show more specific error details if available
      if (error.details) {
        Object.entries(error.details).forEach(([field, messages]) => {
          messages.forEach(message => toast.error(`${field}: ${message}`));
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
    setCalculation(null);
  };

  const addItem = () => {
    append({
      type: 'accommodation',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
  };

  const updateItemTotal = (index, quantity, unitPrice) => {
    const total = (quantity || 0) * (unitPrice || 0);
    const currentItems = watch('items');
    currentItems[index].totalPrice = total;
    reset({ ...watch(), items: currentItems });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

  const getStayInfo = (stayId) => {
    const stay = stays.find(s => s.id === parseInt(stayId));
    return stay ? `Chambre ${stay.room} (${stay.duration} nuits)` : 'Séjour inconnu';
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement des données...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calculateur de taxes</h1>
          <p className="text-gray-600 mt-2">Calculez les taxes applicables à un séjour selon votre configuration</p>
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

      {/* Error message */}
      {error && (
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Formulaire de calcul */}
        <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informations du séjour</h2>
          
          <form onSubmit={handleSubmit(handleCalculate)} className="space-y-4">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Établissement *
                </label>
                <select
                  {...register('establishmentId', { required: 'L\'établissement est requis' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un établissement</option>
                  {establishments.map(est => (
                    <option key={est.id} value={est.id}>{est.name}</option>
                  ))}
                </select>
                {errors.establishmentId && (
                  <p className="text-red-500 text-sm mt-1">{errors.establishmentId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client (optionnel)
                </label>
                <select
                  {...register('clientId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} - {client.nationality}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Séjour (si applicable) */}
            {watchEstablishmentId && stays.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Séjour associé (optionnel)
                </label>
                <select
                  {...register('stayId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionnez un séjour</option>
                  {stays.map(stay => (
                    <option key={stay.id} value={stay.id}>
                      Chambre {stay.room} - {stay.duration || '?'} nuits 
                      {stay.clientId && clients.find(c => c.id === stay.clientId) ? 
                        ` (${clients.find(c => c.id === stay.clientId).firstName} ${clients.find(c => c.id === stay.clientId).lastName})` :
                        ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Articles / Services */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Articles / Services
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-2 p-3 border border-gray-200 rounded-md">
                    <div className="col-span-3">
                      <select
                        {...register(`items.${index}.type`)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="accommodation">Hébergement</option>
                        <option value="food">Restauration</option>
                        <option value="services">Services</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        {...register(`items.${index}.description`)}
                        placeholder="Description"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        {...register(`items.${index}.quantity`, {
                          onChange: (e) => {
                            const quantity = parseInt(e.target.value) || 0;
                            const unitPrice = parseFloat(watch(`items.${index}.unitPrice`)) || 0;
                            updateItemTotal(index, quantity, unitPrice);
                          }
                        })}
                        placeholder="Qté"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`items.${index}.unitPrice`, {
                          onChange: (e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            const quantity = parseInt(watch(`items.${index}.quantity`)) || 0;
                            updateItemTotal(index, quantity, unitPrice);
                          }
                        })}
                        placeholder="Prix unitaire"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.totalPrice`)}
                        placeholder="Total"
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('checkForExemptions')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Vérifier les exonérations applicables pour ce client
                </span>
              </label>
            </div>

            {/* Configuration fiscale info */}
            {watchEstablishmentId && taxConfigurations.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Configurations fiscales actives ({taxConfigurations.length})
                </h4>
                <div className="space-y-1">
                  {taxConfigurations.slice(0, 3).map(config => (
                    <div key={config.id} className="text-xs text-blue-700">
                      • {config.name}: {config.rate}% 
                      {config.type === 'fixed_per_night' && ' par nuit'}
                      {config.type === 'fixed_amount' && ' montant fixe'}
                    </div>
                  ))}
                  {taxConfigurations.length > 3 && (
                    <div className="text-xs text-blue-600">
                      ... et {taxConfigurations.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !watchEstablishmentId}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calcul en cours...
                </>
              ) : (
                <>
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Calculer les taxes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Résultats du calcul */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Résultats du calcul</h2>
          
          {calculation ? (
            <div className="space-y-4">
              {/* Résumé principal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sous-total:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(calculation.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total taxes:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(calculation.totalTax)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total final:</span>
                    <span className="text-blue-600">{formatCurrency(calculation.totalAmount)}</span>
                  </div>
                </div>
                {calculation.currency && (
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    Montants en {calculation.currency}
                  </div>
                )}
              </div>

              {/* Détail des taxes */}
              {calculation.taxDetails && calculation.taxDetails.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                    Détail des taxes applicables
                  </h3>
                  <div className="space-y-2">
                    {calculation.taxDetails.map((tax, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 border border-gray-200 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{tax.name}</p>
                          <p className="text-xs text-gray-500">
                            {tax.rate}%
                            {tax.type === 'fixed_per_night' && ' par nuit'}
                            {tax.type === 'fixed_amount' && ' montant fixe'}
                            {tax.appliedTo && ` • ${Array.isArray(tax.appliedTo) ? tax.appliedTo.join(', ') : tax.appliedTo}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(tax.taxAmount)}
                          </span>
                          {tax.taxableAmount && (
                            <div className="text-xs text-gray-500">
                              sur {formatCurrency(tax.taxableAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exonérations */}
              {calculation.exemptions && calculation.exemptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1 text-green-600" />
                    Exonérations appliquées
                  </h3>
                  <div className="space-y-2">
                    {calculation.exemptions.map((exemption, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-green-50 border border-green-200 rounded">
                        <div>
                          <p className="text-sm font-medium text-green-700">{exemption.reason}</p>
                          {exemption.documentNumber && (
                            <p className="text-xs text-gray-500">Document: {exemption.documentNumber}</p>
                          )}
                        </div>
                        <span className="text-sm font-medium text-green-700">
                          -{formatCurrency(exemption.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informations du calcul */}
              <div className="text-xs text-gray-500 space-y-1 p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <span>Établissement:</span>
                  <span>{establishments.find(e => e.id === parseInt(watchEstablishmentId))?.name}</span>
                </div>
                {watchClientId && (
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span>{getClientName(watchClientId)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Calculé le:</span>
                  <span>{new Date().toLocaleString('fr-FR')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const data = {
                      calculation,
                      establishment: establishments.find(e => e.id === parseInt(watchEstablishmentId)),
                      client: watchClientId ? clients.find(c => c.id === parseInt(watchClientId)) : null,
                      timestamp: new Date().toISOString()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `calcul_taxes_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Exporter le calcul
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Imprimer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun calcul effectué</h3>
              <p className="mt-1 text-sm text-gray-500">
                Remplissez le formulaire et cliquez sur "Calculer" pour voir les taxes applicables.
              </p>
              
              {!watchEstablishmentId && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Établissement requis
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        Sélectionnez d'abord un établissement pour voir ses configurations fiscales.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;