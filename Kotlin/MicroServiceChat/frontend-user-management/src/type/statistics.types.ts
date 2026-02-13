import { Language, UserRole, UserStatus } from './user.types';

export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingVerification: number;
  suspendedUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  usersByRole: Record<UserRole, number>;
  usersByLanguage: Record<Language, number>;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

export interface UserActivityResponse {
  userId: number;
  email: string;
  lastLoginAt?: string | null;
  failedLoginAttempts: number;
  status: UserStatus;
  isActive: boolean;
}

export interface PageableResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}