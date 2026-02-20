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
  private readonly baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse<UserProfileResponse[]>> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('🔍 AdminService.getAllUsers()');
    console.log('URL:', `${this.baseUrl}/`);
    console.log('Token present:', !!token);

    return this.http.get<ApiResponse<UserProfileResponse[]>>(`${this.baseUrl}/`, { 
      headers,
      withCredentials: true
    });
  }
  
  // ─── GET /api/admin/users/{userId} ───────────────────────────────────────
  // FIXED: Added Authorization header
  getUserById(userId: number): Observable<UserProfileResponse> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    console.log('🔍 AdminService.getUserById()');
    console.log('URL:', `${this.baseUrl}/${userId}`);
    console.log('Token present:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'none');

    return this.http.get<UserProfileResponse>(`${this.baseUrl}/${userId}`, { 
      headers,
      withCredentials: true 
    });
  }

  // ─── GET /api/admin/users/{userId}/basic ─────────────────────────────────
  getUserBasicInfo(userId: number): Observable<UserResponse> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.get<UserResponse>(`${this.baseUrl}/${userId}/basic`, { 
      headers,
      withCredentials: true 
    });
  }

  // ─── PUT /api/admin/users/{userId} ───────────────────────────────────────
  updateUser(userId: number, data: AdminUserUpdateRequest): Observable<AdminUserResponse> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.put<AdminUserResponse>(`${this.baseUrl}/${userId}`, data, { 
      headers,
      withCredentials: true 
    });
  }

  // ─── PATCH /api/admin/users/{userId}/status ───────────────────────────────
  updateUserStatus(userId: number, data: UserStatusUpdateRequest): Observable<AdminUserResponse> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/${userId}/status`, data, { 
      headers,
      withCredentials: true 
    });
  }

  // ─── PATCH /api/admin/users/{userId}/role ────────────────────────────────
  updateUserRole(userId: number, data: UserRoleUpdateRequest): Observable<AdminUserResponse> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.patch<AdminUserResponse>(`${this.baseUrl}/${userId}/role`, data, { 
      headers,
      withCredentials: true 
    });
  }

  // ─── DELETE /api/admin/users/{userId} ────────────────────────────────────
  deleteUser(userId: number): Observable<void> {
    const token = localStorage.getItem('access_token');
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.delete<void>(`${this.baseUrl}/${userId}`, { 
      headers,
      withCredentials: true 
    });
  }

  // For testing - simplified version
  testDirectGet(userId?: number): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    const url = userId ? `${this.baseUrl}/${userId}` : `${this.baseUrl}/`;
    
    return this.http.get(url, { 
      headers,
      observe: 'response' 
    });
  }
}