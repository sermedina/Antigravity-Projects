import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bolsi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('bolsi_token');
      localStorage.removeItem('bolsi_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
