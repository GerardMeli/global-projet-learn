import type { EmailVerificationRequest, ForgotPasswordRequest, ResendVerificationEmailRequest, ResetPasswordRequest } from '../type/email.types';
import api from './api'; 

class EmailService {
  async verifyEmail(data: EmailVerificationRequest): Promise<void> {
    await api.post('/email/verify', data);
  }

  async resendVerificationEmail(data: ResendVerificationEmailRequest): Promise<void> {
    await api.post('/email/resend-verification', data);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await api.post('/email/forgot-password', data);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await api.post('/email/reset-password', data);
  }
}

export default new EmailService();