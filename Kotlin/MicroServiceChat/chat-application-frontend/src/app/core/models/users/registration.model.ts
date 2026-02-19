import { UserRole, UserStatus, Language } from './enums.model';

/**
 * Mirrors RegistrationDto.kt
 */

// ─── Register ────────────────────────────────────────────────────────────────

/** POST /api/auth/register — mirrors RegisterRequest */
export interface RegisterRequest {
  email: string;               // @Email @NotBlank
  password: string;            // @Size(min=6, max=50)
  firstName?: string;          // @Size(max=100)
  lastName?: string;           // @Size(max=100)
  phoneNumber?: string;
  address?: string;            // @Size(max=45)
  language?: Language;         // default: Language.FR
}

/** Response from POST /api/auth/register — mirrors RegisterResponse */
export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  message: string;             // "Registration successful. Please verify your email."
}

// ─── Login ───────────────────────────────────────────────────────────────────

/** POST /api/auth/login — mirrors LoginRequest */
export interface LoginRequest {
  email: string;               // @Email @NotBlank
  password: string;            // @NotBlank
}

/** Nested user object in LoginResponse */
export interface UserResponse {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;           // LocalDateTime → ISO string
}

/** Response from POST /api/auth/login — mirrors LoginResponse */
export interface LoginResponse {
  user: UserResponse;
  token: string;               // access token
  tokenType: string;           // "Bearer"
  expiresIn: number;           // seconds
  sessionId: string;
}

// ─── Token Refresh ───────────────────────────────────────────────────────────

/** POST /api/auth/refresh-token — mirrors RefreshTokenRequest */
export interface RefreshTokenRequest {
  refreshToken: string;        // @NotBlank
}

/** Response from POST /api/auth/refresh-token — mirrors TokenResponse */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;           // "Bearer"
  expiresIn: number;           // seconds
}