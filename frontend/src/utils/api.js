import axios from 'axios';

// Determine API base URL based on environment
const getBaseURL = () => {
  // In production, use relative URL (same domain)
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // In development, use the backend server
  return process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
};

// Create axios instance
const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      // Don't redirect automatically to avoid loops
    }
    return Promise.reject(error);
  }
);

export default API;