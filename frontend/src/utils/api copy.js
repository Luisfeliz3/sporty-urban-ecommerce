import axios from 'axios';

// Determine API base URL
const getBaseURL = () => {
  // In development, use proxy or direct URL
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:/api';
  }
  // In production, use environment variable
  return process.env.REACT_APP_API_URL || '/api';
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
    console.log(`🔄 API Call: ${config.method?.toUpperCase()} ${config.url}`);
    
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
    console.error('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);
// Response interceptor - update this part
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Success: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('🚨 API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      responseData: error.response?.data, // This will show the actual error message from backend
      requestData: error.config?.data // This shows what we sent
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      console.log('🔐 Auto-logout due to 401 response');
    }

    return Promise.reject(error);
  }
);

export default API;