import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CogIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { taxService, establishmentService } from '../services/api';


const TaxConfigurations = () => {
  const [configurations, setConfigurations] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [filters, setFilters] = useState({
    establishmentId: '',
    active: ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configsResponse, establishmentsResponse] = await Promise.all([
        taxService.getTaxConfigurations(filters),
        establishmentService.getEstablishments()
      ]);
      
      setConfigurations(configsResponse.data || []);
      setEstablishments(establishmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      const configData = {
        ...data,
        rate: parseFloat(data.rate),
        applicableTo: Array.isArray(data.applicableTo) 
          ? data.applicableTo 
          : data.applicableTo.split(',').map(item => item.trim()),
        active: data.active === 'true'
      };

      if (editingConfig) {
        await taxService.updateTaxConfiguration(editingConfig.id, configData);
        toast.success('Configuration mise à jour avec succès');
      } else {
        await taxService.createTaxConfiguration(configData);
        toast.success('Configuration créée avec succès');
      }

      setShowModal(false);
      setEditingConfig(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    reset({
      ...config,
      applicableTo: Array.isArray(config.applicableTo) 
        ? config.applicableTo.join(', ')
        : config.applicableTo,
      active: config.active ? 'true' : 'false'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      try {
        await taxService.deleteTaxConfiguration(id);
        toast.success('Configuration supprimée avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting configuration:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openCreateModal = () => {
    setEditingConfig(null);
    reset({
      establishmentId: '',
      name: '',
      description: '',
      rate: '',
      type: 'percentage',
      applicableTo: 'stays',
      countryCode: 'CD',
      active: 'true'
    });
    setShowModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Configurations fiscales</h1>
          <p className="text-gray-600 mt-2">Gérez les taux de taxes pour vos établissements</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvelle configuration
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
              Statut
            </label>
            <select
              value={filters.active}
              onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configurations List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {configurations.length === 0 ? (
          <div className="text-center py-12">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune configuration</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre première configuration fiscale.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvelle configuration
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {configurations.map((config) => (
              <li key={config.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {config.name}
                      </h3>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        config.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {config.active ? (
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
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        Taux: <strong>
                          {config.rate}%
                          {config.type === 'fixed_per_night' && ' par nuit'}
                          {config.type === 'fixed_amount' && ' montant fixe'}
                        </strong>
                      </span>
                      <span>Type: {config.type}</span>
                      <span>
                        Applicable à: {
                          Array.isArray(config.applicableTo) 
                            ? config.applicableTo.join(', ')
                            : config.applicableTo
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id)}
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
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
              </h3>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
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
                    Nom *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Le nom est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TVA Standard"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de la taxe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taux *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('rate', { required: 'Le taux est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="20.00"
                    />
                    {errors.rate && (
                      <p className="text-red-500 text-sm mt-1">{errors.rate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      {...register('type', { required: 'Le type est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed_per_night">Fixe par nuit</option>
                      <option value="fixed_amount">Montant fixe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable à *
                  </label>
                  <input
                    type="text"
                    {...register('applicableTo', { required: 'Ce champ est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="stays, restaurant, services (séparés par des virgules)"
                  />
                  {errors.applicableTo && (
                    <p className="text-red-500 text-sm mt-1">{errors.applicableTo.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code pays
                    </label>
                    <input
                      type="text"
                      {...register('countryCode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      {...register('active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Actif</option>
                      <option value="false">Inactif</option>
                    </select>
                  </div>
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
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {editingConfig ? 'Mettre à jour' : 'Créer'}
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

export default TaxConfigurations;
