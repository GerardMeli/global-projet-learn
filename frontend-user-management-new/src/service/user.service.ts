import type { UserSearchCriteria, PaginatedUsersResponse, AdminUserResponse, AdminUserUpdateRequest, UserStatusUpdateRequest, UserRoleUpdateRequest } from '../type/admin.types';
import type { EmailUpdateRequest, PasswordChangeRequest, UserPreferencesUpdateRequest, UserProfileResponse, UserProfileUpdateRequest } from '../type/profile.types';
import api from './api'; 

class UserService {
  // Profile
  async getProfile(): Promise<UserProfileResponse> {
    const response = await api.get<UserProfileResponse>('/profile');
    return response.data;
  }

  async updateProfile(data: UserProfileUpdateRequest): Promise<UserProfileResponse> {
    const response = await api.put<UserProfileResponse>('/profile', data);
    return response.data;
  }

  async updatePreferences(data: UserPreferencesUpdateRequest): Promise<UserProfileResponse> {
    const response = await api.patch<UserProfileResponse>('/profile/preferences', data);
    return response.data;
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await api.post('/profile/change-password', data);
  }

  async updateEmail(data: EmailUpdateRequest): Promise<void> {
    await api.post('/profile/update-email', data);
  }

  // Admin
  async getAllUsers(params?: UserSearchCriteria): Promise<PaginatedUsersResponse> {
    const response = await api.get<PaginatedUsersResponse>('/admin/users', { params });
    return response.data;
  }

  async getUserById(id: number): Promise<AdminUserResponse> {
    const response = await api.get<AdminUserResponse>(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: AdminUserUpdateRequest): Promise<AdminUserResponse> {
    const response = await api.put<AdminUserResponse>(`/admin/users/${id}`, data);
    return response.data;
  }

  async updateUserStatus(id: number, data: UserStatusUpdateRequest): Promise<AdminUserResponse> {
    const response = await api.patch<AdminUserResponse>(`/admin/users/${id}/status`, data);
    return response.data;
  }

  async updateUserRole(id: number, data: UserRoleUpdateRequest): Promise<AdminUserResponse> {
    const response = await api.patch<AdminUserResponse>(`/admin/users/${id}/role`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }
}

export default new UserService();