import { Injectable } from '@angular/core';
import { JwtClaims } from '../models/api-response.model';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  // ─── Storage ────────────────────────────────────────────────────────────────

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
   * Decodes a JWT payload without verifying signature.
   * Signature verification is done server-side by JwtProvider.
   */
  decodeToken(token: string): JwtClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      // Pad base64 if necessary
      const padded = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(padded.padEnd(padded.length + (4 - padded.length % 4) % 4, '='));
      return JSON.parse(decoded) as JwtClaims;
    } catch {
      return null;
    }
  }

  getCurrentUserClaims(): JwtClaims | null {
    const token = this.getAccessToken();
    if (!token) return null;
    return this.decodeToken(token);
  }

  getCurrentUserId(): number | null {
    return this.getCurrentUserClaims()?.userId ?? null;
  }

  getCurrentUserEmail(): string | null {
    return this.getCurrentUserClaims()?.email ?? null;
  }

  /**
   * Returns "ADMIN" | "USER" — mirrors backend role claim from JwtProvider.generateTokenWithClaims()
   */
  getCurrentUserRole(): string | null {
    return this.getCurrentUserClaims()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getCurrentUserRole() === 'ADMIN';
  }

  // ─── Validation ─────────────────────────────────────────────────────────────

  /**
   * Checks token type is "access" — mirrors JwtAuthenticationFilter check.
   * Refresh/reset tokens must NOT be used as access tokens.
   */
  isAccessToken(token: string): boolean {
    const claims = this.decodeToken(token);
    return claims?.tokenType === 'access';
  }

  isTokenExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    if (!claims?.exp) return true;
    // exp is in seconds, Date.now() in ms
    return claims.exp * 1000 < Date.now();
  }

  hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    if (!this.isAccessToken(token)) return false;
    if (this.isTokenExpired(token)) return false;
    return true;
  }

  /** Alias for getCurrentUserEmail() — returns email claim from stored access token */
  getEmail(): string | null {
    return this.getCurrentUserEmail();
  }
}