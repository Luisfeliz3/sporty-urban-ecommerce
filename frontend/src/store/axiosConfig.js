import axios from 'axios';

// Helper function to get token
const getToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('userToken') || 
         localStorage.getItem('authToken') ||
         (() => {
           const userInfo = localStorage.getItem('userInfo');
           if (userInfo) {
             try {
               const user = JSON.parse(userInfo);
               return user.token || user.accessToken;
             } catch (e) {
               return null;
             }
           }
           return null;
         })();
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Request interceptor to add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;