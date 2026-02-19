/**
 * Mirrors EmailPwdDto.kt
 */

// ─── Email Verification ──────────────────────────────────────────────────────

/** POST /api/auth/verify-email — mirrors EmailVerificationRequest */
export interface EmailVerificationRequest {
  token: string;               // @NotBlank — tokenType: "email_verification" from JwtProvider
}

/** POST /api/auth/resend-verification — mirrors ResendVerificationEmailRequest */
export interface ResendVerificationEmailRequest {
  email: string;               // @Email @NotBlank
}

// ─── Password Reset ──────────────────────────────────────────────────────────

/** POST /api/auth/forgot-password — mirrors ForgotPasswordRequest */
export interface ForgotPasswordRequest {
  email: string;               // @Email @NotBlank
}

/**
 * POST /api/auth/reset-password — mirrors ResetPasswordRequest
 *
 * IMPORTANT: This route is excluded from JwtAuthenticationFilter.shouldNotFilter().
 * The token (tokenType: "password_reset") is sent in the body, NOT as Authorization header.
 * JwtProvider.validatePasswordResetToken() validates it on the backend.
 */
export interface ResetPasswordRequest {
  token: string;               // @NotBlank — password_reset token from email link
  newPassword: string;         // @Size(min=8, max=100)
  confirmPassword: string;     // @NotBlank — must match newPassword (validate on frontend too)
}

// ─── Frontend validation helper ───────────────────────────────────────────────

export function passwordsMatch(newPassword: string, confirmPassword: string): boolean {
  return newPassword === confirmPassword;
}

/**
 * Password strength validation for reset and change forms.
 * Mirrors @Pattern in ProfileDto.EmailUpdateRequest:
 * Must have digit, lowercase, uppercase, special char, no spaces, min 8 chars.
 */
export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/;