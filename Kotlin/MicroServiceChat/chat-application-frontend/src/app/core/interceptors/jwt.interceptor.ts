import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, switchMap, filter, take, catchError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service'; 

/**
 * Public routes that must NOT receive an Authorization header.
 * Mirrors SecurityConfig.kt — .permitAll() routes under /api/auth/**
 *
 * CRITICAL: /api/auth/reset-password is excluded in JwtAuthenticationFilter.shouldNotFilter()
 * The reset token (tokenType: "password_reset") would be rejected if sent as Bearer.
 */
const PUBLIC_ROUTES: string[] = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',   // JwtAuthenticationFilter.shouldNotFilter() skips this
  '/oauth2/',
  '/login/oauth2/',
];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip public routes — no Authorization header needed
    if (this.isPublicRoute(request.url)) {
      return next.handle(request);
    }

    // Attach Bearer token if valid access token exists
    const accessToken = this.tokenService.getAccessToken();
    if (accessToken && this.tokenService.isAccessToken(accessToken)) {
      request = this.addAuthHeader(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError(error => {
        // Handle 401 — attempt token refresh once, then logout
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        // Handle 403 — Access Denied from SecurityConfig accessDeniedHandler
        if (error instanceof HttpErrorResponse && error.status === 403) {
          console.error('Access denied:', error.error?.message);
        }
        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        // Header name mirrors JwtAuthenticationFilter.getJwtFromRequest()
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isPublicRoute(url: string): boolean {
    return PUBLIC_ROUTES.some(route => url.includes(route));
  }

  /**
   * Handles 401 by attempting a single token refresh.
   * If refresh fails, clears tokens and redirects to login.
   */
  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(response => {
          this.isRefreshing = false;
          const newToken = response.data?.accessToken;
          if (newToken) {
            this.refreshTokenSubject.next(newToken);
            return next.handle(this.addAuthHeader(request, newToken));
          }
          this.authService.logout();
          return throwError(() => new Error('Refresh failed'));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    // Queue requests while refresh is in progress
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addAuthHeader(request, token!)))
    );
  }
}