import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { UserStatisticsResponse, UserActivityResponse } from '../models/statistics.model';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatisticsService {

  // StatisticsController @RequestMapping("/api/admin/statistics")
  // @PreAuthorize("hasRole('ADMIN')") on entire class
  private readonly baseUrl = `${environment.apiUrl}/admin/statistics`;

  constructor(private http: HttpClient) {}

  // ─── GET /api/admin/statistics/summary ────────────────────────────────────
  // Returns: UserStatisticsResponse directly (no wrapper)
  // Source: StatisticsServiceImpl.getUserStatistics()
  //
  // IMPORTANT nuances from StatisticsServiceImpl:
  //   - pendingVerification counts UserStatus.PENDING (not PENDING_VERIFICATION)
  //   - usersByRole: all UserRole values included, defaults to 0 on error
  //   - usersByLanguage: all Language values included, defaults to 0 on error
  //   - lastLoginAt is NOT tracked in the Users entity — always null in activity
  //   - newUsersLast7Days/30Days = count by createdAt range (not login date)
  getUserStatistics(): Observable<UserStatisticsResponse> {
    return this.http.get<UserStatisticsResponse>(`${this.baseUrl}/summary`);
  }

  // ─── GET /api/admin/statistics/activity ───────────────────────────────────
  // Returns: UserActivityResponse[] directly (no wrapper)
  // Source: StatisticsServiceImpl.getUserActivity()
  //
  // IMPORTANT: lastLoginAt is ALWAYS null — Users entity has no lastLoginAt field.
  // Do NOT display this field as meaningful data. Show "Never" or hide it.
  // failedLoginAttempts is reliable — directly from Users entity.
  getUserActivity(): Observable<UserActivityResponse[]> {
    return this.http.get<UserActivityResponse[]>(`${this.baseUrl}/activity`);
  }
}