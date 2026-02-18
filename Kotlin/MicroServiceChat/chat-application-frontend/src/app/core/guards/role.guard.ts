import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guards routes that require a specific role.
 * Mirrors SecurityConfig: .requestMatchers("/api/admin/**").hasRole("ADMIN")
 *
 * Usage in routing:
 * {
 *   path: 'admin',
 *   canActivate: [AuthGuard, RoleGuard],
 *   data: { roles: ['ADMIN'] },
 *   ...
 * }
 *
 * Note: Backend stores role as "ADMIN" in JWT claim (without ROLE_ prefix).
 * The ROLE_ prefix is added by JwtAuthenticationFilter on the backend side only.
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles: string[] = route.data['roles'] ?? [];

    // No roles required — just authentication is enough
    if (requiredRoles.length === 0) {
      return true;
    }

    const userRole = this.tokenService.getCurrentUserRole();

    if (userRole && requiredRoles.includes(userRole)) {
      return true;
    }

    // Authenticated but wrong role → 403-like redirect
    this.router.navigate(['/forbidden']);
    return false;
  }
}