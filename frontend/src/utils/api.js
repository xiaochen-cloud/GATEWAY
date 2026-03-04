import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail;
    const errorMessage = (typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail.map(d => d.msg || d).join('；') : null)) || error.message || '请求失败';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;