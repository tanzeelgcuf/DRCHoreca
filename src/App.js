// src/App.js - Updated with all routes and real API integration
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaxConfigurations from './components/TaxConfigurations';
import TaxExemptions from './components/TaxExemptions';
import TaxReports from './components/TaxReports';
import TaxCalculator from './components/TaxCalculator';
import Users from './components/Users';
import Clients from './components/Clients';
import Stays from './components/Stays';
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
      console.error('Auth check failed:', error);
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

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('drc_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router basename="/hotel">
      <div className="App">
        <Toaster position="top-right" />
        
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header user={user} onLogout={handleLogout} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/configurations" element={<TaxConfigurations />} />
                  <Route path="/exemptions" element={<TaxExemptions />} />
                  <Route path="/calculateur" element={<TaxCalculator />} />
                  <Route path="/rapports" element={<TaxReports />} />
                  <Route path="/utilisateurs" element={<Users />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/sejours" element={<Stays />} />
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;