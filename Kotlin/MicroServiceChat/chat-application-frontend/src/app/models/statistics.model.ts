import { UserRole, UserStatus, Language } from './enums.model';

/**
 * Mirrors StatisticsDto.kt
 * Populated by StatisticsServiceImpl.kt — see nuances below.
 */

// ─── GET /api/admin/statistics/summary ───────────────────────────────────────

export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;

  /**
   * Counts UserStatus.PENDING — NOT PENDING_VERIFICATION.
   * Source: usersRepository.countByStatus(UserStatus.PENDING)
   * New registrations start as PENDING (AuthServiceImpl.register() sets status = PENDING)
   */
  pendingVerification: number;

  suspendedUsers: number;
  blockedUsers: number;
  deletedUsers: number;

  /**
   * All UserRole values included. Defaults to 0 if query fails.
   * Keys: "USER" | "ADMIN" | "SUPPORT"
   */
  usersByRole: Record<UserRole, number>;

  /**
   * All Language values included. Defaults to 0 if query fails.
   * Keys: "FR" | "EN" | "ES" | "DE" | "IT"
   */
  usersByLanguage: Record<Language, number>;

  /**
   * Count of users where createdAt is within last 7 days.
   * NOT related to login activity.
   */
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

// ─── GET /api/admin/statistics/activity ──────────────────────────────────────

export interface UserActivityResponse {
  userId: number;
  email: string;

  /**
   * ALWAYS null — Users entity has no lastLoginAt field.
   * Do NOT display as meaningful data. Show "Never" or hide the column.
   */
  lastLoginAt: null;

  /**
   * Reliable — directly from Users.failedLoginAttempts.
   * Account locks at 5 (AuthServiceImpl.handleFailedLogin()).
   */
  failedLoginAttempts: number;
  status: UserStatus;
  isActive: boolean;
}

// ─── Chart helpers ────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
}

export function roleStatsToChartData(usersByRole: Record<UserRole, number>): ChartDataPoint[] {
  return Object.entries(usersByRole).map(([role, count]) => ({ label: role, value: count }));
}

export function languageStatsToChartData(usersByLanguage: Record<Language, number>): ChartDataPoint[] {
  return Object.entries(usersByLanguage).map(([lang, count]) => ({ label: lang, value: count }));
}

export function getStatusBreakdown(stats: UserStatisticsResponse): ChartDataPoint[] {
  return [
    { label: 'Active',    value: stats.activeUsers },
    { label: 'Pending',   value: stats.pendingVerification },   // UserStatus.PENDING
    { label: 'Suspended', value: stats.suspendedUsers },
    { label: 'Blocked',   value: stats.blockedUsers },
    { label: 'Deleted',   value: stats.deletedUsers },
  ];
}