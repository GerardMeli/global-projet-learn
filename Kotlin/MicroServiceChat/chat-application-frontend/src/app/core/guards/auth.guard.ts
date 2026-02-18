import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiResponse, AuthTokens } from '../models/api-response.model'; 
import { environment } from '../../environments/environment';
import { TokenService } from '../services/token.service';

// ─── Request DTOs (will be completed once backend DTOs are shared) ───────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  // Fields to be completed from RegistrationDto.kt
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  // Token from password-reset email link
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

export interface LoginResponse extends ApiResponse<AuthTokens> {
  data: AuthTokens;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {}

  // ─── Public endpoints (no JWT required) ─────────────────────────────────────
  // Source: SecurityConfig.kt — .requestMatchers("/api/auth/**").permitAll()

  /**
   * POST /api/auth/login
   * Returns access + refresh tokens. Stores them automatically.
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.saveTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
        }
      })
    );
  }

  /**
   * POST /api/auth/register
   */
  register(data: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/register`, data);
  }

  /**
   * POST /api/auth/refresh-token
   * Sends refresh token, receives new access token.
   * JwtAuthenticationFilter only accepts tokenType === "access" — refresh tokens are rejected.
   */
  refreshToken(): Observable<LoginResponse> {
    const refreshToken = this.tokenService.getRefreshToken();
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh-token`, {
      refreshToken
    } as RefreshTokenRequest).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.tokenService.saveTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
        }
      })
    );
  }

  /**
   * GET /api/auth/verify-email?token=...
   * Token type: "email_verification" — validated by JwtProvider.validateEmailVerificationToken()
   */
  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/verify-email`, {
      params: { token }
    });
  }

  /**
   * POST /api/auth/resend-verification
   */
  resendVerification(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/resend-verification`, {
      email
    } as ResendVerificationRequest);
  }

  /**
   * POST /api/auth/forgot-password
   * Triggers backend to send email with password_reset token
   */
  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/forgot-password`, {
      email
    } as ForgotPasswordRequest);
  }

  /**
   * POST /api/auth/reset-password
   * IMPORTANT: JwtAuthenticationFilter explicitly SKIPS this route (shouldNotFilter).
   * The reset token (tokenType: "password_reset") must NOT be sent as Authorization header.
   * It is sent in the request body instead.
   */
  resetPassword(token: string, newPassword: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/reset-password`, {
      token,
      newPassword
    } as ResetPasswordRequest);
  }

  // ─── Session management ───────────────────────────────────────────────────

  logout(): void {
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