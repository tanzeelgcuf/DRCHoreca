// src/services/api.js - Complete implementation with real backend integration
import axios from 'axios';

// Base API URL from environment configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://34.30.198.6/api/v1';

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle request errors
// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with improved error handling and response processing
api.interceptors.response.use(
  (response) => {
    // Successfully received a response
    console.log(`API Response from ${response.config.url}:`, response.data);
    
    // Don't automatically transform the response here, return the full data
    // so each service function can handle the specific response format
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

// Authentication service - handles login/logout
export const authService = {
  // Login user
  login: async (username, password) => {
    try {
      console.log(`Attempting login for user: ${username}`);
      const response = await api.post('/auth/login', { username, password });
      
      // Store token and user info in localStorage
      if (response.token) {
        localStorage.setItem('drc_token', response.token);
        localStorage.setItem('drc_user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Demo mode fallback for testing without backend
      if (process.env.REACT_APP_ENV === 'development' && username === 'demo' && password === 'demo') {
        console.log('Using demo login fallback');
        const demoResponse = {
          token: 'demo-token',
          user: {
            id: 1,
            username: 'demo',
            firstName: 'Utilisateur',
            lastName: 'Demo',
            role: 'admin'
          }
        };
        
        localStorage.setItem('drc_token', demoResponse.token);
        localStorage.setItem('drc_user', JSON.stringify(demoResponse.user));
        
        return demoResponse;
      }
      
      throw error;
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      // Demo mode handling
      const token = localStorage.getItem('drc_token');
      if (token === 'demo-token') {
        console.log('Using demo profile');
        return JSON.parse(localStorage.getItem('drc_user')) || {
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

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('drc_token');
      localStorage.removeItem('drc_user');
    }
  },
  
  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('drc_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.token) {
        localStorage.setItem('drc_token', response.token);
        
        if (response.refreshToken) {
          localStorage.setItem('drc_refresh_token', response.refreshToken);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On refresh failure, logout the user
      localStorage.removeItem('drc_token');
      localStorage.removeItem('drc_refresh_token');
      localStorage.removeItem('drc_user');
      throw error;
    }
  },
  
  // Validate token
  validateToken: async () => {
    try {
      const response = await api.get('/auth/validate-token');
      return response;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
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
      
      // Handle different response formats (configurations or data field)
      return {
        data: response.configurations || response.data || [],
        total: response.total || (response.configurations?.length || 0)
      };
    } catch (error) {
      console.error('Error fetching tax configurations:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock tax configurations data');
        return {
          data: [
            { id: 1, name: 'TVA Standard', rate: 20, isActive: true, establishmentId: 1 },
            { id: 2, name: 'Taxe de séjour', rate: 2.5, isActive: true, establishmentId: 1 },
            { id: 3, name: 'TVA Réduite', rate: 10, isActive: false, establishmentId: 1 }
          ],
          total: 3
        };
      }
      
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
      
      console.log('Creating tax configuration:', formattedData);
      const response = await api.post('/taxes/configurations', formattedData);
      console.log('Create tax configuration response:', response);
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
      
      console.log(`Updating tax configuration ${id}:`, formattedData);
      const response = await api.put(`/taxes/configurations/${id}`, formattedData);
      return response;
    } catch (error) {
      console.error('Error updating tax configuration:', error);
      throw error;
    }
  },

  deleteTaxConfiguration: async (id) => {
    try {
      console.log(`Deleting tax configuration ${id}`);
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
      
      // Handle different response formats
      return {
        data: response.exemptions || response.data || [],
        total: response.total || (response.exemptions?.length || 0)
      };
    } catch (error) {
      console.error('Error fetching tax exemptions:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          data: [
            { 
              id: 1, 
              reason: 'Exemption diplomatique', 
              isActive: true,
              clientId: 1,
              establishmentId: 1,
              validFrom: '2024-01-01',
              validUntil: '2024-12-31'
            },
            { 
              id: 2, 
              reason: 'Exemption gouvernementale', 
              isActive: false,
              clientId: 2,
              establishmentId: 1,
              validFrom: '2024-01-01',
              validUntil: '2024-06-30'
            }
          ],
          total: 2
        };
      }
      
      throw error;
    }
  },

  getTaxExemption: async (id) => {
    try {
      const response = await api.get(`/taxes/exemptions/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax exemption:', error);
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
      
      console.log('Creating tax exemption:', formattedData);
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
      
      console.log(`Updating tax exemption ${id}:`, formattedData);
      const response = await api.put(`/taxes/exemptions/${id}`, formattedData);
      return response;
    } catch (error) {
      console.error('Error updating tax exemption:', error);
      throw error;
    }
  },

  deleteTaxExemption: async (id) => {
    try {
      console.log(`Deleting tax exemption ${id}`);
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
      console.log(`Fetching tax report with params: ${queryString}`);
      const response = await api.get(`/taxes/report${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching tax report:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          period: {
            start: params.startDate || '2024-01-01',
            end: params.endDate || '2024-12-31'
          },
          summary: {
            totalTaxCollected: 15240.50,
            byTaxType: [
              {
                id: 1,
                name: 'TVA Standard',
                rate: 20,
                amountCollected: 12500.00,
                numberOfTransactions: 125
              },
              {
                id: 2,
                name: 'Taxe de séjour',
                rate: 2.5,
                amountCollected: 2740.50,
                numberOfTransactions: 98
              }
            ]
          },
          dailyBreakdown: [
            { date: '2024-01-01', totalTax: 450.00, transactions: 5 },
            { date: '2024-01-02', totalTax: 680.50, transactions: 8 },
            { date: '2024-01-03', totalTax: 320.00, transactions: 4 }
          ]
        };
      }
      
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
      
      console.log('Calculating tax:', calculationData);
      const response = await api.post('/taxes/calculate', calculationData);
      return response;
    } catch (error) {
      console.error('Error calculating tax:', error);
      throw error;
    }
  }
};

// Establishment service - implements all establishment-related endpoints
// Updated establishment and user services in src/services/api.js
// Only showing the relevant sections that need to be updated

// Establishment service - update these functions
export const establishmentService = {
  getEstablishments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/establishments${queryString ? `?${queryString}` : ''}`);
      console.log('Raw establishments response:', response);
      
      // Handle different response formats
      if (response && response.establishments) {
        return response.establishments;
      } else if (response && Array.isArray(response)) {
        return response;
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Single establishment or custom format
        return response.data || response.establishments || [response];
      }
      
      // Fallback
      return [];
    } catch (error) {
      console.error('Error fetching establishments:', error);
      throw error;
    }
  },

  getEstablishment: async (id) => {
    try {
      const response = await api.get(`/establishments/${id}`);
      return response.establishment || response;
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
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        taxRate: data.taxRate ? parseFloat(data.taxRate) : undefined
      };
      
      console.log('Creating establishment with data:', formattedData);
      const response = await api.post('/establishments', formattedData);
      console.log('Establishment creation raw response:', response);
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
        totalRooms: data.totalRooms ? parseInt(data.totalRooms) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        taxRate: data.taxRate ? parseFloat(data.taxRate) : undefined
      };
      
      const response = await api.put(`/establishments/${id}`, formattedData);
      return response;
    } catch (error) {
      console.error('Error updating establishment:', error);
      throw error;
    }
  }
};

// User service - update these functions
// (Removed duplicate userService declaration to fix redeclaration error)
// Client service - implements all client-related endpoints
export const clientService = {
  getClients: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      console.log(`Fetching clients with params: ${queryString}`);
      const response = await api.get(`/clients${queryString ? `?${queryString}` : ''}`);
      
      // Handle different response formats
      return {
        data: response.clients || response.data || [],
        total: response.total || (response.clients?.length || 0)
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          data: [
            {
              id: 1,
              firstName: 'Jean',
              lastName: 'Dupont',
              documentNumber: 'FR123456',
              nationality: 'France',
              email: 'jean.dupont@example.com'
            },
            {
              id: 2,
              firstName: 'Marie',
              lastName: 'Martin',
              documentNumber: 'FR789012',
              nationality: 'France',
              email: 'marie.martin@example.com'
            }
          ],
          total: 2
        };
      }
      
      throw error;
    }
  },

  getClient: async (id) => {
    try {
      console.log(`Fetching client ${id}`);
      const response = await api.get(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  createClient: async (data) => {
    try {
      console.log('Creating client:', data);
      const response = await api.post('/clients', data);
      return response;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  updateClient: async (id, data) => {
    try {
      console.log(`Updating client ${id}:`, data);
      const response = await api.put(`/clients/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  deleteClient: async (id) => {
    try {
      console.log(`Deleting client ${id}`);
      const response = await api.delete(`/clients/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  verifyClient: async (id, data) => {
    try {
      console.log(`Verifying client ${id}:`, data);
      const response = await api.post(`/clients/${id}/verify`, data);
      return response;
    } catch (error) {
      console.error('Error verifying client:', error);
      throw error;
    }
  },

  blockClient: async (id, data) => {
    try {
      console.log(`Blocking client ${id}:`, data);
      const response = await api.post(`/clients/${id}/block`, data);
      return response;
    } catch (error) {
      console.error('Error blocking client:', error);
      throw error;
    }
  },

  unblockClient: async (id) => {
    try {
      console.log(`Unblocking client ${id}`);
      const response = await api.post(`/clients/${id}/unblock`);
      return response;
    } catch (error) {
      console.error('Error unblocking client:', error);
      throw error;
    }
  },

  importClients: async (data) => {
    try {
      console.log('Importing clients:', data);
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
      console.log(`Fetching stays for client ${id} with params: ${queryString}`);
      const response = await api.get(`/clients/${id}/stays${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching client stays:', error);
      throw error;
    }
  },

  registerHotelGuest: async (data) => {
    try {
      console.log('Registering hotel guest:', data);
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
      console.log(`Fetching stays with params: ${queryString}`);
      const response = await api.get(`/stays${queryString ? `?${queryString}` : ''}`);
      
      // Handle different response formats
      return {
        data: response.stays || response.data || [],
        total: response.total || (response.stays?.length || 0)
      };
    } catch (error) {
      console.error('Error fetching stays:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          data: [
            {
              id: 1,
              clientId: 1,
              establishmentId: 1,
              checkInDate: '2024-06-01',
              checkOutDate: '2024-06-05',
              duration: 4,
              room: '101',
              status: 'closed'
            },
            {
              id: 2,
              clientId: 2,
              establishmentId: 1,
              checkInDate: '2024-06-15',
              duration: 3,
              room: '205',
              status: 'active'
            }
          ],
          total: 2
        };
      }
      
      throw error;
    }
  },

  getStay: async (id) => {
    try {
      console.log(`Fetching stay ${id}`);
      const response = await api.get(`/stays/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching stay:', error);
      throw error;
    }
  },

  createStay: async (data) => {
    try {
      // Format numeric values
      const formattedData = {
        ...data,
        clientId: parseInt(data.clientId),
        establishmentId: parseInt(data.establishmentId),
        duration: parseInt(data.duration),
        adultCount: parseInt(data.adultCount || 1),
        childCount: parseInt(data.childCount || 0)
      };
      
      console.log('Creating stay:', formattedData);
      const response = await api.post('/stays', formattedData);
      return response;
    } catch (error) {
      console.error('Error creating stay:', error);
      throw error;
    }
  },

  updateStay: async (id, data) => {
    try {
      // Format numeric values if present
      const formattedData = {
        ...data
      };
      
      if (data.duration) formattedData.duration = parseInt(data.duration);
      if (data.adultCount) formattedData.adultCount = parseInt(data.adultCount);
      if (data.childCount) formattedData.childCount = parseInt(data.childCount);
      
      console.log(`Updating stay ${id}:`, formattedData);
      const response = await api.put(`/stays/${id}`, formattedData);
      return response;
    } catch (error) {
      console.error('Error updating stay:', error);
      throw error;
    }
  },

  deleteStay: async (id) => {
    try {
      console.log(`Deleting stay ${id}`);
      const response = await api.delete(`/stays/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting stay:', error);
      throw error;
    }
  },

  closeStay: async (id, data) => {
    try {
      console.log(`Closing stay ${id}:`, data);
      const response = await api.post(`/stays/${id}/close`, data);
      return response;
    } catch (error) {
      console.error('Error closing stay:', error);
      throw error;
    }
  },

  cancelStay: async (id, data) => {
    try {
      console.log(`Cancelling stay ${id}:`, data);
      const response = await api.post(`/stays/${id}/cancel`, data);
      return response;
    } catch (error) {
      console.error('Error cancelling stay:', error);
      throw error;
    }
  },

  extendStay: async (id, data) => {
    try {
      console.log(`Extending stay ${id}:`, data);
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
      console.log(`Fetching users with params: ${queryString}`);
      const response = await api.get(`/users${queryString ? `?${queryString}` : ''}`);
      
      // Handle different response formats
      return {
        data: response.users || response.data || [],
        total: response.total || (response.users?.length || 0)
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Development fallback
      if (process.env.NODE_ENV === 'development') {
        return {
          data: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
              active: true
            },
            {
              id: 2,
              username: 'manager',
              email: 'manager@example.com',
              firstName: 'Manager',
              lastName: 'User',
              role: 'manager',
              establishmentId: 1,
              active: true
            }
          ],
          total: 2
        };
      }
      
      throw error;
    }
  },

  getUser: async (id) => {
    try {
      console.log(`Fetching user ${id}`);
      const response = await api.get(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      console.log('Creating user:', data);
      const response = await api.post('/users', data);
      return response;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      console.log(`Updating user ${id}:`, data);
      const response = await api.put(`/users/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      console.log(`Deleting user ${id}`);
      const response = await api.delete(`/users/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  changePassword: async (id, data) => {
    try {
      console.log(`Changing password for user ${id}`);
      const response = await api.post(`/users/${id}/change-password`, data);
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  lockUser: async (id, data) => {
    try {
      console.log(`Locking user ${id}:`, data);
      const response = await api.post(`/users/${id}/lock`, data);
      return response;
    } catch (error) {
      console.error('Error locking user:', error);
      throw error;
    }
  },

  unlockUser: async (id) => {
    try {
      console.log(`Unlocking user ${id}`);
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
      console.log('Uploading document');
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
      console.log(`Fetching document ${id}`);
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
      console.log(`Fetching documents for ${type}/${id} with params: ${queryString}`);
      const response = await api.get(`/documents/entity/${type}/${id}${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching documents by entity:', error);
      throw error;
    }
  },

  generateTemporaryUrl: async (id, data) => {
    try {
      console.log(`Generating temporary URL for document ${id}:`, data);
      const response = await api.post(`/documents/${id}/url`, data);
      return response;
    } catch (error) {
      console.error('Error generating temporary URL:', error);
      throw error;
    }
  },

  optimizeDocument: async (id, data) => {
    try {
      console.log(`Optimizing document ${id}:`, data);
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
      console.log(`Fetching storage stats with params: ${queryString}`);
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
      console.log(`Fetching API keys with params: ${queryString}`);
      const response = await api.get(`/api-keys${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error('Error fetching API keys:', error);
      throw error;
    }
  },

  createApiKey: async (data) => {
    try {
      console.log('Creating API key:', data);
      const response = await api.post('/api-keys', data);
      return response;
    } catch (error) {
      console.error('Error creating API key:', error);
      throw error;
    }
  },

  deleteApiKey: async (id) => {
    try {
      console.log(`Deleting API key ${id}`);
      const response = await api.delete(`/api-keys/${id}`);
      return response;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  },

  verifyApiKey: async () => {
    try {
      console.log('Verifying API key');
      const response = await api.get('/auth/verify-api-key');
      return response;
    } catch (error) {
      console.error('Error verifying API key:', error);
      throw error;
    }
  }
};

export default api;