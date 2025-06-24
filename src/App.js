// src/App.js - Completely updated with proper routing and authentication
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Establishments from './components/Establishments';
import { authService } from './services/api';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('drc_token');
  
  if (!isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    checkAuthStatus();
    checkApiConnection();
  }, []);

  // Check if the user is already authenticated
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('drc_token');
      if (token) {
        console.log('Found existing token, attempting to get user profile');
        const userProfile = await authService.getProfile();
        console.log('User profile loaded:', userProfile);
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

  // Check if the API is online
  const checkApiConnection = async () => {
    try {
      // Try a simple API request to check connection
      await fetch(process.env.REACT_APP_API_URL || 'http://34.30.198.6:8080/api/v1', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('API connection check failed:', error);
      setConnectionStatus('error');
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('drc_token', token);
    setUser(userData);
    setIsAuthenticated(true);
    checkApiConnection(); // Check connection status after login
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

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement de l'application...</span>
      </div>
    );
  }

  return (
    <Router basename="/hotel">
      <div className="App">
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
        
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header user={user} onLogout={handleLogout} connectionStatus={connectionStatus} />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/configurations" element={
                    <ProtectedRoute>
                      <TaxConfigurations />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/exemptions" element={
                    <ProtectedRoute>
                      <TaxExemptions />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/calculateur" element={
                    <ProtectedRoute>
                      <TaxCalculator />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/rapports" element={
                    <ProtectedRoute>
                      <TaxReports />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/utilisateurs" element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <Clients />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/sejours" element={
                    <ProtectedRoute>
                      <Stays />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/etablissements" element={
                    <ProtectedRoute>
                      <Establishments />
                    </ProtectedRoute>
                  } />
                  
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