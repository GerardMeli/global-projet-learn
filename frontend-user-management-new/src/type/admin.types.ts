import { Language, Theme, UserRole, UserStatus } from './user.types';

export interface AdminUserResponse {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  failedLoginAttempts: number;
  createdAt: string;
  lastLoginAt?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  language: Language;
  theme: Theme;
}

export interface AdminUserUpdateRequest {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  role?: UserRole | null;
  status?: UserStatus | null;
  isActive?: boolean | null;
  emailVerified?: boolean | null;
  failedLoginAttempts?: number | null;
  language?: Language | null;
  theme?: Theme | null;
  emailNotifications?: boolean | null;
}

export interface UserStatusUpdateRequest {
  status: UserStatus;
  reason?: string | null;
}

export interface UserRoleUpdateRequest {
  role: UserRole;
  reason?: string | null;
}

export interface UserSearchCriteria {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: UserRole | null;
}

export interface PaginatedUsersResponse {
  content: AdminUserResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}