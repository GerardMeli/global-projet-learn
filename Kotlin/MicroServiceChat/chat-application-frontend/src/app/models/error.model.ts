/**
 * Mirrors HandleExecption.kt (sic — original spelling)
 * Every exception maps to an exact HTTP status via @ResponseStatus.
 */

// ─── HTTP Status mapping (from @ResponseStatus annotations) ──────────────────
//
// AccountNotVerifiedException   → AuthenticationException → 401 (SecurityConfig handler)
// AccountSuspendedException     → AuthenticationException → 401
// AccountBlockedException       → AuthenticationException → 401
// AccountDeletedException       → AuthenticationException → 401
// AccountInactiveException      → AuthenticationException → 401
// InvalidTokenException         → JwtAuthenticationException → 401
// ExpiredTokenException         → JwtAuthenticationException → 401
// ResourceNotFoundException     → @ResponseStatus(404)
// EmailAlreadyExistsException   → @ResponseStatus(409)
// InvalidPasswordException      → @ResponseStatus(400)
// BadRequestException           → @ResponseStatus(400)
// UnauthorizedException         → @ResponseStatus(401)
// ForbiddenException            → @ResponseStatus(403)
// ValidationException           → @ResponseStatus(400) + errors Map<String, String>
// ServiceUnavailableException   → @ResponseStatus(503)
// RateLimitExceededException    → @ResponseStatus(429)

export enum AuthErrorCode {
  // Account state (AuthenticationException → typically wrapped in 401/403 by SecurityConfig)
  ACCOUNT_NOT_VERIFIED  = 'ACCOUNT_NOT_VERIFIED',
  ACCOUNT_SUSPENDED     = 'ACCOUNT_SUSPENDED',
  ACCOUNT_BLOCKED       = 'ACCOUNT_BLOCKED',
  ACCOUNT_DELETED       = 'ACCOUNT_DELETED',
  ACCOUNT_INACTIVE      = 'ACCOUNT_INACTIVE',

  // JWT (JwtAuthenticationException → 401)
  INVALID_TOKEN         = 'INVALID_TOKEN',
  EXPIRED_TOKEN         = 'EXPIRED_TOKEN',

  // Business (RuntimeException with @ResponseStatus)
  RESOURCE_NOT_FOUND    = 'RESOURCE_NOT_FOUND',       // 404
  EMAIL_ALREADY_EXISTS  = 'EMAIL_ALREADY_EXISTS',     // 409
  INVALID_PASSWORD      = 'INVALID_PASSWORD',          // 400
  BAD_REQUEST           = 'BAD_REQUEST',               // 400
  UNAUTHORIZED          = 'UNAUTHORIZED',              // 401
  FORBIDDEN             = 'FORBIDDEN',                 // 403

  // Validation (400 + field errors map)
  VALIDATION_ERROR      = 'VALIDATION_ERROR',

  // Infrastructure
  SERVICE_UNAVAILABLE   = 'SERVICE_UNAVAILABLE',      // 503
  RATE_LIMIT_EXCEEDED   = 'RATE_LIMIT_EXCEEDED',      // 429

  // Fallback
  SERVER_ERROR          = 'SERVER_ERROR',              // 500
  UNKNOWN               = 'UNKNOWN'
}

/** HTTP status → AuthErrorCode mapping (for status-code-first parsing) */
export const HTTP_STATUS_TO_ERROR: Partial<Record<number, AuthErrorCode>> = {
  400: AuthErrorCode.BAD_REQUEST,
  401: AuthErrorCode.UNAUTHORIZED,
  403: AuthErrorCode.FORBIDDEN,
  404: AuthErrorCode.RESOURCE_NOT_FOUND,
  409: AuthErrorCode.EMAIL_ALREADY_EXISTS,
  429: AuthErrorCode.RATE_LIMIT_EXCEEDED,
  500: AuthErrorCode.SERVER_ERROR,
  503: AuthErrorCode.SERVICE_UNAVAILABLE,
};

