import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const topupAPI = {
  getProducts: (ewallet) => api.get(`/topup/products/${ewallet}`),
  
  createTopup: (data) => api.post('/topup/create', data),
  
  checkStatus: (orderId) => api.get(`/topup/status/${orderId}`),
  
  cancelTopup: (orderId) => api.post(`/topup/cancel/${orderId}`),
};

export const telegramAPI = {
  getCountries: () => api.get('/telegram/countries'),
  createWithBalance: (data) => api.post('/telegram/create-with-balance', data),
  create: (data) => api.post('/telegram/create', data),
  checkStatus: (orderId) => api.get(`/telegram/status/${orderId}`),
  getCode: (orderId) => api.get(`/telegram/code/${orderId}`),
  cancelOrder: (orderId, data) => api.post(`/telegram/cancel/${orderId}`, data)
};

export default api;
