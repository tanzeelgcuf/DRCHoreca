import httpClient from './httpClient';
import API_CONFIG from '../config/api';

class AuthService {
  async login(credentials) {
    try {
      const response = await httpClient.post(`${API_CONFIG.authURL}/login`, credentials);
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await httpClient.post(`${API_CONFIG.authURL}/register`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  }

  async logout() {
    try {
      await httpClient.post(`${API_CONFIG.authURL}/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }
}

export default new AuthService();