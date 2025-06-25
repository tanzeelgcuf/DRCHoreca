// src/components/Establishments.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { establishmentService } from '../services/api';

const Establishments = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching establishments with filters:', filters);
      
      const response = await establishmentService.getEstablishments(filters);
      console.log('Establishments response:', response);
      
      // Improved response handling - check all possible response structures
      let establishmentsData = [];
      
      if (response && Array.isArray(response)) {
        // If response is already an array
        establishmentsData = response;
      } else if (response && response.establishments && Array.isArray(response.establishments)) {
        // If response has establishments array
        establishmentsData = response.establishments;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If response has data array
        establishmentsData = response.data;
      } else if (response && typeof response === 'object') {
        // If response is a single establishment object
        establishmentsData = [response];
      }
      
      console.log('Extracted establishments data:', establishmentsData);
      setEstablishments(establishmentsData);
    } catch (error) {
      console.error('Error fetching establishments:', error);
      toast.error('Erreur lors du chargement des établissements: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      setFormLoading(true);
      
      // Format data for the API
      const establishmentData = {
        ...data,
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : undefined
      };
      
      console.log('Submitting establishment data:', establishmentData);

      if (editingEstablishment) {
        const updateResponse = await establishmentService.updateEstablishment(editingEstablishment.id, establishmentData);
        console.log('Update response:', updateResponse);
        toast.success('Établissement mis à jour avec succès');
      } else {
        const createResponse = await establishmentService.createEstablishment(establishmentData);
        console.log('Create response:', createResponse);
        
        // Extract the establishment from the response if available
        if (createResponse && createResponse.establishment) {
          console.log('Created establishment:', createResponse.establishment);
        }
        
        toast.success(createResponse?.message || 'Établissement créé avec succès');
      }

      setShowModal(false);
      setEditingEstablishment(null);
      reset();
      
      // Force a small delay before fetching data to ensure the server has processed the change
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Error saving establishment:', error);
      toast.error(`Erreur lors de la sauvegarde: ${error.message || 'Veuillez vérifier tous les champs'}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (establishment) => {
    setEditingEstablishment(establishment);
    reset({
      ...establishment,
      totalRooms: establishment.totalRooms?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet établissement ?')) {
      try {
        setLoading(true);
        await establishmentService.deleteEstablishment(id);
        toast.success('Établissement supprimé avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting establishment:', error);
        toast.error(`Erreur lors de la suppression: ${error.message || 'Une erreur est survenue'}`);
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openCreateModal = () => {
    setEditingEstablishment(null);
    reset({
      name: '',
      type: 'hotel',
      address: '',
      city: 'Kinshasa',
      state: '',
      zipCode: '',
      country: 'République Démocratique du Congo',
      phone: '',
      email: '',
      website: '',
      description: '',
      totalRooms: '',
      status: 'active'
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des établissements</h1>
          <p className="text-gray-600 mt-2">Gérez vos hôtels et autres établissements</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvel établissement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'établissement
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="hotel">Hôtel</option>
              <option value="resort">Resort</option>
              <option value="inn">Auberge</option>
              <option value="hostel">Hostel</option>
              <option value="apartment">Appartements</option>
              <option value="business">Centre d'affaires</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Establishments List */}
      {!loading && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {establishments.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun établissement</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre premier établissement.
              </p>
              <div className="mt-6">
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Nouvel établissement
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {establishments.map((establishment) => (
                <li key={establishment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {establishment.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {establishment.type === 'hotel' ? 'Hôtel' : 
                            establishment.type === 'resort' ? 'Resort' :
                            establishment.type === 'inn' ? 'Auberge' :
                            establishment.type === 'hostel' ? 'Hostel' :
                            establishment.type === 'apartment' ? 'Appartements' :
                            establishment.type === 'business' ? 'Centre d\'affaires' :
                            establishment.type}
                          </p>
                        </div>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          establishment.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : establishment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {establishment.status === 'active' ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Actif
                            </>
                          ) : establishment.status === 'pending' ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              En attente
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              {establishment.status === 'suspended' ? 'Suspendu' : 'Fermé'}
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {establishment.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{establishment.address}, {establishment.city}</span>
                          </div>
                        )}
                        
                        {establishment.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <PhoneIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{establishment.phone}</span>
                          </div>
                        )}
                        
                        {establishment.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <span>{establishment.email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        {establishment.totalRooms && (
                          <span>{establishment.totalRooms} chambres</span>
                        )}
                        {establishment.category && (
                          <span>{establishment.category}</span>
                        )}
                        {establishment.registryNumber && (
                          <span>Numéro d'enregistrement: {establishment.registryNumber}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(establishment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(establishment.id)}
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
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEstablishment ? 'Modifier l\'établissement' : 'Nouvel établissement'}
              </h3>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'établissement *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Le nom est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Grand Hotel Kinshasa"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type d'établissement *
                    </label>
                    <select
                      {...register('type', { required: 'Le type est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hotel">Hôtel</option>
                      <option value="resort">Resort</option>
                      <option value="inn">Auberge</option>
                      <option value="hostel">Hostel</option>
                      <option value="apartment">Appartements</option>
                      <option value="business">Centre d'affaires</option>
                      <option value="other">Autre</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de chambres
                    </label>
                    <input
                      type="number"
                      {...register('totalRooms', { 
                        min: { value: 1, message: 'Doit être au moins 1' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150"
                    />
                    {errors.totalRooms && (
                      <p className="text-red-500 text-sm mt-1">{errors.totalRooms.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    {...register('address', { required: 'L\'adresse est requise' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Avenue de la République"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'La ville est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kinshasa"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province/État
                    </label>
                    <input
                      type="text"
                      {...register('state')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kinshasa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      {...register('zipCode')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="00000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      {...register('country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="République Démocratique du Congo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+243123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@hotel.cd"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site web
                  </label>
                  <input
                    type="text"
                    {...register('website')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="www.hotel.cd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de l'établissement..."
                  />
                </div>

                {!editingEstablishment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Actif</option>
                      <option value="pending">En attente</option>
                      <option value="suspended">Suspendu</option>
                      <option value="closed">Fermé</option>
                    </select>
                  </div>
                )}

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
                    disabled={formLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      </span>
                    ) : (
                      editingEstablishment ? 'Mettre à jour' : 'Créer'
                    )}
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

export default Establishments;