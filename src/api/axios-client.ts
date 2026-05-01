import { useAuthStore } from '@/stores/auth-store';
import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // handle global error
    if (error.response && error.response.status === 401) {
      const { logout } = useAuthStore.getState();
      logout();
      window.location.href = '/login';
    }

    let message = error.message || 'An error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response?.data?.message;
    }

    toast.error(message);

    return Promise.reject(error);
  }
);

export default api;
