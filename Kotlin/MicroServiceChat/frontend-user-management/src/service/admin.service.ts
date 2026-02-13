import type { PaginatedUsersResponse, UserSearchCriteria, AdminUserResponse, AdminUserUpdateRequest, UserStatusUpdateRequest, UserRoleUpdateRequest } from '../type/admin.types';
import api from './api';

class AdminService {
  async getAllUsers(
    page: number = 0,
    size: number = 20,
    sort: string = 'id,desc'
  ): Promise<PaginatedUsersResponse> {
    const response = await api.get<PaginatedUsersResponse>('/admin/users', {
      params: { page, size, sort }
    });
    return response.data;
  }

  async searchUsers(
    criteria: UserSearchCriteria,
    page: number = 0,
    size: number = 20,
    sort: string = 'id,desc'
  ): Promise<PaginatedUsersResponse> {
    const response = await api.get<PaginatedUsersResponse>('/admin/users/search', {
      params: { ...criteria, page, size, sort }
    });
    return response.data;
  }

  async getUserById(userId: number): Promise<AdminUserResponse> {
    const response = await api.get<AdminUserResponse>(`/admin/users/${userId}`);
    return response.data;
  }

  async updateUser(
    userId: number,
    data: AdminUserUpdateRequest
  ): Promise<AdminUserResponse> {
    const response = await api.put<AdminUserResponse>(`/admin/users/${userId}`, data);
    return response.data;
  }

  async updateUserStatus(
    userId: number,
    data: UserStatusUpdateRequest
  ): Promise<AdminUserResponse> {
    const response = await api.patch<AdminUserResponse>(`/admin/users/${userId}/status`, data);
    return response.data;
  }

  async updateUserRole(
    userId: number,
    data: UserRoleUpdateRequest
  ): Promise<AdminUserResponse> {
    const response = await api.patch<AdminUserResponse>(`/admin/users/${userId}/role`, data);
    return response.data;
  }

  async deleteUser(userId: number): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  }
}

export default new AdminService();