/** User-facing messages for each error code */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.ACCOUNT_NOT_VERIFIED]:  'Please verify your email before logging in.',
  [AuthErrorCode.ACCOUNT_SUSPENDED]:     'Your account has been suspended. Contact support.',
  [AuthErrorCode.ACCOUNT_BLOCKED]:       'Your account is blocked after too many failed login attempts.',
  [AuthErrorCode.ACCOUNT_DELETED]:       'This account no longer exists.',
  [AuthErrorCode.ACCOUNT_INACTIVE]:      'Your account is inactive.',
  [AuthErrorCode.INVALID_TOKEN]:         'This link is invalid. Please request a new one.',
  [AuthErrorCode.EXPIRED_TOKEN]:         'This link has expired. Please request a new one.',
  [AuthErrorCode.RESOURCE_NOT_FOUND]:    'The requested resource was not found.',
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]:  'This email address is already registered.',
  [AuthErrorCode.INVALID_PASSWORD]:      'The password you entered is incorrect.',
  [AuthErrorCode.BAD_REQUEST]:           'Invalid request. Please check your input.',
  [AuthErrorCode.UNAUTHORIZED]:          'You must be logged in to access this page.',
  [AuthErrorCode.FORBIDDEN]:             'You do not have permission to perform this action.',
  [AuthErrorCode.VALIDATION_ERROR]:      'Please fix the highlighted fields.',
  [AuthErrorCode.SERVICE_UNAVAILABLE]:   'Service is temporarily unavailable. Try again later.',
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]:   'Too many attempts. Please wait before trying again.',
  [AuthErrorCode.SERVER_ERROR]:          'An unexpected error occurred. Please try again.',
  [AuthErrorCode.UNKNOWN]:               'Something went wrong. Please try again.',
};

/** Account lock threshold from AuthServiceImpl.handleFailedLogin() */
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const WARN_AT_FAILED_ATTEMPTS = 3;

/**
 * Parses the backend error message string into a typed AuthErrorCode.
 * Matches against default messages from HandleExecption.kt constructors.
 */
export function parseAuthError(message: string, httpStatus?: number): AuthErrorCode {
  const msg = (message ?? '').toLowerCase();

  // Message-based matching first (most specific)
  if (msg.includes('not verified') || msg.includes('account not verified'))    return AuthErrorCode.ACCOUNT_NOT_VERIFIED;
  if (msg.includes('suspended') || msg.includes('account suspended'))          return AuthErrorCode.ACCOUNT_SUSPENDED;
  if (msg.includes('blocked') || msg.includes('account blocked'))              return AuthErrorCode.ACCOUNT_BLOCKED;
  if (msg.includes('deleted') || msg.includes('account deleted'))              return AuthErrorCode.ACCOUNT_DELETED;
  if (msg.includes('inactive') || msg.includes('account inactive'))            return AuthErrorCode.ACCOUNT_INACTIVE;
  if (msg.includes('token expired') || msg.includes('expired'))                return AuthErrorCode.EXPIRED_TOKEN;
  if (msg.includes('invalid token') || msg.includes('token invalide'))         return AuthErrorCode.INVALID_TOKEN;
  if (msg.includes('email already') || msg.includes('already registered'))     return AuthErrorCode.EMAIL_ALREADY_EXISTS;
  if (msg.includes('not found'))                                                return AuthErrorCode.RESOURCE_NOT_FOUND;
  if (msg.includes('invalid password') || msg.includes('password is incorrect') ||
      msg.includes('current password'))                                         return AuthErrorCode.INVALID_PASSWORD;
  if (msg.includes('passwords') || msg.includes('correspondent pas') ||
      msg.includes('do not match'))                                             return AuthErrorCode.BAD_REQUEST;
  if (msg.includes('too many'))                                                 return AuthErrorCode.RATE_LIMIT_EXCEEDED;
  if (msg.includes('unauthorized'))                                             return AuthErrorCode.UNAUTHORIZED;
  if (msg.includes('forbidden') || msg.includes('access denied'))              return AuthErrorCode.FORBIDDEN;
  if (msg.includes('service unavailable'))                                      return AuthErrorCode.SERVICE_UNAVAILABLE;

  // Fall back to HTTP status code
  if (httpStatus && HTTP_STATUS_TO_ERROR[httpStatus]) {
    return HTTP_STATUS_TO_ERROR[httpStatus]!;
  }

  return AuthErrorCode.UNKNOWN;
}

/**
 * ValidationException field errors: Map<String, String>
 * Backend returns these as part of the error body when @Valid fails.
 */
export interface ValidationErrors {
  [fieldName: string]: string;   // e.g. { "email": "must be a valid email", "password": "size must be between 6 and 50" }
}