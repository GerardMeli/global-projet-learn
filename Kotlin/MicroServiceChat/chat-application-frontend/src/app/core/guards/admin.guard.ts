// admin.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree 
} from '@angular/router';
import { Observable, map, catchError, of } from 'rxjs';
import { TokenService } from '../services/users/token.service';
import { AuthService } from '../services/users/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier si l'utilisateur est connecté
    const token = this.tokenService.getAccessToken();
    
    if (!token) {
      console.warn('AdminGuard: No token found, redirecting to login');
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Vérifier si le token est expiré
    if (this.tokenService.isTokenExpired(token)) {
      console.warn('AdminGuard: Token expired, attempting refresh');
      
      // Tenter de rafraîchir le token
      return this.authService.refreshToken().pipe(
        map((response: any) => {
          if (response && response.access_token) {
            // Token rafraîchi avec succès
            this.tokenService.saveTokens(response.access_token, response.refresh_token);
            
            // Vérifier maintenant si l'utilisateur est admin
            if (this.tokenService.isAdmin()) {
              return true;
            } else {
              console.warn('AdminGuard: User is not an administrator');
              return this.router.createUrlTree(['/dashboard'], {
                queryParams: { 
                  error: 'unauthorized',
                  message: 'Vous devez être administrateur pour accéder à cette page'
                }
              });
            }
          } else {
            // Échec du rafraîchissement
            this.tokenService.clearTokens();
            return this.router.createUrlTree(['/auth/login'], {
              queryParams: { 
                returnUrl: state.url,
                error: 'session_expired'
              }
            });
          }
        }),
        catchError((error) => {
          console.error('AdminGuard: Token refresh failed', error);
          this.tokenService.clearTokens();
          return of(this.router.createUrlTree(['/auth/login'], {
            queryParams: { 
              returnUrl: state.url,
              error: 'session_expired'
            }
          }));
        })
      );
    }

    // Token valide, vérifier si l'utilisateur est admin
    if (this.tokenService.isAdmin()) {
      return true;
    }

    // L'utilisateur n'est pas admin
    console.warn('AdminGuard: User is not an administrator');
    
    // Vérifier les rôles requis spécifiques dans les données de route
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.tokenService.getCurrentUserRole();
      if (!userRole || !requiredRoles.includes(userRole)) {
        return this.router.createUrlTree(['/dashboard'], {
          queryParams: { 
            error: 'forbidden',
            message: 'Vous n\'avez pas les permissions nécessaires'
          }
        });
      }
    }

    return this.router.createUrlTree(['/dashboard'], {
      queryParams: { 
        error: 'unauthorized',
        message: 'Accès réservé aux administrateurs'
      }
    });
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une route enfant
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.canActivate(childRoute, state);
  }

  /**
   * Vérifie si l'utilisateur peut charger un module lazy-loaded
   */
  canLoad(
    route: any,
    segments: any[]
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = this.tokenService.getAccessToken();
    
    if (!token || this.tokenService.isTokenExpired(token)) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (!this.tokenService.isAdmin()) {
      return this.router.createUrlTree(['/dashboard']);
    }

    return true;
  }
}