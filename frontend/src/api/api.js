// ./frontend/src/api/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Direct backend mapping
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout for complex AI queries
});

// Request interceptor: Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only attach Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Ensure no stale auth header is present
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle token expiration and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // Clear invalid token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.warn('Token expired or invalid. Please log in again.');
    }
    
    // Retry mechanism for server errors (Max 2 retries)
    if (config && (!config.retryCount || config.retryCount < 2) && error.response && error.response.status >= 500) {
      config.retryCount = config.retryCount ? config.retryCount + 1 : 1;
      await new Promise(r => setTimeout(r, 1000));
      return api(config);
    }
    
    // Extract meaningful error message from backend response
    if (error.response && error.response.data) {
      const { message, data } = error.response.data;
      if (message) {
        return Promise.reject(new Error(message));
      }
    }
    
    // Fallback to error message or generic message
    const errorMsg = error.message || 'An error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.data;
};

export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data.data;
};

/**
 * Sends a message to the RAG enabled backend route. 
 * @param {string} message - Query question
 * @param {string} sessionId - Associated ID
 * @returns {Promise<string>} The synthesized text from backend
 */
export const sendMessage = async (message, sessionId) => {
  const response = await api.post('/chat', { message, sessionId });
  return response.data.data.response;
};

/**
 * Pipes a PDF file explicitly through the isolated upload micro-routing layer.
 * @param {File} file - Valid PDF formatting
 * @returns {Promise<object>} Returns explicit success mapping 
 */
export const uploadFile = async (file, sessionId = null) => {
  const formData = new FormData();
  formData.append('file', file); 
  if (sessionId) formData.append('sessionId', sessionId);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000, // Wait longer for embedding tasks dynamically
  });
  
  return response.data;
};

export default api;
