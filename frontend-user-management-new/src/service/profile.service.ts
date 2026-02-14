import type { UserProfileResponse, UserProfileUpdateRequest, UserPreferencesUpdateRequest, PasswordChangeRequest, EmailUpdateRequest } from '../type/profile.types';
import api from './api'; 

class ProfileService {
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>(`/profile/${userId}`);
    return response.data;
  }

  async updateUserProfile(
    userId: number, 
    data: UserProfileUpdateRequest
  ): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>(`/profile/${userId}`, data);
    return response.data;
  }

  async updateUserPreferences(
    userId: number,
    data: UserPreferencesUpdateRequest
  ): Promise<UserProfileResponse> {
    const response = await api.patch<UserProfileResponse>(`/profile/${userId}/preferences`, data);
    return response.data;
  }

  async changePassword(
    userId: number,
    data: PasswordChangeRequest
  ): Promise<void> {
    await api.put(`/profile/${userId}/password`, data);
  }

  async requestEmailChange(
    userId: number,
    data: EmailUpdateRequest
  ): Promise<void> {
    await api.post(`/profile/${userId}/email-change-request`, data);
  }

  async confirmEmailChange(
    userId: number,
    token: string
  ): Promise<void> {
    await api.post(`/profile/${userId}/email-change-confirm?token=${token}`);
  }
}

export default new ProfileService();