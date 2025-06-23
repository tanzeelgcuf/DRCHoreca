// src/components/Clients.js - Client Management Component
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { clientService, establishmentService } from '../services/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [filters, setFilters] = useState({
    establishmentId: '',
    nationality: '',
    verificationStatus: '',
    blockedStatus: ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsResponse, establishmentsResponse] = await Promise.all([
        clientService.getClients(filters),
        establishmentService.getEstablishments()
      ]);
      
      setClients(clientsResponse.data || []);
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
      const clientData = {
        ...data,
        establishmentId: parseInt(data.establishmentId)
      };

      if (editingClient) {
        await clientService.updateClient(editingClient.id, clientData);
        toast.success('Client mis à jour avec succès');
      } else {
        await clientService.createClient(clientData);
        toast.success('Client créé avec succès');
      }

      setShowModal(false);
      setEditingClient(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    reset({
      ...client,
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await clientService.deleteClient(id);
        toast.success('Client supprimé avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleVerify = async (id) => {
    try {
      await clientService.verifyClient(id, {
        verificationMethod: 'manual_verification',
        notes: 'Vérifié manuellement par l\'administrateur'
      });
      toast.success('Client vérifié avec succès');
      fetchData();
    } catch (error) {
      console.error('Error verifying client:', error);
      toast.error('Erreur lors de la vérification');
    }
  };

  const handleBlock = async (id) => {
    try {
      await clientService.blockClient(id, {
        reason: 'Bloqué par l\'administrateur',
        notes: 'Client bloqué manuellement'
      });
      toast.success('Client bloqué avec succès');
      fetchData();
    } catch (error) {
      console.error('Error blocking client:', error);
      toast.error('Erreur lors du blocage');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await clientService.unblockClient(id);
      toast.success('Client débloqué avec succès');
      fetchData();
    } catch (error) {
      console.error('Error unblocking client:', error);
      toast.error('Erreur lors du déblocage');
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    reset({
      establishmentId: '',
      firstName: '',
      lastName: '',
      documentType: 'passport',
      documentNumber: '',
      nationality: '',
      dateOfBirth: '',
      gender: 'male',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      notes: ''
    });
    setShowModal(true);
  };

  const viewClientDetails = async (client) => {
    try {
      const fullClient = await clientService.getClient(client.id);
      setSelectedClient(fullClient);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusLabel = (status) => {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'pending': return 'En attente';
      case 'flagged': return 'Signalé';
      default: return 'Non vérifié';
    }
  };

  const getEstablishmentName = (establishmentId) => {
    const establishment = establishments.find(est => est.id === establishmentId);
    return establishment ? establishment.name : 'Établissement inconnu';
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des clients</h1>
          <p className="text-gray-600 mt-2">Gérez les clients de vos établissements</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              Nationalité
            </label>
            <input
              type="text"
              value={filters.nationality}
              onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filtrer par nationalité"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de vérification
            </label>
            <select
              value={filters.verificationStatus}
              onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="verified">Vérifié</option>
              <option value="pending">En attente</option>
              <option value="flagged">Signalé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut de blocage
            </label>
            <select
              value={filters.blockedStatus}
              onChange={(e) => setFilters({ ...filters, blockedStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="false">Non bloqué</option>
              <option value="true">Bloqué</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {clients.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun client</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier client.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouveau client
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {clients.map((client) => (
              <li key={client.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UserGroupIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {client.firstName} {client.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {client.documentType}: {client.documentNumber}
                        </p>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(client.verificationStatus)}`}>
                          {getVerificationStatusLabel(client.verificationStatus)}
                        </span>
                        {client.blockedStatus && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircleIcon className="w-3 h-3 mr-1" />
                            Bloqué
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <strong>Email:</strong> {client.email || 'Non renseigné'}
                      </div>
                      <div>
                        <strong>Téléphone:</strong> {client.phone || 'Non renseigné'}
                      </div>
                      <div>
                        <strong>Nationalité:</strong> {client.nationality}
                      </div>
                      <div>
                        <strong>Établissement:</strong> {getEstablishmentName(client.establishmentId)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Créé le: {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => viewClientDetails(client)}
                      className="text-gray-600 hover:text-gray-900"
                      title="Voir les détails"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    {client.verificationStatus !== 'verified' && (
                      <button
                        onClick={() => handleVerify(client.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Vérifier"
                      >
                        <ShieldCheckIcon className="w-5 h-5" />
                      </button>
                    )}
                    {client.blockedStatus ? (
                      <button
                        onClick={() => handleUnblock(client.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Débloquer"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlock(client.id)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Bloquer"
                      >
                        <ShieldExclamationIcon className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(client)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
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

      {/* Create/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[800px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'Le prénom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jean"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Le nom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Dupont"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de document *
                    </label>
                    <select
                      {...register('documentType', { required: 'Le type de document est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="passport">Passeport</option>
                      <option value="id_card">Carte d'identité</option>
                      <option value="visa">Visa</option>
                      <option value="driver_license">Permis de conduire</option>
                    </select>
                    {errors.documentType && (
                      <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de document *
                    </label>
                    <input
                      type="text"
                      {...register('documentNumber', { required: 'Le numéro de document est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AB123456"
                    />
                    {errors.documentNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.documentNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationalité *
                    </label>
                    <input
                      type="text"
                      {...register('nationality', { required: 'La nationalité est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="République Démocratique du Congo"
                    />
                    {errors.nationality && (
                      <p className="text-red-500 text-sm mt-1">{errors.nationality.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de naissance
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Masculin</option>
                      <option value="female">Féminin</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="client@example.com"
                    />
                  </div>

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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Avenue de la République"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Kinshasa"
                    />
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    {...register('country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="République Démocratique du Congo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notes supplémentaires sur le client..."
                  />
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
                    {editingClient ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails du client - {selectedClient.firstName} {selectedClient.lastName}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <p className="text-sm text-gray-900">{selectedClient.firstName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <p className="text-sm text-gray-900">{selectedClient.lastName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de document</label>
                    <p className="text-sm text-gray-900">{selectedClient.documentType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numéro de document</label>
                    <p className="text-sm text-gray-900">{selectedClient.documentNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nationalité</label>
                    <p className="text-sm text-gray-900">{selectedClient.nationality}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <p className="text-sm text-gray-900">
                      {selectedClient.gender === 'male' ? 'Masculin' : 
                       selectedClient.gender === 'female' ? 'Féminin' : 'Autre'}
                    </p>
                  </div>
                </div>

                {selectedClient.dateOfBirth && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedClient.dateOfBirth).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedClient.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <p className="text-sm text-gray-900">{selectedClient.phone || 'Non renseigné'}</p>
                  </div>
                </div>

                {selectedClient.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adresse</label>
                    <p className="text-sm text-gray-900">
                      {selectedClient.address}
                      {selectedClient.city && `, ${selectedClient.city}`}
                      {selectedClient.state && `, ${selectedClient.state}`}
                      {selectedClient.zipCode && ` ${selectedClient.zipCode}`}
                      {selectedClient.country && `, ${selectedClient.country}`}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut de vérification</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerificationStatusColor(selectedClient.verificationStatus)}`}>
                      {getVerificationStatusLabel(selectedClient.verificationStatus)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut de blocage</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedClient.blockedStatus ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {selectedClient.blockedStatus ? 'Bloqué' : 'Non bloqué'}
                    </span>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-sm text-gray-900">{selectedClient.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créé le</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedClient.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modifié le</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedClient.updatedAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;