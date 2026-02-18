import { UserRole, UserStatus, Language, Theme } from './enums.model';

/**
 * Mirrors AdminDto.kt
 */

// ─── Responses ───────────────────────────────────────────────────────────────

/** Full admin view of a user — mirrors AdminUserResponse */
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
  createdAt: string;           // LocalDateTime → ISO string
  lastLoginAt: string | null;  // LocalDateTime → ISO string
  phoneNumber: string | null;
  address: string | null;
  language: Language;
  theme: Theme;
}

/** Paginated list response — mirrors PaginatedUsersResponse */
export interface PaginatedUsersResponse {
  content: AdminUserResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ─── Update Requests ─────────────────────────────────────────────────────────

/** PUT /api/admin/users/{id} — mirrors AdminUserUpdateRequest (all fields optional) */
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

/** PATCH /api/admin/users/{id}/status — mirrors UserStatusUpdateRequest */
export interface UserStatusUpdateRequest {
  status: UserStatus;          // @NotNull
  reason?: string;             // @Size(max=500)
}

/** PATCH /api/admin/users/{id}/role — mirrors UserRoleUpdateRequest */
export interface UserRoleUpdateRequest {
  role: UserRole;              // @NotNull
  reason?: string;             // @Size(max=500)
}

// ─── Search / Filter ─────────────────────────────────────────────────────────

/** Query params for user search — mirrors UserSearchCriteria */
export interface UserSearchCriteria {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

/** Combined pagination + search params for GET /api/admin/users */
export interface UserListParams extends UserSearchCriteria {
  page?: number;               // 0-based
  size?: number;
  sort?: string;               // e.g. "createdAt,desc"
}