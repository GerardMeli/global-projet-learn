import { UserRole, UserStatus, Language, Theme } from './enums.model';

/**
 * Mirrors ProfileDto.kt
 */

// ─── Responses ───────────────────────────────────────────────────────────────

/** GET /api/profile — mirrors UserProfileResponse */
export interface UserProfileResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  address: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  language: Language;
  theme: Theme;
  emailNotifications: boolean;
  createdAt: string;           // LocalDateTime → ISO string
  failedLoginAttempts: number;
}

/** Lightweight response — mirrors PrivateUserResponse */
export interface PrivateUserResponse {
  id: number;
  email: string;
  isActive: boolean;
  role: string;
}

// ─── Update Requests ─────────────────────────────────────────────────────────

/** PUT /api/profile — mirrors UserProfileUpdateRequest */
export interface UserProfileUpdateRequest {
  firstName?: string;          // @Size(max=100)
  lastName?: string;           // @Size(max=100)
  phoneNumber?: string;
  address?: string;            // @Size(max=45)
}

/** PUT /api/profile/preferences — mirrors UserPreferencesUpdateRequest */
export interface UserPreferencesUpdateRequest {
  language?: Language;
  theme?: Theme;
  emailNotifications?: boolean;
}

/** PUT /api/profile/password — mirrors PasswordChangeRequest */
export interface PasswordChangeRequest {
  currentPassword: string;     // @NotBlank
  newPassword: string;         // @Size(min=8, max=100)
  confirmPassword: string;     // @NotBlank — validate match on frontend
}

/**
 * PUT /api/profile/email — mirrors EmailUpdateRequest
 *
 * Triggers email-change-confirmation email (email_change token from JwtProvider).
 * Password must match strong pattern: digit + lower + upper + special + no spaces + min 8.
 */
export interface EmailUpdateRequest {
  newEmail: string;            // @Email @NotBlank
  password: string;            // @Pattern(strong password regex)
}