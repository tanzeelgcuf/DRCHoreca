// src/services/api.js - Updated to connect to real backend
import axios from 'axios';

// API Configuration based on your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://34.30.198.6:8080/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('drc_token');
      window.location.href = '/hotel/';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Authentication service - matches your backend auth endpoints
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('drc_token');
    }
  }
};

// Tax service - matches your backend tax endpoints exactly
export const taxService = {
  // Tax Configurations - matches /taxes/configurations endpoints
  getTaxConfigurations: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/taxes/configurations${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
      throw error;
    }
  },

  getTaxConfiguration: async (id) => {
    try {
      const response = await api.get(`/taxes/configurations/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax configuration:', error);
      throw error;
    }
  },

  createTaxConfiguration: async (data) => {
    try {
      const response = await api.post('/taxes/configurations', data);
      return response;
    } catch (error) {
      console.error('Error creating tax configuration:', error);
      throw error;
    }
  },

  updateTaxConfiguration: async (id, data) => {
    try {
      const response = await api.put(`/taxes/configurations/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating tax configuration:', error);
      throw error;
    }
  },

  deleteTaxConfiguration: async (id) => {
    try {
      const response = await api.delete(`/taxes/configurations/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting tax configuration:', error);
      throw error;
    }
  },

  // Tax Exemptions - matches /taxes/exemptions endpoints
  getTaxExemptions: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/taxes/exemptions${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax exemptions:', error);
      throw error;
    }
  },

  createTaxExemption: async (data) => {
    try {
      const response = await api.post('/taxes/exemptions', data);
      return response;
    } catch (error) {
      console.error('Error creating tax exemption:', error);
      throw error;
    }
  },

  updateTaxExemption: async (id, data) => {
    try {
      const response = await api.put(`/taxes/exemptions/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating tax exemption:', error);
      throw error;
    }
  },

  deleteTaxExemption: async (id) => {
    try {
      const response = await api.delete(`/taxes/exemptions/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting tax exemption:', error);
      throw error;
    }
  },

  // Tax Reports - matches /taxes/report endpoint
  getTaxReport: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/taxes/report${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax report:', error);
      throw error;
    }
  },

  // Tax Calculation - matches /taxes/calculate endpoint
  calculateTax: async (data) => {
    try {
      const response = await api.post('/taxes/calculate', data);
      return response;
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }
};

// Establishment service - matches /establishments endpoints
export const establishmentService = {
  getEstablishments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/establishments${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }
  },

  getEstablishment: async (id) => {
    try {
      const response = await api.get(`/establishments/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching establishment:', error);
      throw error;
    }
  },

  createEstablishment: async (data) => {
    try {
      const response = await api.post('/establishments', data);
      return response;
    } catch (error) {
      console.error('Error creating establishment:', error);
      throw error;
    }
  },

  updateEstablishment: async (id, data) => {
    try {
      const response = await api.put(`/establishments/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating establishment:', error);
      throw error;
    }
  },

  deleteEstablishment: async (id) => {
    try {
      const response = await api.delete(`/establishments/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting establishment:', error);
      throw error;
    }
  },

  registerDRCHotel: async (data) => {
    try {
      const response = await api.post('/establishments/register-drc-hotel', data);
      return response;
    } catch (error) {
      console.error('Error registering DRC hotel:', error);
      throw error;
    }
  },

  getEstablishmentStats: async (id, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/establishments/${id}/stats${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching establishment stats:', error);
      throw error;
    }
  }
};

// Client service - matches /clients endpoints
export const clientService = {
  getClients: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/clients${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  getClient: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  createClient: async (data) => {
    try {
      const response = await api.post('/clients', data);
      return response;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  updateClient: async (id, data) => {
    try {
      const response = await api.put(`/clients/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await api.delete(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  verifyClient: async (id, data) => {
    try {
      const response = await api.post(`/clients/${id}/verify`, data);
      return response;
    } catch (error) {
      console.error('Error verifying client:', error);
      throw error;
    }
  },

  blockClient: async (id, data) => {
    try {
      const response = await api.post(`/clients/${id}/block`, data);
      return response;
    } catch (error) {
      console.error('Error blocking client:', error);
      throw error;
    }
  },

  unblockClient: async (id) => {
    try {
      const response = await api.post(`/clients/${id}/unblock`);
      return response;
    } catch (error) {
      console.error('Error unblocking client:', error);
      throw error;
    }
  },

  importClients: async (data) => {
    try {
      const response = await api.post('/clients/import', data);
      return response;
    } catch (error) {
      console.error('Error importing clients:', error);
      throw error;
    }
  },

  getClientStays: async (id, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/clients/${id}/stays${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching client stays:', error);
      throw error;
    }
  },

  registerHotelGuest: async (data) => {
    try {
      const response = await api.post('/clients/register-hotel-guest', data);
      return response;
    } catch (error) {
      console.error('Error registering hotel guest:', error);
      throw error;
    }
  }
};

// Stay service - matches /stays endpoints
export const stayService = {
  getStays: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/stays${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching stays:', error);
      throw error;
    }
  },

  getStay: async (id) => {
    try {
      const response = await api.get(`/stays/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching stay:', error);
      throw error;
    }
  },

  createStay: async (data) => {
    try {
      const response = await api.post('/stays', data);
      return response;
    } catch (error) {
      console.error('Error creating stay:', error);
      throw error;
    }
  },

  updateStay: async (id, data) => {
    try {
      const response = await api.put(`/stays/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating stay:', error);
      throw error;
    }
  },

  deleteStay: async (id) => {
    try {
      const response = await api.delete(`/stays/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting stay:', error);
      throw error;
    }
  },

  closeStay: async (id, data) => {
    try {
      const response = await api.post(`/stays/${id}/close`, data);
      return response;
    } catch (error) {
      console.error('Error closing stay:', error);
      throw error;
    }
  },

  cancelStay: async (id, data) => {
    try {
      const response = await api.post(`/stays/${id}/cancel`, data);
      return response;
    } catch (error) {
      console.error('Error cancelling stay:', error);
      throw error;
    }
  },

  extendStay: async (id, data) => {
    try {
      const response = await api.post(`/stays/${id}/extend`, data);
      return response;
    } catch (error) {
      console.error('Error extending stay:', error);
      throw error;
    }
  }
};

// User service - matches /users endpoints
export const userService = {
  getUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/users${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      const response = await api.post('/users', data);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  changePassword: async (id, data) => {
    try {
      const response = await api.post(`/users/${id}/change-password`, data);
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

// Document service - matches /documents endpoints
export const documentService = {
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  getDocument: async (id) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  getDocumentsByEntity: async (type, id, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/documents/entity/${type}/${id}${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching documents by entity:', error);
      throw error;
    }
  },

  verifyDocument: async (id, data) => {
    try {
      const response = await api.post(`/documents/${id}/verify`, data);
      return response;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw error;
    }
  },

  rejectDocument: async (id, data) => {
    try {
      const response = await api.post(`/documents/${id}/reject`, data);
      return response;
    } catch (error) {
      console.error('Error rejecting document:', error);
      throw error;
    }
  }
};

export default api;