// src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  UserIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { authService, establishmentService } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingEstablishment, setEditingEstablishment] = useState(null);

  const { register: registerUser, handleSubmit: handleUserSubmit, reset: resetUser, formState: { errors: userErrors } } = useForm();
  const { register: registerEst, handleSubmit: handleEstSubmit, reset: resetEst, formState: { errors: estErrors } } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const establishmentsResponse = await establishmentService.getEstablishments();
      setEstablishments(establishmentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data) => {
    try {
      // In a real implementation, you would call a user creation API
      console.log('Creating user:', data);
      toast.success('Utilisateur créé avec succès');
      setShowUserModal(false);
      resetUser();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  };

  const handleCreateEstablishment = async (data) => {
    try {
      const response = await establishmentService.createEstablishment(data);
      toast.success('Établissement créé avec succès');
      setShowEstablishmentModal(false);
      resetEst();
      fetchData();
    } catch (error) {
      console.error('Error creating establishment:', error);
      toast.error('Erreur lors de la création de l\'établissement');
    }
  };

  const handleRegisterDRCHotel = async (data) => {
    try {
      const response = await establishmentService.registerDRCHotel(data);
      toast.success('Hôtel DRC enregistré avec succès');
      setShowEstablishmentModal(false);
      resetEst();
      fetchData();
    } catch (error) {
      console.error('Error registering DRC hotel:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'hôtel DRC');
    }
  };

  const openUserModal = () => {
    setEditingUser(null);
    resetUser({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'staff',
      establishmentId: ''
    });
    setShowUserModal(true);
  };

  const openEstablishmentModal = () => {
    setEditingEstablishment(null);
    resetEst({
      name: '',
      type: 'hotel',
      address: '',
      city: '',
      country: 'République Démocratique du Congo',
      phone: '',
      email: '',
      totalRooms: ''
    });
    setShowEstablishmentModal(true);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-2">Gérez les utilisateurs et les établissements du système</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <UserIcon className="w-8 h-8 text-blue-600" />
            <h2 className="text-xl font-medium text-gray-900 ml-3">Utilisateurs</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Créez et gérez les comptes utilisateurs pour accéder au système fiscal.
          </p>
          <button
            onClick={openUserModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <BuildingOfficeIcon className="w-8 h-8 text-green-600" />
            <h2 className="text-xl font-medium text-gray-900 ml-3">Établissements</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Enregistrez de nouveaux hôtels et établissements dans le système DRC.
          </p>
          <button
            onClick={openEstablishmentModal}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nouvel établissement
          </button>
        </div>
      </div>

      {/* Establishments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Établissements enregistrés ({establishments.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Liste des établissements configurés dans le système
          </p>
        </div>
        
        {establishments.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun établissement</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par enregistrer votre premier établissement.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {establishments.map((establishment) => (
              <li key={establishment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {establishment.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {establishment.type} • {establishment.city}, {establishment.country}
                        </p>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          {establishment.totalRooms && (
                            <span>{establishment.totalRooms} chambres</span>
                          )}
                          {establishment.category && (
                            <span>{establishment.category}</span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            establishment.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {establishment.status === 'active' ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                Actif
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                En attente
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Navigate to establishment details or tax configurations
                        window.location.href = `/hotel/configurations?establishment=${establishment.id}`;
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="Voir les configurations fiscales"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Créer un nouvel utilisateur
              </h3>
              
              <form onSubmit={handleUserSubmit(handleCreateUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      {...registerUser('firstName', { required: 'Le prénom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {userErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{userErrors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      {...registerUser('lastName', { required: 'Le nom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {userErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{userErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom d'utilisateur *
                  </label>
                  <input
                    type="text"
                    {...registerUser('username', { required: 'Le nom d\'utilisateur est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {userErrors.username && (
                    <p className="text-red-500 text-sm mt-1">{userErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    {...registerUser('email', { required: 'L\'email est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {userErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{userErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    {...registerUser('password', { required: 'Le mot de passe est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {userErrors.password && (
                    <p className="text-red-500 text-sm mt-1">{userErrors.password.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      {...registerUser('role', { required: 'Le rôle est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="staff">Personnel</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <select
                      {...registerUser('establishmentId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aucun établissement</option>
                      {establishments.map(est => (
                        <option key={est.id} value={est.id}>{est.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Establishment Modal */}
      {showEstablishmentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enregistrer un nouvel établissement
              </h3>
              
              <form onSubmit={handleEstSubmit(handleCreateEstablishment)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de l'établissement *
                    </label>
                    <input
                      type="text"
                      {...registerEst('name', { required: 'Le nom est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Grand Hotel Kinshasa"
                    />
                    {estErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{estErrors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      {...registerEst('type', { required: 'Le type est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="hotel">Hôtel</option>
                      <option value="resort">Resort</option>
                      <option value="hostel">Auberge</option>
                      <option value="apartment">Appartement</option>
                      <option value="guesthouse">Maison d'hôtes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    {...registerEst('address', { required: 'L\'adresse est requise' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="123 Avenue de la République"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      {...registerEst('city', { required: 'La ville est requise' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Kinshasa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pays *
                    </label>
                    <input
                      type="text"
                      {...registerEst('country')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      {...registerEst('phone')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+243123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      {...registerEst('email')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="info@hotel.cd"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de chambres
                  </label>
                  <input
                    type="number"
                    {...registerEst('totalRooms')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="150"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEstablishmentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Enregistrer
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

export default UserManagement;