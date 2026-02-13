// 1. UserRole
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT'
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// 2. UserStatus
export const UserStatus = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  BLOCKED: 'BLOCKED',
  DELETED: 'DELETED',
  PENDING: 'PENDING'
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

// 3. Language
export const Language = {
  FR: 'FR',
  EN: 'EN',
  ES: 'ES',
  DE: 'DE',
  IT: 'IT'
} as const;
export type Language = (typeof Language)[keyof typeof Language];

// 4. Theme
export const Theme = {
  LIGHT: 'LIGHT',
  DARK: 'DARK',
  SYSTEM: 'SYSTEM'
} as const;
export type Theme = (typeof Theme)[keyof typeof Theme];

// Types de base
export interface User {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  password: string;
  isActive: boolean;
  createdAt: string;
  role: UserRole;
  phoneNumber?: string | null;
  failedLoginAttempts: number;
  emailVerified: boolean;
  status: UserStatus;
  address?: string | null;
  language: Language;
  emailNotifications: boolean;
  theme: Theme;
}