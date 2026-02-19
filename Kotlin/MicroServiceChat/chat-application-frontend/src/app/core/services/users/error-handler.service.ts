import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http'; 
import { ValidationErrors } from '@angular/forms';
import { AuthErrorCode, parseAuthError, AUTH_ERROR_MESSAGES } from '../../models/users/error.model';

export interface HandledError {
  code: AuthErrorCode;
  userMessage: string;
  httpStatus: number;
  raw: string;
  validationErrors?: ValidationErrors;   // Populated for ValidationException (400 + field map)
}

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {

  /**
   * Converts any HttpErrorResponse into a HandledError.
   *
   * Handles all backend error shapes:
   *   ApiResponse wrapper:        { success: false, message: "...", timestamp: ... }
   *   SecurityConfig 401/403:     { success: false, message: "Unauthorized: ...", timestamp: ... }
   *   @ResponseStatus exceptions: Spring returns { message: "...", status: N, ... }
   *   ValidationException (400):  { message: "...", errors: { field: "msg", ... } }
   *   resetPassword plain map:    { success: false, message: "..." }
   *   Network errors:             error.status === 0
   */
  handle(error: HttpErrorResponse): HandledError {
    const status = error.status;

    const raw: string =
      error.error?.message ||
      error.error?.error ||
      error.message ||
      'Unknown error';

    // Extract field-level validation errors (ValidationException)
    const validationErrors: ValidationErrors | undefined =
      error.error?.errors && typeof error.error.errors === 'object'
        ? error.error.errors
        : undefined;

    const code = parseAuthError(raw, status);

    // For validation errors, override message to prompt user to fix fields
    const userMessage = validationErrors
      ? AUTH_ERROR_MESSAGES[AuthErrorCode.VALIDATION_ERROR]
      : AUTH_ERROR_MESSAGES[code];

    return { code, userMessage, httpStatus: status, raw, validationErrors };
  }

  // ─── Convenience predicates ───────────────────────────────────────────────

  /** Redirect to resend-verification page after login failure */
  isUnverifiedAccount(e: HandledError): boolean {
    return e.code === AuthErrorCode.ACCOUNT_NOT_VERIFIED;
  }

  /** Account locked after 5 failed attempts — AccountBlockedException */
  isAccountBlocked(e: HandledError): boolean {
    return e.code === AuthErrorCode.ACCOUNT_BLOCKED;
  }

  /** Token used in email link is expired or invalid — prompt to re-request */
  isTokenError(e: HandledError): boolean {
    return e.code === AuthErrorCode.EXPIRED_TOKEN ||
           e.code === AuthErrorCode.INVALID_TOKEN;
  }

  /** Email already taken during register or email change */
  isEmailConflict(e: HandledError): boolean {
    return e.code === AuthErrorCode.EMAIL_ALREADY_EXISTS;
  }

  /** Wrong current password in changePassword() or requestEmailChange() */
  isInvalidPassword(e: HandledError): boolean {
    return e.code === AuthErrorCode.INVALID_PASSWORD;
  }

  /** Rate limit hit — RateLimitExceededException (429) */
  isRateLimited(e: HandledError): boolean {
    return e.code === AuthErrorCode.RATE_LIMIT_EXCEEDED;
  }

  /** Has per-field validation errors from @Valid — ValidationException */
  hasValidationErrors(e: HandledError): boolean {
    return !!e.validationErrors && Object.keys(e.validationErrors).length > 0;
  }

  /**
   * Returns the error message for a specific field from ValidationException.
   * Use in template: errorHandler.getFieldError(error, 'email')
   */
  getFieldError(e: HandledError, field: string): string | null {
    return e.validationErrors?.[field] ?? null;
  }
}