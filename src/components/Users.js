// src/components/Users.js - User Management Component
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { userService, establishmentService } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filters, setFilters] = useState({
    establishmentId: '',
    role: '',
    active: ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, establishmentsResponse] = await Promise.all([
        userService.getUsers(filters),
        establishmentService.getEstablishments()
      ]);
      
      setUsers(usersResponse.data || []);
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
      const userData = {
        ...data,
        establishmentId: data.establishmentId ? parseInt(data.establishmentId) : null,
        active: data.active === 'true'
      };

      if (editingUser) {
        await userService.updateUser(editingUser.id, userData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await userService.createUser(userData);
        toast.success('Utilisateur créé avec succès');
      }

      setShowModal(false);
      setEditingUser(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset({
      ...user,
      establishmentId: user.establishmentId || '',
      active: user.active ? 'true' : 'false'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await userService.deleteUser(id);
        toast.success('Utilisateur supprimé avec succès');
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleChangePassword = async (data) => {
    try {
      await userService.changePassword(editingUser.id, data);
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      setEditingUser(null);
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Erreur lors du changement de mot de passe');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    reset({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'staff',
      establishmentId: '',
      phone: '',
      jobTitle: '',
      department: '',
      active: 'true'
    });
    setShowModal(true);
  };

  const openPasswordModal = (user) => {
    setEditingUser(user);
    resetPassword({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrateur',
      manager: 'Gestionnaire',
      staff: 'Personnel',
      user: 'Utilisateur'
    };
    return roles[role] || role;
  };

  const getEstablishmentName = (establishmentId) => {
    const establishment = establishments.find(est => est.id === establishmentId);
    return establishment ? establishment.name : 'Aucun établissement';
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les utilisateurs du système</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nouvel utilisateur
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
              Rôle
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="manager">Gestionnaire</option>
              <option value="staff">Personnel</option>
              <option value="user">Utilisateur</option>
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

      {/* Users List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer votre premier utilisateur.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvel utilisateur
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <UserIcon className="w-10 h-10 text-gray-400 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                      <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? (
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
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                      <div>
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div>
                        <strong>Rôle:</strong> {getRoleLabel(user.role)}
                      </div>
                      <div>
                        <strong>Établissement:</strong> {getEstablishmentName(user.establishmentId)}
                      </div>
                      {user.phone && (
                        <div>
                          <strong>Téléphone:</strong> {user.phone}
                        </div>
                      )}
                      {user.jobTitle && (
                        <div>
                          <strong>Poste:</strong> {user.jobTitle}
                        </div>
                      )}
                      {user.department && (
                        <div>
                          <strong>Département:</strong> {user.department}
                        </div>
                      )}
                    </div>
                    {user.lastLogin && (
                      <div className="mt-2 text-xs text-gray-400">
                        Dernière connexion: {new Date(user.lastLogin).toLocaleString('fr-FR')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openPasswordModal(user)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Changer le mot de passe"
                    >
                      <KeyIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Modifier"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h3>
              
              <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'utilisateur *
                    </label>
                    <input
                      type="text"
                      {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="utilisateur123"
                    />
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'L\'email est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="utilisateur@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      {...register('password', { required: !editingUser ? 'Le mot de passe est requis' : false })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mot de passe sécurisé"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>
                )}

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle *
                    </label>
                    <select
                      {...register('role', { required: 'Le rôle est requis' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="staff">Personnel</option>
                      <option value="manager">Gestionnaire</option>
                      <option value="admin">Administrateur</option>
                      <option value="user">Utilisateur</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Établissement
                    </label>
                    <select
                      {...register('establishmentId')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Aucun établissement</option>
                      {establishments.map(est => (
                        <option key={est.id} value={est.id}>{est.name}</option>
                      ))}
                    </select>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poste
                    </label>
                    <input
                      type="text"
                      {...register('jobTitle')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Réceptionniste, Gestionnaire, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Département
                    </label>
                    <input
                      type="text"
                      {...register('department')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Accueil, Administration, etc."
                    />
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
                    {editingUser ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[400px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Changer le mot de passe - {editingUser?.firstName} {editingUser?.lastName}
              </h3>
              
              <form onSubmit={handlePasswordSubmit(handleChangePassword)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel *
                  </label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Le mot de passe actuel est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', { required: 'Le nouveau mot de passe est requis' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    Changer le mot de passe
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

export default Users;