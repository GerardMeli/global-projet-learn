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
    
    // Clone the request and add headers
    let modifiedRequest = request;
    
    // Check if the request body is FormData (for file uploads)
    const isFormData = request.body instanceof FormData;
    
    if (token) {
      const headers: any = {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      };
      
      // Only set Content-Type for non-FormData requests
      // FormData requests must let the browser set Content-Type with boundary
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      // Add authorization header and CORS headers
      modifiedRequest = request.clone({
        setHeaders: headers,
        withCredentials: true // Important for CORS
      });
      
      console.log(`🔐 Added token to request: ${request.method} ${request.url} ${isFormData ? '(FormData)' : ''}`);
    } else {
      // Even without token, add CORS headers
      const headers: any = {
        'Accept': 'application/json'
      };
      
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }
      
      modifiedRequest = request.clone({
        setHeaders: headers,
        withCredentials: true
      });
      console.warn(`⚠️ No token for protected route: ${request.url}`);
    }

    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error);
        
        if (error.status === 401) {
          console.error('🔄 401 error - token might be expired');
          this.authService.logout();
          // Redirect to login
          window.location.href = '/auth/login';
        } else if (error.status === 403) {
          console.error('🔒 403 error - forbidden access');
          console.error('Response:', error.error);
          // You might want to show a notification here
        } else if (error.status === 0) {
          console.error('📡 Network/CORS error - check if backend is running and CORS is configured');
          // Network error or CORS issue
        }
        
        return throwError(() => error);
      })
    );
  }

  private isPublicRoute(url: string): boolean {
    return PUBLIC_ROUTES.some(route => url.includes(route));
  }
}