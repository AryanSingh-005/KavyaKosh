import axios from 'axios';

/**
 * Centralized Axios HTTP client instance.
 *
 * Configured with VITE_API_BASE_URL environment variable.
 * Automatically injects the JWT bearer token from localStorage on every request.
 *
 * NOTE: The frontend NEVER contains AI keys, database credentials, or secrets.
 * All operations and AI interactions route exclusively through the Spring Boot backend.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token invalidation
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginOrRegister =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');
      if (!isLoginOrRegister && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default client;
