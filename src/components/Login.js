import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.login(data.username, data.password);
      toast.success('Connexion réussie!');
      onLogin(response.token, response.user);
    } catch (error) {
      toast.error('Erreur de connexion. Essayez demo/demo pour tester.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Plateforme Fiscale DRC
            </h2>
            <p className="text-gray-600 mb-8">
              Connectez-vous à votre compte
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                {...register('username', { required: 'Le nom d\'utilisateur est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="demo"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                {...register('password', { required: 'Le mot de passe est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="demo"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <p><strong>Mode démo:</strong></p>
              <p>Utilisateur: <code className="bg-gray-200 px-1 rounded">demo</code></p>
              <p>Mot de passe: <code className="bg-gray-200 px-1 rounded">demo</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
