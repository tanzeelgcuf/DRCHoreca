const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api',
  authURL: process.env.REACT_APP_AUTH_URL || 'http://localhost:8081/auth',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

export default API_CONFIG;