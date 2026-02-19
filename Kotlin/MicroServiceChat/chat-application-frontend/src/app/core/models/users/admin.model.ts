import { UserRole, UserStatus, Language, Theme } from './enums.model';

/**
 * Mirrors AdminDto.kt
 * Refined with insights from UserServiceImpl.kt
 */

// ─── Responses ───────────────────────────────────────────────────────────────

export interface AdminUserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  createdAt: string;
  lastLoginAt: string | null;  // Not in Users entity — likely always null
  phoneNumber: string | null;
  address: string | null;
  language: Language;
  theme: Theme;
}

// ─── Update Requests ─────────────────────────────────────────────────────────

export interface AdminUserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  role?: UserRole;
  status?: UserStatus;
  isActive?: boolean;
  emailVerified?: boolean;
  failedLoginAttempts?: number;
  language?: Language;
  theme?: Theme;
  emailNotifications?: boolean;
}

export interface UserStatusUpdateRequest {
  status: UserStatus;   // @NotNull
  reason?: string;      // @Size(max=500) — sent in status-change.html email
}

export interface UserRoleUpdateRequest {
  role: UserRole;       // @NotNull
  reason?: string;      // @Size(max=500) — sent in role-change.html email
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface UserSearchCriteria {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

/**
 * NOTE: AdminController.getAllUsers() returns ALL users with no pagination.
 * UserListParams kept here for potential future use but pagination is not
 * currently implemented in UserServiceImpl.getAllUsers().
 */
export interface UserListParams extends UserSearchCriteria {
  page?: number;
  size?: number;
  sort?: string;
}

// ─── Soft vs Hard Delete clarification ───────────────────────────────────────
/**
 * UserServiceImpl.deleteUser() calls usersRepository.deleteById()
 * This is a HARD DELETE — the record is permanently removed from the database.
 *
 * The UserStatus.DELETED enum exists but is NOT used by deleteUser().
 * It may be used elsewhere or kept for future soft-delete implementation.
 *
 * Frontend implication: after deleteUser(), the user record no longer exists.
 * Do NOT try to fetch it again. Remove it from local state immediately.
 */