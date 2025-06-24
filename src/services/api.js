// src/services/api.js - Enhanced with proper error handling and backend connection
import axios from 'axios';

// Base API URL from environment configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://34.30.198.6:8080/api/v1';

// Create axios instance with proper configuration
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
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Successfully received a response
    return response.data;
  },
  (error) => {
    // Capture detailed error information for debugging
    console.error('API Error Response:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.config?.data,
      responseData: error.response?.data
    });

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('drc_token');
      window.location.href = '/hotel/';
    }
    
    // Return a rejected promise with detailed error information
    return Promise.reject({
      message: error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error occurred',
      status: error.response?.status,
      details: error.response?.data?.details || {},
      originalError: error
    });
  }
);

// Authentication service - properly handles login/logout
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Demo mode fallback for testing without backend
      if (process.env.REACT_APP_ENV === 'development' && username === 'demo' && password === 'demo') {
        return {
          token: 'demo-token',
          user: {
            id: 1,
            username: 'demo',
            firstName: 'Utilisateur',
            lastName: 'Demo',
            role: 'admin'
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Demo mode fallback for testing without backend
      if (process.env.REACT_APP_ENV === 'development' && username === 'demo' && password === 'demo') {
        return {
          token: 'demo-token',
          user: {
            id: 1,
            username: 'demo',
            firstName: 'Utilisateur',
            lastName: 'Demo',
            role: 'admin'
          }
        };
      }
      
      throw error;
    }
  },

  getProfile: async () => {
    try {
      // Demo mode handling
      const token = localStorage.getItem('drc_token');
      if (token === 'demo-token') {
        return {
          id: 1,
          username: 'demo',
          firstName: 'Utilisateur',
          lastName: 'Demo',
          role: 'admin'
        };
      }
      
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('drc_token');
    }
  }
};

// Tax service - implements all tax-related endpoints
export const taxService = {
  // Tax Configurations
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
      // Format data to match API expectations
      const formattedData = {
        ...data,
        rate: parseFloat(data.rate),
        establishmentId: parseInt(data.establishmentId),
        active: data.active === 'true' || data.active === true
      };
      
      const response = await api.post('/taxes/configurations', formattedData);
      return response;
    } catch (error) {
      console.error('Error creating tax configuration:', error);
      throw error;
    }
  },

  updateTaxConfiguration: async (id, data) => {
    try {
      // Format data to match API expectations
      const formattedData = {
        ...data,
        rate: parseFloat(data.rate),
        establishmentId: parseInt(data.establishmentId),
        active: data.active === 'true' || data.active === true
      };
      
      const response = await api.put(`/taxes/configurations/${id}`, formattedData);
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

  // Tax Exemptions
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
      // Format data to match API expectations
      const formattedData = {
        ...data,
        establishmentId: parseInt(data.establishmentId),
        clientId: parseInt(data.clientId),
        taxConfigurationId: parseInt(data.taxConfigurationId),
        active: data.active === 'true' || data.active === true
      };
      
      const response = await api.post('/taxes/exemptions', formattedData);
      return response;
    } catch (error) {
      console.error('Error creating tax exemption:', error);
      throw error;
    }
  },

  updateTaxExemption: async (id, data) => {
    try {
      // Format data to match API expectations
      const formattedData = {
        ...data,
        establishmentId: parseInt(data.establishmentId),
        clientId: parseInt(data.clientId),
        taxConfigurationId: parseInt(data.taxConfigurationId),
        active: data.active === 'true' || data.active === true
      };
      
      const response = await api.put(`/taxes/exemptions/${id}`, formattedData);
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

  // Tax Reports
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

  // Tax Calculation
  calculateTax: async (data) => {
    try {
      // Format data to match API expectations
      const calculationData = {
        ...data,
        establishmentId: parseInt(data.establishmentId),
        clientId: data.clientId ? parseInt(data.clientId) : undefined,
        stayId: data.stayId ? parseInt(data.stayId) : undefined,
        items: data.items.map(item => ({
          type: item.type,
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          totalPrice: parseFloat(item.totalPrice) || 0
        }))
      };
      
      const response = await api.post('/taxes/calculate', calculationData);
      return response;
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }
};

// Establishment service - implements all establishment-related endpoints
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
      // Convert numeric values
      const formattedData = {
        ...data,
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : undefined
      };
      
      console.log('Creating establishment with data:', formattedData);
      const response = await api.post('/establishments', formattedData);
      console.log('Establishment creation response:', response);
      return response;
    } catch (error) {
      console.error('Error creating establishment:', error);
      throw error;
    }
  },

  updateEstablishment: async (id, data) => {
    try {
      // Convert numeric values
      const formattedData = {
        ...data,
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : undefined
      };
      
      const response = await api.put(`/establishments/${id}`, formattedData);
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
      console.log('Registering DRC hotel with data:', data);
      const response = await api.post('/establishments/register-drc-hotel', data);
      console.log('DRC hotel registration response:', response);
      return response;
    } catch (error) {
      console.error('Error registering DRC hotel:', error);
      throw error;
    }
  },

  verifyEstablishment: async (id, data) => {
    try {
      const response = await api.post(`/establishments/${id}/verify`, data);
      return response;
    } catch (error) {
      console.error('Error verifying establishment:', error);
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

// Client service - implements all client-related endpoints
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

// Stay service - implements all stay-related endpoints
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

// User service - implements all user-related endpoints
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
  },

  lockUser: async (id, data) => {
    try {
      const response = await api.post(`/users/${id}/lock`, data);
      return response;
    } catch (error) {
      console.error('Error locking user:', error);
      throw error;
    }
  },

  unlockUser: async (id) => {
    try {
      const response = await api.post(`/users/${id}/unlock`);
      return response;
    } catch (error) {
      console.error('Error unlocking user:', error);
      throw error;
    }
  }
};

// Document service - implements all document-related endpoints
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

  generateTemporaryUrl: async (id, data) => {
    try {
      const response = await api.post(`/documents/${id}/url`, data);
      return response;
    } catch (error) {
      console.error('Error generating temporary URL:', error);
      throw error;
    }
  },

  optimizeDocument: async (id, data) => {
    try {
      const response = await api.post(`/documents/${id}/optimize`, data);
      return response;
    } catch (error) {
      console.error('Error optimizing document:', error);
      throw error;
    }
  },

  getStorageStats: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/documents/storage-stats${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      throw error;
    }
  }
};

// API key service - implements all API key-related endpoints
export const apiKeyService = {
  getApiKeys: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/api-keys${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  createApiKey: async (data) => {
    try {
      const response = await api.post('/api-keys', data);
      return response;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  deleteApiKey: async (id) => {
    try {
      const response = await api.delete(`/api-keys/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  verifyApiKey: async () => {
    try {
      const response = await api.get('/auth/verify-api-key');
      return response;
    } catch (error) {
      console.error('Error verifying API key:', error);
      throw error;
    }
  }
};

export default api;