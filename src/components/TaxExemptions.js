import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { taxService, establishmentService, clientService } from '../services/api';

const TaxExemptions = () => {
  const [exemptions, setExemptions] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [clients, setClients] = useState([]);
  const [taxConfigurations, setTaxConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExemption, setEditingExemption] = useState(null);
  const [filters, setFilters] = useState({
    establishmentId: '',
    active: ''
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const watchEstablishmentId = watch('establishmentId');

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (watchEstablishmentId) {
      fetchTaxConfigurations(watchEstablishmentId);
    }
  }, [watchEstablishmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exemptionsResponse, establishmentsResponse, clientsResponse] = await Promise.all([
        taxService.getTaxExemptions(filters),
        establishmentService.getEstablishments(),
        clientService.getClients()
      ]);
      
      setExemptions(exemptionsResponse.data || []);
      setEstablishments(establishmentsResponse.data || []);
      setClients(clientsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxConfigurations = async (establishmentId) => {
    try {
      const response = await taxService.getTaxConfigurations({ establishmentId });
      setTaxConfigurations(response.data || []);
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      const exemptionData = {
        ...data,
        active: data.active === 'true'
      };

      if (editingExemption) {
        await taxService.updateTaxExemption(editingExemption.id, exemptionData);
        toast.success('Exonération mise à jour avec succès');
      } else {
        await taxService.createTaxExemption(exemptionData);
        toast.success('Exonération créée avec succès');
      }

      setShowModal(false);
      setEditingExemption(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving exemption:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (exemption) => {
    setEditingExemption(exemption);
    reset({
      ...exemption,
      active: exemption.active ? 'true' : 'false'
    });
    if (exemption.establishmentId) {
      fetchTaxConfigurations(exemption.establishmentId);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette exonération ?')) {
      try {
        await taxService.deleteTaxExemption(id);
        toast.success('Exonération supprimée avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting exemption:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openCreateModal = () => {
    setEditingExemption(null);
    setTaxConfigurations([]);
    reset({
      establishmentId: '',
      clientId: '',
      taxConfigurationId: '',
      reason: '',
      documentNumber: '',
      validFrom: '',
      validUntil: '',
      active: 'true'
    });
    setShowModal(true);
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

  const getTaxConfigName = (taxConfigId) => {
    const config = taxConfigurations.find(c => c.id === taxConfigId);
    return config ? config.name : 'Configuration inconnue';
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exonérations fiscales</h1>
          <p className="text-gray-600 mt-2">Gérez les exemptions de taxes pour vos clients</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle exonération
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Établissement
            </label>
            <select
              value={filters.establishmentId}
              onChange={(e) => setFilters({ ...filters, establishmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les établissements</option>
              {establishments.map(est => (
                <option key={est.id} value={est.id}>{est.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exemptions List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {exemptions.length === 0 ? (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune exonération</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre première exonération fiscale.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvelle exonération
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {exemptions.map((exemption) => (
              <li key={exemption.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <DocumentTextIcon className="w-5 h-5 text-green-500 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        {exemption.reason}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exemption.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {exemption.active ? (
                          <>
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Actif
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Inactif
                          </>
                        )}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <strong>Client:</strong> {getClientName(exemption.clientId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Configuration fiscale:</strong> {
                          exemption.taxConfiguration ? 
                          exemption.taxConfiguration.name : 
                          getTaxConfigName(exemption.taxConfigurationId)
                        }
                      </p>
                      {exemption.documentNumber && (
                        <p className="text-sm text-gray-600">
                          <strong>Document:</strong> {exemption.documentNumber}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          <strong>Valide du:</strong> {new Date(exemption.validFrom).toLocaleDateString('fr-FR')}
                        </span>
                        <span>
                          <strong>au:</strong> {new Date(exemption.validUntil).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(exemption)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exemption.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingExemption ? 'Modifier l\'exonération' : 'Nouvelle exonération'}
              </h3>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement *
                    </label>
                    <select
                      {...register('establishmentId', { required: 'L\'établissement est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      Client *
                    </label>
                    <select
                      {...register('clientId', { required: 'Le client est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sélectionnez un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} {client.lastName}
                        </option>
                      ))}
                    </select>
                    {errors.clientId && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Configuration fiscale *
                  </label>
                  <select
                    {...register('taxConfigurationId', { required: 'La configuration fiscale est requise' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={!watchEstablishmentId}
                  >
                    <option value="">
                      {watchEstablishmentId ? 'Sélectionnez une configuration' : 'Sélectionnez d\'abord un établissement'}
                    </option>
                    {taxConfigurations.map(config => (
                      <option key={config.id} value={config.id}>
                        {config.name} ({config.rate}%)
                      </option>
                    ))}
                  </select>
                  {errors.taxConfigurationId && (
                    <p className="text-red-500 text-sm mt-1">{errors.taxConfigurationId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison de l'exonération *
                  </label>
                  <input
                    type="text"
                    {...register('reason', { required: 'La raison est requise' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Exemption diplomatique, gouvernementale, etc."
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de document
                  </label>
                  <input
                    type="text"
                    {...register('documentNumber')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="DIP-12345, GOV-67890, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valide du *
                    </label>
                    <input
                      type="date"
                      {...register('validFrom', { required: 'La date de début est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.validFrom && (
                      <p className="text-red-500 text-sm mt-1">{errors.validFrom.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valide jusqu'au *
                    </label>
                    <input
                      type="date"
                      {...register('validUntil', { required: 'La date de fin est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.validUntil && (
                      <p className="text-red-500 text-sm mt-1">{errors.validUntil.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    {...register('active')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="true">Actif</option>
                    <option value="false">Inactif</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    {editingExemption ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxExemptions;