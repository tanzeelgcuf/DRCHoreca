import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('drc_token');
      if (token) {
        const userProfile = await authService.getProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('drc_token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('drc_token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('drc_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">DRC Fiscalité</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Bonjour, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-6 py-8">
        <Dashboard />
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
