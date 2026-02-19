import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../services/users/token.service';
import { AuthService } from '../services/users/auth.service';

const PUBLIC_ROUTES: string[] = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/refresh-token',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check if it's a public route
    if (this.isPublicRoute(request.url)) {
      return next.handle(request);
    }

    // Get token
    const token = this.tokenService.getAccessToken();
    
    if (token) {
      // Clone the request and add the authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true // Important for CORS
      });
      
      console.log(`🔐 Added token to request: ${request.method} ${request.url}`);
    } else {
      console.warn(`⚠️ No token for protected route: ${request.url}`);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error('🔄 401 error - token might be expired');
          // Handle 401 error - maybe redirect to login
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  private isPublicRoute(url: string): boolean {
    return PUBLIC_ROUTES.some(route => url.includes(route));
  }
}