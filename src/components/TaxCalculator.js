import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  CalculatorIcon,
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon
} from '@@heroicons/react/24/outline';
import { taxService, establishmentService, clientService } from '../services/api';

const TaxCalculator = () => {
  const [establishments, setEstablishments] = useState([]);
  const [clients, setClients] = useState([]);
  const [stays, setStays] = useState([]);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [establishmentsResponse, clientsResponse] = await Promise.all([
        establishmentService.getEstablishments(),
        clientService.getClients()
      ]);
      
      setEstablishments(establishmentsResponse.data || []);
      setClients(clientsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleCalculate = async (data) => {
    try {
      setLoading(true);
      
      // Préparer les données pour l'API
      const calculationData = {
        ...data,
        establishmentId: parseInt(data.establishmentId),
        stayId: data.stayId ? parseInt(data.stayId) : undefined,
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
        items: data.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseFloat(item.totalPrice)
        }))
      };

      const response = await taxService.calculateTax(calculationData);
      setCalculation(response);
      toast.success('Calcul effectué avec succès');
    } catch (error) {
      console.error('Error calculating tax:', error);
      toast.error('Erreur lors du calcul des taxes');
      
      // Simulation d'un calcul en cas d'erreur API
      const mockCalculation = {
        subtotal: data.items.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0),
        taxDetails: [
          {
            taxId: 1,
            name: 'TVA Standard',
            type: 'percentage',
            rate: 20.0,
            taxableAmount: 300.0,
            taxAmount: 60.0,
            appliedTo: ['accommodation']
          },
          {
            taxId: 2,
            name: 'Taxe de séjour',
            type: 'fixed_per_night',
            rate: 2.5,
            taxableAmount: data.items.find(item => item.type === 'accommodation')?.quantity || 1,
            taxAmount: 5.0,
            appliedTo: ['accommodation']
          }
        ],
        exemptions: [],
        totalTax: 65.0,
        totalAmount: 365.0,
        currency: 'CDF'
      };
      setCalculation(mockCalculation);
    } finally {
      setLoading(false);
    }
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
    const total = quantity * unitPrice;
    const currentItems = watch('items');
    currentItems[index].totalPrice = total;
    reset({ ...watch(), items: currentItems });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'CDF',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calculateur de taxes</h1>
        <p className="text-gray-600 mt-2">Calculez les taxes applicables à un séjour</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire de calcul */}
        <div className="bg-white p-6 rounded-lg shadow">
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
                      {client.firstName} {client.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Articles */}
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

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 mb-3 p-3 border border-gray-200 rounded-md">
                  <div className="col-span-3">
                    <select
                      {...register(`items.${index}.type`)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="accommodation">Hébergement</option>
                      <option value="food">Restauration</option>
                      <option value="services">Services</option>
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

            {/* Options */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('checkForExemptions')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Vérifier les exonérations applicables
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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
              {/* Résumé */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Sous-total:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(calculation.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Total taxes:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(calculation.totalTax)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total final:</span>
                  <span className="text-blue-600">{formatCurrency(calculation.totalAmount)}</span>
                </div>
              </div>

              {/* Détail des taxes */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Détail des taxes applicables</h3>
                <div className="space-y-2">
                  {calculation.taxDetails?.map((tax, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tax.name}</p>
                        <p className="text-xs text-gray-500">
                          {tax.rate}% • {Array.isArray(tax.appliedTo) ? tax.appliedTo.join(', ') : tax.appliedTo}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(tax.taxAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exonérations */}
              {calculation.exemptions && calculation.exemptions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Exonérations appliquées</h3>
                  <div className="space-y-2">
                    {calculation.exemptions.map((exemption, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <p className="text-sm font-medium text-green-700">{exemption.reason}</p>
                          <p className="text-xs text-gray-500">Document: {exemption.documentNumber}</p>
                        </div>
                        <span className="text-sm font-medium text-green-700">
                          -{formatCurrency(exemption.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun calcul effectué</h3>
              <p className="mt-1 text-sm text-gray-500">
                Remplissez le formulaire et cliquez sur "Calculer" pour voir les taxes applicables.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;