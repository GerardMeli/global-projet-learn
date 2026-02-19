import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import {
  AdminUserResponse,
  AdminUserUpdateRequest,
  UserStatusUpdateRequest,
  UserRoleUpdateRequest,
  UserListParams
} from '../../models/users/admin.model';
import { UserProfileResponse, PrivateUserResponse } from '../../models/users/profile.model';
import { environment } from '../../../environments/environment';
import { UserResponse } from '../../models/users/registration.model';
import { ApiResponse } from '../../models/users/api-response.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  // Make sure the URL matches exactly what your controller expects
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse<UserProfileResponse[]>> {
    // Get token directly from localStorage
    const token = localStorage.getItem('access_token');
    
    // Create headers exactly as your controller expects
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // Log everything for debugging
    console.log('🔍 AdminService.getAllUsers()');
    console.log('URL:', `${this.baseUrl}/`); // Note the trailing slash
    console.log('Token present:', !!token);
    console.log('Headers:', headers);

    // IMPORTANT: Add the trailing slash to match your controller
    return this.http.get<ApiResponse<UserProfileResponse[]>>(`${this.baseUrl}/`, { 
      headers,
      withCredentials: true // Important for CORS with credentials
    });
  }

  // ─── GET /api/admin/users/{userId} ───────────────────────────────────────
  // Returns: UserProfileResponse directly (no wrapper)
  // Source: UserServiceImpl.getUserById() → findUserById() → toProfileResponse()
  // Throws: ResourceNotFoundException if user not found
  getUserById(userId: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/${userId}`);
  }

  // ─── GET /api/admin/users/{userId}/basic ─────────────────────────────────
  // Returns: UserResponse directly — { id, email, role, isActive, createdAt }
  // Built inline in AdminController from UserServiceImpl.getUserById()
  getUserBasicInfo(userId: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${userId}/basic`);
  }

  // ─── PUT /api/admin/users/{userId} ───────────────────────────────────────
  // Returns: AdminUserResponse directly (no wrapper)
  // Source: UserServiceImpl.updateUser() → updateUserFromRequest() → toAdminResponse()
  // @PreAuthorize("hasRole('ADMIN')")
  updateUser(userId: number, data: AdminUserUpdateRequest): Observable<AdminUserResponse> {
    return this.http.put<AdminUserResponse>(`${this.baseUrl}/${userId}`, data);
  }

  // ─── PATCH /api/admin/users/{userId}/status ───────────────────────────────
  // Returns: AdminUserResponse directly (no wrapper)
  // Source: UserServiceImpl.updateUserStatus()
  // Side effect: triggers EmailServiceImpl.sendStatusChangeNotification()
  //   → sends email/status-change.html with reason to the user
  // @PreAuthorize("hasRole('ADMIN')")
  updateUserStatus(userId: number, data: UserStatusUpdateRequest): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/${userId}/status`, data);
  }

  // ─── PATCH /api/admin/users/{userId}/role ────────────────────────────────
  // Returns: AdminUserResponse directly (no wrapper)
  // Source: UserServiceImpl.updateUserRole()
  // Side effect: triggers EmailServiceImpl.sendRoleChangeNotification()
  //   → sends email/role-change.html with reason to the user
  updateUserRole(userId: number, data: UserRoleUpdateRequest): Observable<AdminUserResponse> {
    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/${userId}/role`, data);
  }

   // ─── DELETE /api/admin/users/{userId} ────────────────────────────────────
//   // Returns: void (HTTP 204 No Content)
//   // IMPORTANT: UserServiceImpl.deleteUser() calls usersRepository.deleteById()
//   // This is a HARD DELETE — NOT a soft delete. The record is permanently removed.
//   // (Unlike what I assumed earlier — no status set to DELETED here)
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }

  // For testing - simplified version
  testDirectGet(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get(`${this.baseUrl}/`, { 
      headers,
      observe: 'response' 
    });
  }
}