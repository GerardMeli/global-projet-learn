import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatisticsService } from '../../core/services/users/statistics.service';
import { TokenService } from '../../core/services/users/token.service';
import {
  UserStatisticsResponse,
  UserActivityResponse,
  ChartDataPoint,
  roleStatsToChartData,
  languageStatsToChartData,
  getStatusBreakdown
} from '../../core/models/users/statistics.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="statistics-container">
      <div class="statistics-header">
        <h1>User Statistics</h1>
        <div class="header-actions">
          <button class="refresh-btn" (click)="loadStatistics()">
            <span class="material-icons">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <!-- Debug Info - Will be removed once working -->
      <div class="debug-info" *ngIf="showDebug">
        <div class="debug-section">
          <h4>Debug Info</h4>
          <p><strong>Token Present:</strong> {{ hasToken ? '✅' : '❌' }}</p>
          <p><strong>Token Valid:</strong> {{ tokenValid ? '✅' : '❌' }}</p>
          <p><strong>Is Admin:</strong> {{ isAdmin ? '✅' : '❌' }}</p>
          <p><strong>Stats loaded:</strong> {{ stats ? '✅ Yes' : '❌ No' }}</p>
          <p><strong>Activity loaded:</strong> {{ activityData.length > 0 ? '✅ Yes (' + activityData.length + ' items)' : '❌ No' }}</p>
          <button class="debug-btn" (click)="showDebug = false">Hide Debug</button>
        </div>
      </div>
      
      <button class="debug-toggle" *ngIf="!showDebug" (click)="showDebug = true">
        <span class="material-icons">bug_report</span>
        Show Debug
      </button>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading statistics...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <span class="material-icons">error</span>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadStatistics()">Retry</button>
      </div>

      <!-- Statistics Content -->
      <div class="statistics-content" *ngIf="!loading && !error">
        <!-- Show message if no stats -->
        <div class="no-data" *ngIf="!stats">
          <p>No statistics data available</p>
        </div>

        <!-- Summary Cards - Only show if stats exist -->
        <div class="summary-cards" *ngIf="stats">
          <div class="summary-card total">
            <div class="card-icon">
              <span class="material-icons">people</span>
            </div>
            <div class="card-info">
              <span class="card-label">Total Users</span>
              <span class="card-value">{{ stats.totalUsers | number }}</span>
            </div>
          </div>

          <div class="summary-card active">
            <div class="card-icon">
              <span class="material-icons">check_circle</span>
            </div>
            <div class="card-info">
              <span class="card-label">Active Users</span>
              <span class="card-value">{{ stats.activeUsers | number }}</span>
            </div>
          </div>

          <div class="summary-card pending">
            <div class="card-icon">
              <span class="material-icons">hourglass_empty</span>
            </div>
            <div class="card-info">
              <span class="card-label">Pending Verification</span>
              <span class="card-value">{{ stats.pendingVerification | number }}</span>
            </div>
          </div>

          <div class="summary-card new">
            <div class="card-icon">
              <span class="material-icons">fiber_new</span>
            </div>
            <div class="card-info">
              <span class="card-label">New (7 days)</span>
              <span class="card-value">{{ stats.newUsersLast7Days | number }}</span>
            </div>
          </div>

          <div class="summary-card month">
            <div class="card-icon">
              <span class="material-icons">calendar_today</span>
            </div>
            <div class="card-info">
              <span class="card-label">New (30 days)</span>
              <span class="card-value">{{ stats.newUsersLast30Days | number }}</span>
            </div>
          </div>
        </div>

        <!-- Charts Section - Only show if stats exist -->
        <div class="charts-section" *ngIf="stats">
          <!-- Status Distribution -->
          <div class="chart-card">
            <h3>User Status Distribution</h3>
            <div class="chart-container">
              <div class="progress-chart">
                <div *ngFor="let item of statusBreakdown" class="progress-item">
                  <div class="progress-label">
                    <span>{{ item.label }}</span>
                    <span>{{ item.value | number }}</span>
                  </div>
                  <div class="progress-bar-container">
                    <div 
                      class="progress-bar" 
                      [style.width.%]="getPercentage(item.value, stats.totalUsers)"
                      [class]="'status-' + item.label.toLowerCase()"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Role Distribution -->
          <div class="chart-card">
            <h3>Users by Role</h3>
            <div class="chart-container">
              <div class="pie-chart">
                <div *ngFor="let item of roleStats" class="pie-legend">
                  <span class="legend-color" [style.background]="getRoleColor(item.label)"></span>
                  <span class="legend-label">{{ item.label }}</span>
                  <span class="legend-value">{{ item.value | number }}</span>
                  <span class="legend-percentage">
                    ({{ getPercentage(item.value, stats.totalUsers) }}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Language Distribution -->
          <div class="chart-card">
            <h3>Users by Language</h3>
            <div class="chart-container">
              <div class="language-bars">
                <div *ngFor="let item of languageStats" class="language-item">
                  <span class="language-label">{{ getLanguageName(item.label) }}</span>
                  <div class="language-bar-container">
                    <div 
                      class="language-bar" 
                      [style.width.%]="getPercentage(item.value, stats.totalUsers)"
                    ></div>
                  </div>
                  <span class="language-value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Status Counts -->
          <div class="chart-card">
            <h3>Status Counts</h3>
            <div class="chart-container">
              <div class="status-grid">
                <div class="status-item suspended">
                  <span class="status-label">Suspended</span>
                  <span class="status-number">{{ stats.suspendedUsers | number }}</span>
                </div>
                <div class="status-item blocked">
                  <span class="status-label">Blocked</span>
                  <span class="status-number">{{ stats.blockedUsers | number }}</span>
                </div>
                <div class="status-item deleted">
                  <span class="status-label">Deleted</span>
                  <span class="status-number">{{ stats.deletedUsers | number }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Activity Table -->
        <div class="activity-section" *ngIf="activityData.length > 0">
          <h2>User Activity</h2>
          <div class="table-container">
            <table class="activity-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th>Failed Login Attempts</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let activity of activityData">
                  <td>#{{ activity.userId }}</td>
                  <td>{{ activity.email }}</td>
                  <td>
                    <span class="status-badge" [class]="'status-' + activity.status.toLowerCase()">
                      {{ activity.status }}
                    </span>
                  </td>
                  <td>
                    <span class="status-indicator" [class.active]="activity.isActive">
                      {{ activity.isActive ? 'Yes' : 'No' }}
                    </span>
                  </td>
                  <td>
                    <span 
                      class="attempts-badge" 
                      [class.warning]="activity.failedLoginAttempts >= 3"
                      [class.danger]="activity.failedLoginAttempts >= 5"
                    >
                      {{ activity.failedLoginAttempts }}
                    </span>
                  </td>
                  <td>
                    <span class="never-login">Never</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Activity Data Message -->
        <div class="no-data" *ngIf="activityData.length === 0 && !loading">
          <p>No user activity data available</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 24px;
    }

    .statistics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .statistics-header h1 {
      margin: 0;
      font-size: 24px;
      color: #2d3748;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.3s;
    }

    .refresh-btn:hover {
      background: #f7fafc;
      border-color: #667eea;
      color: #667eea;
    }

    /* Debug Toggle */
    .debug-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2000;
      padding: 12px 20px;
      background: #4a5568;
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
    }

    .debug-toggle:hover {
      background: #2d3748;
      transform: translateY(-2px);
    }

    .debug-info {
      position: fixed;
      bottom: 90px;
      right: 20px;
      z-index: 2000;
      width: 300px;
      animation: slideIn 0.3s;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .debug-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      border: 2px solid #48bb78;
    }

    .debug-section h4 {
      margin: 0 0 15px 0;
      color: #2d3748;
      font-size: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 10px;
    }

    .debug-section p {
      margin: 8px 0;
      font-size: 13px;
      color: #4a5568;
    }

    .debug-btn {
      width: 100%;
      padding: 8px;
      margin-top: 10px;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
    }

    .error-state .material-icons {
      font-size: 48px;
      color: #e53e3e;
      margin-bottom: 16px;
    }

    .retry-btn {
      padding: 8px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 16px;
    }

    /* No Data */
    .no-data {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
      color: #a0aec0;
    }

    /* Summary Cards */
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .card-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .total .card-icon {
      background: #667eea20;
      color: #667eea;
    }

    .active .card-icon {
      background: #48bb7820;
      color: #48bb78;
    }

    .pending .card-icon {
      background: #ecc94b20;
      color: #ecc94b;
    }

    .new .card-icon {
      background: #9f7aea20;
      color: #9f7aea;
    }

    .month .card-icon {
      background: #ed64a620;
      color: #ed64a6;
    }

    .card-info {
      flex: 1;
    }

    .card-label {
      display: block;
      font-size: 14px;
      color: #718096;
      margin-bottom: 4px;
    }

    .card-value {
      display: block;
      font-size: 28px;
      font-weight: 600;
      color: #2d3748;
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .chart-card h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #4a5568;
      font-weight: 600;
    }

    .chart-container {
      min-height: 200px;
    }

    /* Progress Chart */
    .progress-chart {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .progress-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #4a5568;
    }

    .progress-bar-container {
      height: 8px;
      background: #edf2f7;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s;
    }

    .progress-bar.status-active {
      background: #48bb78;
    }

    .progress-bar.status-pending {
      background: #ecc94b;
    }

    .progress-bar.status-suspended {
      background: #ed8936;
    }

    .progress-bar.status-blocked {
      background: #f56565;
    }

    .progress-bar.status-deleted {
      background: #a0aec0;
    }

    /* Pie Chart Legend */
    .pie-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .pie-legend {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    .legend-label {
      color: #4a5568;
      min-width: 80px;
    }

    .legend-value {
      font-weight: 600;
      color: #2d3748;
      min-width: 50px;
    }

    .legend-percentage {
      color: #718096;
    }

    /* Language Bars */
    .language-bars {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .language-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .language-label {
      min-width: 40px;
      font-size: 14px;
      color: #4a5568;
    }

    .language-bar-container {
      flex: 1;
      height: 8px;
      background: #edf2f7;
      border-radius: 4px;
      overflow: hidden;
    }

    .language-bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s;
    }

    .language-value {
      min-width: 50px;
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
    }

    /* Status Grid */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 16px;
    }

    .status-item {
      text-align: center;
      padding: 16px;
      border-radius: 8px;
    }

    .status-item.suspended {
      background: #ed893620;
    }

    .status-item.blocked {
      background: #f5656520;
    }

    .status-item.deleted {
      background: #a0aec020;
    }

    .status-label {
      display: block;
      font-size: 14px;
      color: #718096;
      margin-bottom: 8px;
    }

    .status-number {
      display: block;
      font-size: 24px;
      font-weight: 600;
    }

    .suspended .status-number {
      color: #ed8936;
    }

    .blocked .status-number {
      color: #f56565;
    }

    .deleted .status-number {
      color: #718096;
    }

    /* Activity Section */
    .activity-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .activity-section h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #2d3748;
    }

    .table-container {
      overflow-x: auto;
    }

    .activity-table {
      width: 100%;
      border-collapse: collapse;
    }

    .activity-table th {
      text-align: left;
      padding: 12px;
      background: #f7fafc;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
    }

    .activity-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
      color: #4a5568;
    }

    .activity-table tr:hover td {
      background: #f7fafc;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-badge.status-active {
      background: #9ae6b4;
      color: #22543d;
    }

    .status-badge.status-pending {
      background: #fefcbf;
      color: #744210;
    }

    .status-badge.status-suspended {
      background: #fbd38d;
      color: #744210;
    }

    .status-badge.status-blocked {
      background: #feb2b2;
      color: #742a2a;
    }

    .status-badge.status-deleted {
      background: #cbd5e0;
      color: #2d3748;
    }

    .status-indicator {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #f7fafc;
    }

    .status-indicator.active {
      background: #9ae6b4;
      color: #22543d;
    }

    .attempts-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      background: #f7fafc;
    }

    .attempts-badge.warning {
      background: #fefcbf;
      color: #744210;
    }

    .attempts-badge.danger {
      background: #feb2b2;
      color: #742a2a;
    }

    .never-login {
      color: #a0aec0;
      font-style: italic;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: 1fr;
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .status-grid {
        grid-template-columns: 1fr;
      }
      
      .activity-table {
        min-width: 600px;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  stats: UserStatisticsResponse | null = null;
  activityData: UserActivityResponse[] = [];
  loading = true;
  error = '';

  roleStats: ChartDataPoint[] = [];
  languageStats: ChartDataPoint[] = [];
  statusBreakdown: ChartDataPoint[] = [];

  // Debug properties
  showDebug = true;
  hasToken = false;
  tokenValid = false;
  isAdmin = false;

  constructor(
    private statisticsService: StatisticsService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.loadStatistics();
  }

  checkAuth(): void {
    const token = this.tokenService.getAccessToken();
    this.hasToken = !!token;
    this.tokenValid = token ? !this.tokenService.isTokenExpired(token) : false;
    this.isAdmin = this.tokenService.isAdmin();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = '';
    
    this.checkAuth();

    // Load statistics summary
    this.statisticsService.getUserStatistics().subscribe({
      next: (stats) => {
        console.log('✅ Statistics loaded:', stats);
        this.stats = stats;
        this.processStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading statistics:', error);
        this.error = 'Failed to load statistics';
        this.loading = false;
      }
    });

    // Load user activity
    this.statisticsService.getUserActivity().subscribe({
      next: (activity) => {
        console.log('✅ Activity loaded:', activity);
        this.activityData = activity;
      },
      error: (error) => {
        console.error('❌ Error loading activity:', error);
      }
    });
  }

  processStats(): void {
    if (!this.stats) return;

    this.roleStats = roleStatsToChartData(this.stats.usersByRole);
    this.languageStats = languageStatsToChartData(this.stats.usersByLanguage);
    this.statusBreakdown = getStatusBreakdown(this.stats);

    console.log('Processed stats:', {
      roleStats: this.roleStats,
      languageStats: this.languageStats,
      statusBreakdown: this.statusBreakdown
    });
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ADMIN': '#feb2b2',
      'USER': '#9ae6b4',
      'SUPPORT': '#fbd38d'
    };
    return colors[role] || '#cbd5e0';
  }

  getLanguageName(lang: string): string {
    const languages: Record<string, string> = {
      'EN': 'English',
      'FR': 'French',
      'ES': 'Spanish',
      'DE': 'German',
      'IT': 'Italian'
    };
    return languages[lang] || lang;
  }
}