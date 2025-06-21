// Option 1: If you're using React Router v6 (most common)
// Update your main App.js file

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import your components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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

  const handleLogout = () => {
    localStorage.removeItem('drc_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    // IMPORTANT: Add basename="/hotel" here for the /hotel/ path
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
                  <Route path="/configurations" element={<div>Tax Configurations Page</div>} />
                  <Route path="/exemptions" element={<div>Tax Exemptions Page</div>} />
                  <Route path="/rapports" element={<div>Reports Page</div>} />
                  {/* Add more routes as needed */}
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