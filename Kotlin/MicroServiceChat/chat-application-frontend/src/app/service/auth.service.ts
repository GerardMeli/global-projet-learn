import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router'; 
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  TokenResponse
} from '../models/registration.model';
import { TokenService } from '../core/services/token.service';
import { environment } from '../environments/environment';
import { ResendVerificationEmailRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models/email pwd.model';
import { ApiResponse } from './api.response.model';
import { ErrorHandlerService } from './error handler.service';
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  // ─── POST /api/auth/register ─────────────────────────────────────────────
  // Returns RegisterResponse directly (HTTP 201) — no ApiResponse wrapper.
  // On success: status=PENDING, emailVerified=false.
  // Backend sends email/email-verification.html to the registered email.
  // Throws: EmailAlreadyExistsException → 409 → AuthErrorCode.EMAIL_ALREADY_EXISTS
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}/register`,
      { language: 'FR', ...data }
    );
  }

  // ─── POST /api/auth/login ─────────────────────────────────────────────────
  // Returns ApiResponse<LoginResponse>.
  // LoginResponse.token = access token (JWT with claims: userId, email, role, tokenType:"access")
  // Also returns X-Session-Id header.
  // Account locks after 5 failed attempts (handleFailedLogin in AuthServiceImpl).
  // Throws:
  //   IllegalArgumentException  → 400 → USER_NOT_FOUND or INVALID_PASSWORD
  //   IllegalStateException     → 403 → ACCOUNT_INACTIVE
  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Field is "token" (not "accessToken") — confirmed from AuthController + AuthServiceImpl
          this.tokenService.saveTokens(response.data.token, '');
        }
      })
    );
  }

  // ─── POST /api/auth/refresh-token ─────────────────────────────────────────
  // Returns TokenResponse directly (no wrapper): { accessToken, refreshToken, tokenType, expiresIn }
  // expiresIn = jwtProvider.getAccessTokenExpiration() (milliseconds, not seconds!)
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

  // ─── GET /api/auth/verify-email?token= ───────────────────────────────────
  // Returns void (HTTP 200, empty body).
  // NOTE: EmailController also handles GET /api/auth/verify-email → Thymeleaf page.
  // If base-url in application.yaml points to Angular (:4200), Angular handles this.
  // If base-url points to Spring (:8082), Thymeleaf handles it instead.
  // See: email-flows.model.ts for full routing guidance.
  verifyEmail(token: string): Observable<void> {
    return this.http.get<void>(`${this.baseUrl}/verify-email`, {
      params: { token }
    });
  }

  // ─── POST /api/auth/resend-verification ──────────────────────────────────
  // Returns void. Throws BadRequestException if already verified.
  // Resends email/email-verification.html via EmailServiceImpl.sendVerificationEmail()
  resendVerification(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/resend-verification`,
      { email } as ResendVerificationEmailRequest
    );
  }

  // ─── POST /api/auth/forgot-password ──────────────────────────────────────
  // Returns void. Sends email/password-reset.html via EmailServiceImpl.
  // Token type: "password_reset" — validated by TokenService.validatePasswordResetToken()
  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/forgot-password`,
      { email } as ForgotPasswordRequest
    );
  }

  // ─── POST /api/auth/reset-password ───────────────────────────────────────
  // Returns plain map: { success: true, message: "Password reset successfully" }
  // CRITICAL: token in BODY — NOT as Authorization header.
  // Backend validates: newPassword === confirmPassword (throws BadRequestException if not)
  // Backend uses: TokenService.validatePasswordResetToken() which returns email (not userId)
  // After reset: token is deleted from store (deletePasswordResetToken)
  resetPassword(payload: ResetPasswordRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/reset-password`,
      payload
    );
  }

  // ─── POST /api/auth/logout?userId= ───────────────────────────────────────
  // Returns void. Clears Spring SecurityContextHolder on backend.
  // Frontend: always clear local tokens regardless of server response.
  logoutFromServer(userId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/logout`,
      null,
      { params: { userId } }
    );
  }

  // ─── Local session helpers ────────────────────────────────────────────────

  logout(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (userId) {
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