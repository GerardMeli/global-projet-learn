// Matches Spring Boot SecurityConfig error response shape:
// { success: boolean, message: string, timestamp: number }

export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  timestamp: number;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  timestamp: number;
}

// JWT token claims decoded from JwtProvider
export interface JwtClaims {
  email: string;
  role: string;         // "ADMIN" | "USER" — backend prefixes with ROLE_ internally
  userId: number;
  tokenType: 'access' | 'refresh' | 'email_verification' | 'password_reset' | 'email_change';
  sub: string;
  iat: number;
  exp: number;
}

// Auth token pair returned after login/register
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;   // seconds — from JwtProvider.getTokenExpirationSeconds()
}