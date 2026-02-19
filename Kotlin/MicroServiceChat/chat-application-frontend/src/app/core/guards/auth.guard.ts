import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { TokenService } from '../services/users/token.service';

/**
 * Guards routes that require authentication.
 * Mirrors SecurityConfig: .anyRequest().authenticated()
 *
 * Checks that:
 * 1. An access token exists in localStorage
 * 2. The token type is "access" (not refresh/reset — mirrors JwtAuthenticationFilter)
 * 3. The token is not expired
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.tokenService.hasValidAccessToken()) {
      return true;
    }

    // Redirect to login, preserve intended destination
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}