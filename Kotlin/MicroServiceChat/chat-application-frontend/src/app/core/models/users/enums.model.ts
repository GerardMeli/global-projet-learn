/**
 * Mirrors enums from Users.kt
 * Keep values as strings — they match @Enumerated(EnumType.STRING) in JPA
 */

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
  DELETED = 'DELETED',
  PENDING = 'PENDING'
}

export enum Language {
  FR = 'FR',   // Français
  EN = 'EN',   // Anglais
  ES = 'ES',   // Espagnol
  DE = 'DE',   // Allemand
  IT = 'IT'    // Italien
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM'
}

// ─── Display helpers ────────────────────────────────────────────────────────

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.USER]: 'User',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.SUPPORT]: 'Support'
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.PENDING_VERIFICATION]: 'Pending Verification',
  [UserStatus.ACTIVE]: 'Active',
  [UserStatus.INACTIVE]: 'Inactive',
  [UserStatus.SUSPENDED]: 'Suspended',
  [UserStatus.BLOCKED]: 'Blocked',
  [UserStatus.DELETED]: 'Deleted',
  [UserStatus.PENDING]: 'Pending'
};

export const USER_STATUS_COLOR: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.PENDING_VERIFICATION]: 'warning',
  [UserStatus.PENDING]: 'warning',
  [UserStatus.INACTIVE]: 'secondary',
  [UserStatus.SUSPENDED]: 'danger',
  [UserStatus.BLOCKED]: 'danger',
  [UserStatus.DELETED]: 'dark'
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  [Language.FR]: 'Français',
  [Language.EN]: 'English',
  [Language.ES]: 'Español',
  [Language.DE]: 'Deutsch',
  [Language.IT]: 'Italiano'
};

export const THEME_LABELS: Record<Theme, string> = {
  [Theme.LIGHT]: 'Light',
  [Theme.DARK]: 'Dark',
  [Theme.SYSTEM]: 'System'
};