// ./frontend/src/api/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 and server errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please log in again.'));
    }

    // Retry on 5xx (max 2 retries) — skip uploads to avoid double-ingestion
    const isUpload = config?.url?.includes('/uploads');
    if (
      config &&
      !isUpload &&
      (!config.retryCount || config.retryCount < 2) &&
      error.response?.status >= 500
    ) {
      config.retryCount = (config.retryCount || 0) + 1;
      await new Promise((r) => setTimeout(r, 1000));
      return api(config);
    }

    const message =
      error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const response = await api.post('/v1/auth/login', { email, password });
  return response.data.data; // { token, user }
};

export const signupUser = async (name, email, password) => {
  const response = await api.post('/v1/auth/signup', {
    name,
    email,
    password,
    passwordConfirm: password,
  });
  return response.data.data;
};

// ─── Chat ────────────────────────────────────────────────────────────────────

export const sendMessage = async (message, sessionId) => {
  const response = await api.post('/v1/chat', { message, sessionId });
  return response.data.data.response;
};

export const fetchChatHistory = async (page = 1, limit = 50, sessionId = null) => {
  const params = { page, limit };
  if (sessionId) params.sessionId = sessionId;
  const response = await api.get('/v1/chat/history', { params });
  return response.data;
};

export const deleteChatById = async (chatId) => {
  const response = await api.delete(`/v1/chat/${chatId}`);
  return response.data;
};

export const deleteChatSession = async (sessionId) => {
  const response = await api.delete(`/v1/chat/session/${sessionId}`);
  return response.data;
};

export const updateChatFeedback = async (chatId, feedback) => {
  const response = await api.patch(`/v1/chat/${chatId}/feedback`, feedback);
  return response.data;
};

// ─── Uploads ─────────────────────────────────────────────────────────────────

/**
 * Upload a PDF file — ingested into n8n → Drive → Qdrant → MongoDB
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/v1/uploads', formData, {
    headers: {
      'Content-Type': undefined, 
    },
    timeout: 120000,
  });
};

/**
 * Fetch all uploaded documents for the current user from MongoDB
 */
export const fetchUploadHistory = async (page = 1, limit = 50) => {
  const response = await api.get('/v1/uploads', { params: { page, limit } });
  return response.data;
};

/**
 * Delete a document — removes from Drive, Qdrant, and MongoDB
 */
export const deleteDocument = async (uploadId) => {
  const response = await api.delete(`/v1/uploads/${uploadId}`);
  return response.data;
};

// ─── Contact ────────────────────────────────────────────────────────────────
export const sendContactForm = async (formData) => {
  const response = await api.post('/v1/contact', formData);
  return response.data;
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const fetchAnalyticsDataApi = async () => {
  const response = await api.get('/v1/analytics');
  return response.data; // { success, data }
};

export default api;