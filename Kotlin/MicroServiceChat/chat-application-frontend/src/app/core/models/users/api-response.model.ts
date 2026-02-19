/**
 * Mirrors JwtProvider.generateTokenWithClaims() claims structure.
 *
 * Claims in the access token:
 *   sub      → email (setSubject)
 *   userId   → Long
 *   email    → String (also stored as custom claim)
 *   role     → String ("ADMIN" | "USER" | "SUPPORT") — NO "ROLE_" prefix in JWT
 *   tokenType → "access"
 *   iat      → issued-at (seconds)
 *   exp      → expiry (seconds since epoch)
 *
 * NOTE: there is NO "tokenType: access" check needed client-side —
 * the interceptor skips the isAccessToken() guard (JwtProvider never uses
 * tokenType:"access" check on incoming requests, only on special tokens).
 */
export interface JwtClaims {
  sub: string;          // email — set via setSubject()
  userId: number;       // custom claim
  email: string;        // custom claim (same as sub)
  role: string;         // "ADMIN" | "USER" | "SUPPORT"
  tokenType: string;    // "access" | "refresh" | "email_verification" | "password_reset" | "email_change"
  iat: number;          // issued at (seconds)
  exp: number;          // expiry (seconds since epoch)
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}