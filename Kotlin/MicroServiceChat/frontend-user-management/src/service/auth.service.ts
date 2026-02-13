import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, RefreshTokenRequest, TokenResponse } from '../type/auth.types';
import type { EmailVerificationRequest, ResendVerificationEmailRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../type/email.types';
import api from './api'; 

class AuthService {
  // Home endpoint
  async getHome(): Promise<string> {
    const response = await api.get<string>('/auth/');
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data);
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('userId', response.data.id.toString());
    }
    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/auth/refresh-token', data);
    return response.data;
  }

  async verifyEmail(data: EmailVerificationRequest): Promise<void> {
    await api.post('/auth/verify-email', data);
  }

  async resendVerificationEmail(data: ResendVerificationEmailRequest): Promise<void> {
    await api.post('/auth/resend-verification', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/auth/reset-password', data);
  }

  async logout(userId: number): Promise<void> {
    await api.post(`/auth/logout?userId=${userId}`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
  }

  getUserId(): number | null {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }
}

export default new AuthService();