import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse } from '../../models/users/api-response.model';
import { TokenService } from './token.service';
import { environment } from '../../../environments/environment'; 
import { ResendVerificationEmailRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../../models/users/email pwd.model';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, TokenResponse, RefreshTokenRequest } from '../../models/users/registration.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // ─── POST /api/auth/register ─────────────────────────────────────────────
  // Returns RegisterResponse directly (HTTP 201) — no ApiResponse wrapper.
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/register`,
      { language: 'FR', ...data }
    );
  }

  // ─── POST /api/auth/login ─────────────────────────────────────────────────
  // Returns ApiResponse<LoginResponse>.
  // Field is "token" (not "accessToken") — confirmed from AuthController.kt
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.saveTokens(response.data.token, '');
        }
      })
    );
  }

  // ─── POST /api/auth/refresh-token ─────────────────────────────────────────
  // Returns TokenResponse directly (no wrapper): { accessToken, refreshToken, tokenType, expiresIn }
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<TokenResponse>(
      `${this.baseUrl}/refresh-token`,
      { refreshToken } as RefreshTokenRequest
    ).pipe(
      tap(response => {
        if (response?.accessToken) {
          this.tokenService.saveTokens(response.accessToken, response.refreshToken);
        }
      })
    );
  }

  // ─── GET /api/auth/verify-email?token= ────────────────────────────────────
  // Returns void (HTTP 200, empty body).
  verifyEmail(token: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/verify-email`, { params: { token } });
  }

  // ─── POST /api/auth/resend-verification ───────────────────────────────────
  // Returns void.
  resendVerification(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/resend-verification`,
      { email } as ResendVerificationEmailRequest
    );
  }

  // ─── POST /api/auth/forgot-password ───────────────────────────────────────
  // Returns void.
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/forgot-password`,
      { email } as ForgotPasswordRequest
    );
  }

  // ─── POST /api/auth/reset-password ────────────────────────────────────────
  // Returns plain map: { success: true, message: "Password reset successfully" }
  // CRITICAL: token goes in BODY — JwtAuthenticationFilter.shouldNotFilter() skips this route.
  resetPassword(payload: ResetPasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/reset-password`,
      payload
    );
  }

  // ─── POST /api/auth/logout?userId= ────────────────────────────────────────
  // Returns void. Clears Spring SecurityContextHolder on backend.
  logoutFromServer(userId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/logout`,
      null,
      { params: { userId } }
    );
  }

  // ─── Local session helpers ─────────────────────────────────────────────────

  logout(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (userId) {
      // Fire-and-forget — always clear locally regardless of server response
      this.logoutFromServer(userId).subscribe({ error: () => {} });
    }
    this.tokenService.clearTokens();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return this.tokenService.hasValidAccessToken();
  }

  isAdmin(): boolean {
    return this.tokenService.isAdmin();
  }
}