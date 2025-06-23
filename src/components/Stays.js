// src/components/Stays.js - Stay Management Component
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowRightCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { stayService, establishmentService, clientService } from '../services/api';

const Stays = () => {
  const [stays, setStays] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingStay, setEditingStay] = useState(null);
  const [selectedStay, setSelectedStay] = useState(null);
  const [filters, setFilters] = useState({
    establishmentId: '',
    clientId: '',
    status: '',
    room: ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staysResponse, establishmentsResponse, clientsResponse] = await Promise.all([
        stayService.getStays(filters),
        establishmentService.getEstablishments(),
        clientService.getClients()
      ]);
      
      setStays(staysResponse.data || []);
      setEstablishments(establishmentsResponse.data || []);
      setClients(clientsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data) => {
    try {
      const stayData = {
        ...data,
        establishmentId: parseInt(data.establishmentId),
        clientId: parseInt(data.clientId),
        duration: parseInt(data.duration),
        adultCount: parseInt(data.adultCount),
        childCount: parseInt(data.childCount),
        hasSpecialNeeds: data.hasSpecialNeeds === 'true'
      };

      if (editingStay) {
        await stayService.updateStay(editingStay.id, stayData);
        toast.success('Séjour mis à jour avec succès');
      } else {
        await stayService.createStay(stayData);
        toast.success('Séjour créé avec succès');
      }

      setShowModal(false);
      setEditingStay(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving stay:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (stay) => {
    setEditingStay(stay);
    reset({
      ...stay,
      checkInDate: stay.checkInDate ? stay.checkInDate.split('T')[0] : '',
      hasSpecialNeeds: stay.hasSpecialNeeds ? 'true' : 'false'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce séjour ?')) {
      try {
        await stayService.deleteStay(id);
        toast.success('Séjour supprimé avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting stay:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleClose = async (stay) => {
    const checkOutDate = prompt('Date de départ (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!checkOutDate) return;

    const totalBill = prompt('Montant total (optionnel):');
    const paymentMethod = prompt('Méthode de paiement (optionnel):');

    try {
      await stayService.closeStay(stay.id, {
        checkOutDate,
        totalBill: totalBill ? parseFloat(totalBill) : undefined,
        paymentMethod: paymentMethod || undefined,
        paymentStatus: 'completed'
      });
      toast.success('Séjour fermé avec succès');
      fetchData();
    } catch (error) {
      console.error('Error closing stay:', error);
      toast.error('Erreur lors de la fermeture du séjour');
    }
  };

  const handleCancel = async (stay) => {
    const reason = prompt('Raison de l\'annulation:');
    if (!reason) return;

    const notes = prompt('Notes additionnelles (optionnel):');

    try {
      await stayService.cancelStay(stay.id, {
        reason,
        notes: notes || undefined
      });
      toast.success('Séjour annulé avec succès');
      fetchData();
    } catch (error) {
      console.error('Error cancelling stay:', error);
      toast.error('Erreur lors de l\'annulation du séjour');
    }
  };

  const handleExtend = async (stay) => {
    const additionalDays = prompt('Nombre de jours supplémentaires:');
    if (!additionalDays || isNaN(parseInt(additionalDays))) return;

    const reason = prompt('Raison de l\'extension (optionnel):');

    try {
      await stayService.extendStay(stay.id, {
        additionalDays: parseInt(additionalDays),
        reason: reason || 'Extension demandée par le client'
      });
      toast.success('Séjour prolongé avec succès');
      fetchData();
    } catch (error) {
      console.error('Error extending stay:', error);
      toast.error('Erreur lors de l\'extension du séjour');
    }
  };

  const openCreateModal = () => {
    setEditingStay(null);
    reset({
      establishmentId: '',
      clientId: '',
      checkInDate: new Date().toISOString().split('T')[0],
      duration: 1,
      room: '',
      adultCount: 1,
      childCount: 0,
      hasSpecialNeeds: 'false',
      specialNeedsInfo: '',
      visitPurpose: 'Tourism',
      remarks: ''
    });
    setShowModal(true);
  };

  const viewStayDetails = async (stay) => {
    try {
      const fullStay = await stayService.getStay(stay.id);
      setSelectedStay(fullStay);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching stay details:', error);
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'closed': return 'Fermé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'closed': return ClockIcon;
      case 'cancelled': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  };

  const getEstablishmentName = (establishmentId) => {
    const establishment = establishments.find(est => est.id === establishmentId);
    return establishment ? establishment.name : 'Établissement inconnu';
  };

  const calculateCheckOutDate = (checkInDate, duration) => {
    if (!checkInDate || !duration) return '';
    const checkIn = new Date(checkInDate);
    checkIn.setDate(checkIn.getDate() + parseInt(duration));
    return checkIn.toISOString().split('T')[0];
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des séjours</h1>
          <p className="text-gray-600 mt-2">Gérez les séjours de vos clients</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouveau séjour
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
              Client
            </label>
            <select
              value={filters.clientId}
              onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName}
                </option>
              ))}
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
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="closed">Fermé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chambre
            </label>
            <input
              type="text"
              value={filters.room}
              onChange={(e) => setFilters({ ...filters, room: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Numéro de chambre"
            />
          </div>
        </div>
      </div>

      {/* Stays List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {stays.length === 0 ? (
          <div className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun séjour</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier séjour.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouveau séjour
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {stays.map((stay) => {
              const StatusIcon = getStatusIcon(stay.status);
              return (
                <li key={stay.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <HomeIcon className="w-10 h-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Chambre {stay.room} - {getClientName(stay.clientId)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getEstablishmentName(stay.establishmentId)}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stay.status)}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {getStatusLabel(stay.status)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <strong>Check-in:</strong> {new Date(stay.checkInDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div>
                          <strong>Durée:</strong> {stay.duration} nuit{stay.duration > 1 ? 's' : ''}
                        </div>
                        <div>
                          <strong>Check-out prévu:</strong> {stay.checkOutDate ? 
                            new Date(stay.checkOutDate).toLocaleDateString('fr-FR') : 
                            calculateCheckOutDate(stay.checkInDate, stay.duration) ? 
                              new Date(calculateCheckOutDate(stay.checkInDate, stay.duration)).toLocaleDateString('fr-FR') : 
                              'Non défini'
                          }
                        </div>
                        <div>
                          <strong>Occupants:</strong> {stay.adultCount} adulte{stay.adultCount > 1 ? 's' : ''} 
                          {stay.childCount > 0 && `, ${stay.childCount} enfant${stay.childCount > 1 ? 's' : ''}`}
                        </div>
                      </div>
                      {stay.visitPurpose && (
                        <div className="mt-1 text-sm text-gray-500">
                          <strong>Motif:</strong> {stay.visitPurpose}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-400">
                        Créé le: {new Date(stay.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewStayDetails(stay)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Voir les détails"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {stay.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleExtend(stay)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Prolonger"
                          >
                            <ClockIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleClose(stay)}
                            className="text-green-600 hover:text-green-900"
                            title="Fermer le séjour"
                          >
                            <ArrowRightCircleIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancel(stay)}
                            className="text-red-600 hover:text-red-900"
                            title="Annuler"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleEdit(stay)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(stay.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create/Edit Stay Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[700px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingStay ? 'Modifier le séjour' : 'Nouveau séjour'}
              </h3>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      Client *
                    </label>
                    <select
                      {...register('clientId', { required: 'Le client est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'arrivée *
                    </label>
                    <input
                      type="date"
                      {...register('checkInDate', { required: 'La date d\'arrivée est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.checkInDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.checkInDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (nuits) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('duration', { required: 'La durée est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chambre *
                    </label>
                    <input
                      type="text"
                      {...register('room', { required: 'Le numéro de chambre est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="101"
                    />
                    {errors.room && (
                      <p className="text-red-500 text-sm mt-1">{errors.room.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre d'adultes *
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('adultCount', { required: 'Le nombre d\'adultes est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1"
                    />
                    {errors.adultCount && (
                      <p className="text-red-500 text-sm mt-1">{errors.adultCount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre d'enfants
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('childCount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motif de voyage
                  </label>
                  <select
                    {...register('visitPurpose')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tourism">Tourisme</option>
                    <option value="Business">Affaires</option>
                    <option value="Personal">Personnel</option>
                    <option value="Medical">Médical</option>
                    <option value="Education">Éducation</option>
                    <option value="Transit">Transit</option>
                    <option value="Other">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('hasSpecialNeeds')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Besoins spéciaux
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informations sur les besoins spéciaux
                  </label>
                  <textarea
                    {...register('specialNeedsInfo')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Décrivez les besoins spéciaux..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarques
                  </label>
                  <textarea
                    {...register('remarks')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Remarques sur le séjour..."
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
                    {editingStay ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stay Details Modal */}
      {showDetailsModal && selectedStay && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails du séjour - Chambre {selectedStay.room}
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <p className="text-sm text-gray-900">{getClientName(selectedStay.clientId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Établissement</label>
                    <p className="text-sm text-gray-900">{getEstablishmentName(selectedStay.establishmentId)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chambre</label>
                    <p className="text-sm text-gray-900">{selectedStay.room}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedStay.status)}`}>
                      {getStatusLabel(selectedStay.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Durée</label>
                    <p className="text-sm text-gray-900">{selectedStay.duration} nuit{selectedStay.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'arrivée</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStay.checkInDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de départ prévue</label>
                    <p className="text-sm text-gray-900">
                      {selectedStay.checkOutDate ? 
                        new Date(selectedStay.checkOutDate).toLocaleDateString('fr-FR') :
                        calculateCheckOutDate(selectedStay.checkInDate, selectedStay.duration) ?
                          new Date(calculateCheckOutDate(selectedStay.checkInDate, selectedStay.duration)).toLocaleDateString('fr-FR') :
                          'Non définie'
                      }
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adultes</label>
                    <p className="text-sm text-gray-900">{selectedStay.adultCount}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Enfants</label>
                    <p className="text-sm text-gray-900">{selectedStay.childCount || 0}</p>
                  </div>
                </div>

                {selectedStay.visitPurpose && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Motif de voyage</label>
                    <p className="text-sm text-gray-900">{selectedStay.visitPurpose}</p>
                  </div>
                )}

                {selectedStay.hasSpecialNeeds && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Besoins spéciaux</label>
                    <p className="text-sm text-gray-900">{selectedStay.specialNeedsInfo || 'Oui, voir avec le client'}</p>
                  </div>
                )}

                {selectedStay.totalBill && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Montant total</label>
                      <p className="text-sm text-gray-900">{selectedStay.totalBill} CDF</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Statut de paiement</label>
                      <p className="text-sm text-gray-900">{selectedStay.paymentStatus || 'En attente'}</p>
                    </div>
                  </div>
                )}

                {selectedStay.remarks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarques</label>
                    <p className="text-sm text-gray-900">{selectedStay.remarks}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Créé le</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStay.createdAt).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modifié le</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedStay.updatedAt).toLocaleString('fr-FR')}
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

export default Stays;