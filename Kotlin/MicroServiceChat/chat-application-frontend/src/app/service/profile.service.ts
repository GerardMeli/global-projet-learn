import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserPreferencesUpdateRequest,
  PasswordChangeRequest,
  EmailUpdateRequest,
  PrivateUserResponse
} from '../models/profile.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {

  // ProfileController @RequestMapping("/api/profile")
  // ALWAYS pass userId in path — extracted from JWT via TokenService.getCurrentUserId()
  private readonly baseUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  // ─── GET /api/profile/{userId} ────────────────────────────────────────────
  // Returns: UserProfileResponse directly (no wrapper)
  // Source: UserServiceImpl.getUserProfile() → findUserById() → toProfileResponse()
  // Throws: ResourceNotFoundException (→ 404) if userId not found
  getUserProfile(userId: number): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/${userId}`);
  }

  // ─── PUT /api/profile/{userId} ────────────────────────────────────────────
  // Returns: UserProfileResponse directly (no wrapper)
  // Source: UserServiceImpl.updateUserProfile() — only updates non-null fields
  // Fields: firstName, lastName, phoneNumber, address (all optional)
  updateUserProfile(userId: number, data: UserProfileUpdateRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.baseUrl}/${userId}`, data);
  }

  // ─── PATCH /api/profile/{userId}/preferences ──────────────────────────────
  // Returns: UserProfileResponse directly (no wrapper)
  // Source: UserServiceImpl.updateUserPreferences() — only updates non-null fields
  // Fields: language, theme, emailNotifications
  updateUserPreferences(userId: number, data: UserPreferencesUpdateRequest): Observable<UserProfileResponse> {
    return this.http.patch<UserProfileResponse>(`${this.baseUrl}/${userId}/preferences`, data);
  }

  // ─── PUT /api/profile/{userId}/password ───────────────────────────────────
  // Returns: void (HTTP 200, empty body)
  // Source: UserServiceImpl.changePassword()
  // Throws:
  //   InvalidPasswordException → if currentPassword doesn't match stored hash
  //   BadRequestException      → if newPassword !== confirmPassword (server also validates)
  changePassword(userId: number, data: PasswordChangeRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/password`, data);
  }

  // ─── POST /api/profile/{userId}/email-change-request ─────────────────────
  // Returns: void (HTTP 200, empty body)
  // Source: UserServiceImpl.requestEmailChange()
  // Validates: password must match stored hash (InvalidPasswordException)
  // Validates: newEmail must not already exist (EmailAlreadyExistsException)
  // Side effect: creates email_change token → sends email-change-confirmation.html
  //   link format: {baseUrl}/api/profile/email-change-confirm?token={token}
  requestEmailChange(userId: number, data: EmailUpdateRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${userId}/email-change-request`, data);
  }

  // ─── GET /api/profile/email-change-confirm?token= ────────────────────────
  // Returns: { "succès": boolean, "message": string, "horodatage": number }
  // Source: ProfileController.confirmEmailChange() → UserServiceImpl.confirmEmailChange()
  //   → TokenService.validateEmailChangeToken() returns Pair(userId, newEmail)
  //   → Sets user.email = newEmail, user.emailVerified = true
  //   → Deletes token
  // Note: French key names from backend — typed exactly as returned
  confirmEmailChange(token: string): Observable<EmailChangeConfirmResponse> {
    return this.http.get<EmailChangeConfirmResponse>(
      `${this.baseUrl}/email-change-confirm`,
      { params: { token } }
    );
  }

  // ─── GET /api/profile/except/{currentUserId} ─────────────────────────────
  // Returns: PrivateUserResponse[] | null
  // Source: UserServiceImpl.getAllUsersExceptCurrentUser()
  //   → findAllExceptCurrentUser() custom repository query
  //   → PrivateUserResponse: { id, email, isActive, role: string }
  // Note: role is returned as string (enum.name), not UserRole enum — handle accordingly
  getAllUsersExceptCurrent(currentUserId: number): Observable<PrivateUserResponse[] | null> {
    return this.http.get<PrivateUserResponse[] | null>(
      `${this.baseUrl}/except/${currentUserId}`
    );
  }
}

// French key response from ProfileController.confirmEmailChange()
export interface EmailChangeConfirmResponse {
  'succès': boolean;
  message: string;
  horodatage: number;
}