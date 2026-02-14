import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

// Logger personnalisé
const logRequest = (config: InternalAxiosRequestConfig) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  console.log('[API Request Headers]', config.headers);
  if (config.data) {
    console.log('[API Request Data]', config.data);
  }
  return config;
};

const logResponse = (response: AxiosResponse) => {
  console.log(`[API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
  console.log('[API Response Data]', response.data);
  return response;
};

const logError = (error: AxiosError) => {
  console.error('[API Error]', {
    message: error.message,
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    data: error.response?.data
  });
  return Promise.reject(error);
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor avec logs
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log en développement uniquement
    if (import.meta.env.DEV) {
      logRequest(config);
    }
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('[API Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor avec logs
api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      logResponse(response);
    }
    return response;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      logError(error);
    }
    return Promise.reject(error);
  }
);

export default api;