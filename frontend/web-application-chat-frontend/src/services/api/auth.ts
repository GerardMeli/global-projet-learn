// src/services/api/auth.ts
import api from './api';

export const authApi = {
  // Login
  login: (email: string, password: string) => 
    api.post('/api/auth/login', { email, password }),
  
  // Register
  register: (email: string, password: string, role?: string) => 
    api.post('/api/auth/register', { email, password, role }),
  
  // Check email availability
  checkEmail: (email: string) => 
    api.get('/api/auth/check-email', { params: { email } }),
  
  // Get current user
  getMe: () => api.get('/api/auth/me'),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
  
  // Refresh token
  refreshToken: () => api.post('/api/auth/refresh-token'),
  
  // Validate token
  validateToken: (token: string) => 
    api.post('/api/auth/validate-token', null, { params: { token } }),
};