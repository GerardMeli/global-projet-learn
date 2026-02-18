import { UserRole, UserStatus, Language } from './enums.model';

/**
 * Mirrors StatisticsDto.kt
 */

/** GET /api/admin/statistics — mirrors UserStatisticsResponse */
export interface UserStatisticsResponse {
  totalUsers: number;
  activeUsers: number;
  pendingVerification: number;
  suspendedUsers: number;
  blockedUsers: number;
  deletedUsers: number;
  usersByRole: Record<UserRole, number>;       // Map<UserRole, Long>
  usersByLanguage: Record<Language, number>;   // Map<Language, Long>
  newUsersLast7Days: number;
  newUsersLast30Days: number;
}

/** GET /api/admin/statistics/activity — mirrors UserActivityResponse */
export interface UserActivityResponse {
  userId: number;
  email: string;
  lastLoginAt: string | null;   // LocalDateTime → ISO string
  failedLoginAttempts: number;
  status: UserStatus;
  isActive: boolean;
}

// ─── Computed helpers for charts ─────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
}

/** Convert usersByRole map to chart-ready array */
export function roleStatsToChartData(
  usersByRole: Record<UserRole, number>
): ChartDataPoint[] {
  return Object.entries(usersByRole).map(([role, count]) => ({
    label: role,
    value: count
  }));
}

/** Convert usersByLanguage map to chart-ready array */
export function languageStatsToChartData(
  usersByLanguage: Record<Language, number>
): ChartDataPoint[] {
  return Object.entries(usersByLanguage).map(([lang, count]) => ({
    label: lang,
    value: count
  }));
}

/** Summary card data derived from UserStatisticsResponse */
export function getStatusBreakdown(stats: UserStatisticsResponse): ChartDataPoint[] {
  return [
    { label: 'Active', value: stats.activeUsers },
    { label: 'Pending', value: stats.pendingVerification },
    { label: 'Suspended', value: stats.suspendedUsers },
    { label: 'Blocked', value: stats.blockedUsers },
    { label: 'Deleted', value: stats.deletedUsers },
  ];
}