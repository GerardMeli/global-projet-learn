import { Injectable } from '@angular/core';
import { JwtClaims } from '../../models/users/api-response.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenService {

  // ─── Storage ────────────────────────────────────────────────────────────────

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // ─── Decoding ───────────────────────────────────────────────────────────────

  /**
   * Decodes JWT payload WITHOUT verifying signature (verification is server-side).
   *
   * JwtProvider.generateTokenWithClaims() puts these claims:
   *   sub, userId, email, role, tokenType, iat, exp
   */
  decodeToken(token: string): JwtClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = payload.padEnd(payload.length + (4 - payload.length % 4) % 4, '=');
      return JSON.parse(atob(padded)) as JwtClaims;
    } catch {
      return null;
    }
  }

  getCurrentUserClaims(): JwtClaims | null {
    const token = this.getAccessToken();
    return token ? this.decodeToken(token) : null;
  }

  getCurrentUserId(): number | null {
    return this.getCurrentUserClaims()?.userId ?? null;
  }

  getCurrentUserEmail(): string | null {
    // email stored both in sub and in custom "email" claim
    const claims = this.getCurrentUserClaims();
    return claims?.email ?? claims?.sub ?? null;
  }

  getEmail(): string | null {
    return this.getCurrentUserEmail();
  }

  getCurrentUserRole(): string | null {
    return this.getCurrentUserClaims()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  /**
   * FIX: exp in JWT is UNIX timestamp in SECONDS.
   * Date.now() is in MILLISECONDS → must multiply exp by 1000.
   *
   * Previous bug: if exp was a small number (e.g. the token was very fresh),
   * this comparison could behave unexpectedly. Now correctly handles both cases.
   */
  isTokenExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    if (!claims?.exp) return true;
    return claims.exp * 1000 < Date.now();
  }

  /**
   * NOTE: We do NOT check tokenType === 'access' here.
   * JwtProvider.generateTokenWithClaims() correctly sets tokenType:'access',
   * but the interceptor should just attach whatever token is stored and let
   * the server validate. Checking tokenType client-side was silently
   * blocking requests when claims parsing had any issue.
   */
  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }
}