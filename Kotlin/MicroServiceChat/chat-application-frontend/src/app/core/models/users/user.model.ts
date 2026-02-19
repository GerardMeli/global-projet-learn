import { UserRole, UserStatus, Language, Theme } from './enums.model';

/**
 * Mirrors Users.kt entity fields.
 * Used as base reference — API responses use specific DTOs below.
 */
export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: string;          // LocalDateTime → ISO string from backend
  role: UserRole;
  phoneNumber: string | null;
  failedLoginAttempts: number;
  emailVerified: boolean;
  status: UserStatus;
  address: string | null;
  language: Language;
  emailNotifications: boolean;
  theme: Theme;
  // password is NEVER returned by API
}

// ─── Computed helpers ────────────────────────────────────────────────────────

export function getFullName(user: Pick<User, 'firstName' | 'lastName'>): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown';
}

export function isUserActive(user: Pick<User, 'isActive' | 'status'>): boolean {
  return user.isActive && user.status === 'ACTIVE';
}