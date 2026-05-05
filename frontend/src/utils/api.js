/**
 * API utility
 * Uses relative /api paths → Vite proxy → backend on localhost:5001
 * This avoids ALL CORS and IPv4/IPv6 issues.
 */

import axios from 'axios';

// Empty baseURL = relative paths, goes through Vite proxy
const api = axios.create({
  baseURL: '',
  timeout: 30000,
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Friendly error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message;
    if (!err.response) {
      message = 'Backend server is not running. Please start the backend on port 5001.';
    } else {
      const status    = err.response.status;
      const serverMsg = err.response.data?.message;
      if (status === 401) message = serverMsg || 'Invalid email or password.';
      else if (status === 400) message = serverMsg || 'Please check your input.';
      else if (status === 500) message = serverMsg || 'Server error. Please try again.';
      else if (status === 404) message = 'API route not found.';
      else message = serverMsg || err.message || 'Something went wrong.';
    }
    return Promise.reject(new Error(message));
  }
);

// ─── Feature API calls ────────────────────────────────────────────────────────

export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await api.post('/api/predict-disease', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getWeather = async (city) => {
  const res = await api.get(`/api/weather?city=${encodeURIComponent(city)}`);
  return res.data;
};

export const getSoilRecommendation = async (soilData) => {
  const res = await api.post('/api/soil-recommendation', soilData);
  return res.data;
};

export const getIrrigationAdvice = async (data) => {
  const res = await api.post('/api/irrigation-advice', data);
  return res.data;
};

export const getCropRecommendation = async (data) => {
  const res = await api.post('/api/crop-recommendation', data);
  return res.data;
};

export const getHistory = async (params = {}) => {
  const res = await api.get('/api/history', { params });
  return res.data;
};

export const deleteHistoryEntry = async (id) => {
  const res = await api.delete(`/api/history/${id}`);
  return res.data;
};

export const clearHistory = async () => {
  const res = await api.delete('/api/history');
  return res.data;
};

export default api;
