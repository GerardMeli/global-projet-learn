import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav'; // AJOUTER CECI
import { MatListModule } from '@angular/material/list'; // AJOUTER CECI

import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserStatisticsResponse, UserActivityResponse } from '../../models/statistics.model';
import { ErrorHandlerService } from '../../service/error handler.service';
import { StatisticsService } from '../../service/statistics.service';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatMenuModule,
    MatSnackBarModule,
    MatSidenavModule,   // ← AJOUTÉ
    MatListModule       // ← AJOUTÉ
  ],
  template: `
<div class="admin-container">
  <!-- Sidebar -->
  <mat-drawer-container class="sidenav-container">
    <mat-drawer mode="side" opened class="sidenav">
      <div class="sidenav-header">
        <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
        <span class="logo-text">FlowManage</span>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="sidenav-content">
        <a mat-list-item routerLink="/admin" routerLinkActive="active-link">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle>Users</span>
        </a>
        <a mat-list-item routerLink="/admin/statistics" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
          <mat-icon matListItemIcon>bar_chart</mat-icon>
          <span matListItemTitle>Statistics</span>
        </a>
        <a mat-list-item routerLink="/profile" routerLinkActive="active-link">
          <mat-icon matListItemIcon>person</mat-icon>
          <span matListItemTitle>My Profile</span>
        </a>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="sidenav-footer">
        <button mat-button class="logout-btn" (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          Sign out
        </button>
      </div>
    </mat-drawer>

    <!-- Main Content -->
    <mat-drawer-content class="main-content">
      <!-- Header -->
      <div class="content-header">
        <div>
          <h1 class="page-title">Statistics & Activity</h1>
          <p class="page-subtitle">User behavior and platform health metrics</p>
        </div>
        
        <button mat-stroked-button (click)="refresh()" [disabled]="loadingStats" class="refresh-btn">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <!-- Error Alert -->
      <div *ngIf="error" class="alert error-alert">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
      </div>

      <!-- Summary Cards -->
      <div class="stats-grid" *ngIf="stats; else loadingStats">
        <mat-card class="stat-card stat-card--total">
          <mat-card-content>
            <div class="stat-label">Total Users</div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-trend">+{{ stats.newUsersLast30Days }} this month</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--active">
          <mat-card-content>
            <div class="stat-label">Active</div>
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-percentage">{{ (stats.activeUsers / stats.totalUsers * 100).toFixed(1) }}%</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--pending">
          <mat-card-content>
            <div class="stat-label">Pending</div>
            <div class="stat-value">{{ stats.pendingVerification }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--blocked">
          <mat-card-content>
            <div class="stat-label">Blocked</div>
            <div class="stat-value">{{ stats.blockedUsers }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--suspended">
          <mat-card-content>
            <div class="stat-label">Suspended</div>
            <div class="stat-value">{{ stats.suspendedUsers }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card stat-card--new">
          <mat-card-content>
            <div class="stat-label">New Users</div>
            <div class="stat-value">+{{ stats.newUsersLast7Days }}</div>
            <div class="stat-period">Last 7 days</div>
          </mat-card-content>
        </mat-card>
      </div>

      <ng-template #loadingStats>
        <div class="stats-grid">
          <mat-card class="stat-card skeleton" *ngFor="let i of [1,2,3,4,5,6]">
            <mat-card-content>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>

      <!-- Charts Row -->
      <div class="charts-row" *ngIf="stats">
        <!-- Status Donut -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Status Breakdown</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="donut-container">
              <div class="donut-wrapper">
                <svg viewBox="0 0 120 120" class="donut-svg">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#f0f0f0" stroke-width="16"/>
                  <circle *ngFor="let seg of donutSegments; let i = index"
                          cx="60" cy="60" r="48" fill="none"
                          [attr.stroke]="seg.color" stroke-width="16"
                          [attr.stroke-dasharray]="seg.dash"
                          [attr.stroke-dashoffset]="seg.offset"
                          transform="rotate(-90 60 60)"
                          style="transition: stroke-dasharray 1s ease"/>
                </svg>
                <div class="donut-center">
                  <div class="donut-total">{{ stats.totalUsers }}</div>
                  <div class="donut-label">users</div>
                </div>
              </div>
              
              <div class="legend-list">
                <div class="legend-item" *ngFor="let seg of donutSegments">
                  <span class="legend-dot" [style.background]="seg.color"></span>
                  <span class="legend-label">{{ seg.label }}</span>
                  <span class="legend-value">{{ seg.value }}</span>
                  <span class="legend-percent">{{ (seg.value / stats.totalUsers * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Role Distribution -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Users by Role</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="distribution-list">
              <div class="distribution-item" *ngFor="let entry of roleEntries">
                <div class="distribution-header">
                  <mat-chip class="role-chip" [class]="'role-' + entry.key.toLowerCase()">
                    {{ entry.key }}
                  </mat-chip>
                  <span class="distribution-count">{{ entry.value }}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill role-fill" 
                       [style.width.%]="pct(entry.value, stats.totalUsers)"
                       [style.background]="getRoleColor(entry.key)">
                  </div>
                </div>
                <span class="progress-percent">{{ pct(entry.value, stats.totalUsers) }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Language Distribution -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Users by Language</mat-card-title>
          </mat-card-header>
          
          <mat-card-content>
            <div class="distribution-list">
              <div class="distribution-item" *ngFor="let entry of langEntries">
                <div class="distribution-header">
                  <span class="language-label">
                    {{ langFlag(entry.key) }} {{ entry.key }}
                  </span>
                  <span class="distribution-count">{{ entry.value }}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar-fill language-fill" 
                       [style.width.%]="pct(entry.value, stats.totalUsers)">
                  </div>
                </div>
                <span class="progress-percent">{{ pct(entry.value, stats.totalUsers) }}%</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Activity Table -->
      <mat-card class="activity-card">
        <mat-card-header>
          <mat-card-title>User Activity</mat-card-title>
          <mat-card-subtitle>
            Recent user activity and login attempts
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading State -->
          <div *ngIf="loadingActivity" class="loading-table">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading activity data...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="activityError && !loadingActivity" class="alert error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ activityError }}</span>
          </div>

          <!-- Table -->
          <table mat-table [dataSource]="activity" class="activity-table" *ngIf="!loadingActivity && !activityError">

            <!-- Email Column -->
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef> Email </th>
              <td mat-cell *matCellDef="let user">
                <a [routerLink]="['/admin/users', user.userId]" class="user-link">
                  {{ user.email }}
                </a>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let user">
                <mat-chip class="status-chip" [class]="'status-' + user.status.toLowerCase()">
                  {{ user.status }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Active Column -->
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef> Active </th>
              <td mat-cell *matCellDef="let user">
                <mat-icon [class.active-icon]="user.isActive" [class.inactive-icon]="!user.isActive">
                  {{ user.isActive ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
              </td>
            </ng-container>

            <!-- Failed Logins Column -->
            <ng-container matColumnDef="failedLogins">
              <th mat-header-cell *matHeaderCellDef> Failed Logins </th>
              <td mat-cell *matCellDef="let user">
                <span [class.warning]="user.failedLoginAttempts >= 3"
                      [class.danger]="user.failedLoginAttempts >= 5">
                  {{ user.failedLoginAttempts }}/5
                  <mat-icon *ngIf="user.failedLoginAttempts >= 5" class="lock-icon">lock</mat-icon>
                </span>
              </td>
            </ng-container>

            <!-- Last Login Column -->
            <ng-container matColumnDef="lastLogin">
              <th mat-header-cell *matHeaderCellDef> Last Login </th>
              <td mat-cell *matCellDef="let user">
                <span class="muted-text">
                  <mat-icon class="info-icon">info</mat-icon>
                  Not tracked
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.row-blocked]="row.status === 'BLOCKED'"></tr>

            <!-- Empty State -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
                <mat-icon>info</mat-icon>
                <p>No activity data available</p>
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </mat-drawer-content>
  </mat-drawer-container>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --success-color: #4caf50;
      --warning-color: #ff9800;
      --error-color: #f44336;
      --info-color: #2196f3;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
      --skeleton-color: #e0e0e0;
    }

    .admin-container {
      height: 100vh;
    }

    .sidenav-container {
      height: 100%;
    }

    .sidenav {
      width: 260px;
      background: #1e293b;
      color: white;
      border: none;
    }

    .sidenav-header {
      padding: 24px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      color: var(--primary-color);
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 18px;
      font-weight: 600;
    }

    .sidenav-content {
      padding: 16px 8px;
    }

    .sidenav-content a {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 4px;
      border-radius: 8px;
    }

    .sidenav-content a:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .sidenav-content a.active-link {
      background: rgba(63, 81, 181, 0.2);
      color: var(--primary-color);
    }

    .sidenav-footer {
      padding: 16px;
    }

    .logout-btn {
      width: 100%;
      color: rgba(255, 255, 255, 0.7);
      justify-content: flex-start;
    }

    .logout-btn:hover {
      background: rgba(220, 53, 69, 0.2);
      color: #f87171;
    }

    .main-content {
      padding: 24px;
      background: var(--bg-light);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 4px 0;
      color: var(--text-primary);
    }

    .page-subtitle {
      color: var(--text-secondary);
      font-size: 14px;
      margin: 0;
    }

    .refresh-btn {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .error-alert {
      background: #ffebee;
      color: #c62828;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 12px !important;
      overflow: hidden;
    }

    .stat-card .mat-mdc-card-content {
      padding: 20px;
    }

    .stat-card--total { background: linear-gradient(135deg, #1a237e, #283593); color: white; }
    .stat-card--active { background: #e8f5e9; }
    .stat-card--pending { background: #fff3e0; }
    .stat-card--blocked { background: #ffebee; }
    .stat-card--suspended { background: #fff8e1; }
    .stat-card--new { background: #e3f2fd; }

    .stat-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.7;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .stat-trend, .stat-percentage, .stat-period {
      font-size: 12px;
      opacity: 0.8;
    }

    .stat-card--active .stat-value { color: #2e7d32; }
    .stat-card--pending .stat-value { color: #e65100; }
    .stat-card--blocked .stat-value { color: #c62828; }
    .stat-card--suspended .stat-value { color: #856404; }
    .stat-card--new .stat-value { color: #0d47a1; }

    /* Skeleton */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-line {
      height: 16px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      margin-bottom: 8px;
    }

    @keyframes shimmer {
      to { background-position: -200% 0; }
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 350px 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .chart-card {
      border-radius: 12px !important;
    }

    .chart-card .mat-mdc-card-header {
      padding: 20px 20px 0;
    }

    .chart-card .mat-mdc-card-content {
      padding: 20px;
    }

    /* Donut */
    .donut-container {
      display: flex;
      gap: 20px;
    }

    .donut-wrapper {
      position: relative;
      width: 140px;
      height: 140px;
    }

    .donut-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .donut-center {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .donut-total {
      font-size: 28px;
      font-weight: 600;
      line-height: 1;
    }

    .donut-label {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .legend-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .legend-label {
      flex: 1;
      color: var(--text-secondary);
    }

    .legend-value {
      font-weight: 600;
      margin-right: 8px;
    }

    .legend-percent {
      color: var(--text-secondary);
    }

    /* Distribution Lists */
    .distribution-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .distribution-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .distribution-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .role-chip {
      font-size: 11px;
      min-height: 24px;
    }

    .role-chip.role-admin { background: #ff9800 !important; color: white !important; }
    .role-chip.role-user { background: #2196f3 !important; color: white !important; }
    .role-chip.role-moderator { background: #9c27b0 !important; color: white !important; }

    .distribution-count {
      font-weight: 600;
    }

    .progress-bar-container {
      height: 6px;
      background: #f0f0f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      transition: width 0.8s ease;
    }

    .role-fill { background: var(--primary-color); }
    .language-fill { background: var(--info-color); }

    .progress-percent {
      font-size: 11px;
      color: var(--text-secondary);
      text-align: right;
    }

    .language-label {
      font-size: 13px;
    }

    /* Activity Table */
    .activity-card {
      border-radius: 12px !important;
    }

    .loading-table {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: var(--text-secondary);
    }

    .activity-table {
      width: 100%;
    }

    .user-link {
      color: var(--primary-color);
      text-decoration: none;
    }

    .user-link:hover {
      text-decoration: underline;
    }

    .status-chip {
      min-height: 24px;
      font-size: 11px;
    }

    .status-chip.status-active { background: #4caf50 !important; color: white !important; }
    .status-chip.status-inactive { background: #9e9e9e !important; color: white !important; }
    .status-chip.status-pending { background: #ff9800 !important; color: white !important; }
    .status-chip.status-blocked { background: #f44336 !important; color: white !important; }
    .status-chip.status-suspended { background: #ff5722 !important; color: white !important; }

    .active-icon { color: var(--success-color); }
    .inactive-icon { color: var(--text-secondary); }

    .warning { color: var(--warning-color); font-weight: 500; }
    .danger { color: var(--error-color); font-weight: 600; }

    .lock-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-left: 4px;
      vertical-align: middle;
    }

    .muted-text {
      color: var(--text-secondary);
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .info-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .row-blocked {
      opacity: 0.7;
      background: #fafafa;
    }

    .empty-row {
      text-align: center;
      padding: 48px !important;
      color: var(--text-secondary);
    }

    .empty-row mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(3, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .sidenav { width: 0; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  stats: UserStatisticsResponse | null = null;
  activity: UserActivityResponse[] = [];
  loadingStats = true;
  loadingActivity = true;
  error = '';
  activityError = '';

  displayedColumns: string[] = ['email', 'status', 'active', 'failedLogins', 'lastLogin'];
  readonly CIRCUMFERENCE = 2 * Math.PI * 48;

  constructor(
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  refresh(): void { 
    this.loadAll();
    this.snackBar.open('Refreshing statistics...', 'Close', { duration: 2000 });
  }

  loadAll(): void {
    this.loadingStats = true;
    this.loadingActivity = true;
    this.error = '';
    this.activityError = '';

    this.statisticsService.getUserStatistics().subscribe({
      next: (s) => { 
        this.stats = s; 
        this.loadingStats = false; 
      },
      error: (e: HttpErrorResponse) => { 
        this.error = this.errorHandler.handle(e).userMessage; 
        this.loadingStats = false; 
      }
    });

    this.statisticsService.getUserActivity().subscribe({
      next: (a) => { 
        this.activity = a; 
        this.loadingActivity = false; 
      },
      error: (e: HttpErrorResponse) => { 
        this.activityError = this.errorHandler.handle(e).userMessage; 
        this.loadingActivity = false; 
      }
    });
  }

  get donutSegments() {
    if (!this.stats) return [];
    const total = this.stats.totalUsers || 1;
    const segments = [
      { label: 'Active',    value: this.stats.activeUsers,          color: '#4CAF50' },
      { label: 'Pending',   value: this.stats.pendingVerification,  color: '#FF9800' },
      { label: 'Blocked',   value: this.stats.blockedUsers,         color: '#f44336' },
      { label: 'Suspended', value: this.stats.suspendedUsers,       color: '#ff9800' },
      { label: 'Deleted',   value: this.stats.deletedUsers,         color: '#9e9e9e' },
    ].filter(seg => seg.value > 0);
    
    let cumulativeOffset = 0;
    return segments.map(seg => {
      const frac = seg.value / total;
      const dash = `${frac * this.CIRCUMFERENCE} ${this.CIRCUMFERENCE}`;
      const offset = this.CIRCUMFERENCE - cumulativeOffset;
      cumulativeOffset += frac * this.CIRCUMFERENCE;
      return { ...seg, dash, offset };
    });
  }

  get roleEntries() {
    if (!this.stats) return [];
    return Object.entries(this.stats.usersByRole)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  get langEntries() {
    if (!this.stats) return [];
    return Object.entries(this.stats.usersByLanguage)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ADMIN': '#ff9800',
      'USER': '#2196f3',
      'MODERATOR': '#9c27b0'
    };
    return colors[role] || '#757575';
  }

  pct(value: number, total: number): number { 
    return total ? Math.round((value / total) * 100) : 0; 
  }

  langFlag(l: string): string {
    const flags: Record<string, string> = {
      'FR': '🇫🇷', 'EN': '🇬🇧', 'ES': '🇪🇸', 'DE': '🇩🇪', 'IT': '🇮🇹'
    };
    return flags[l] ?? '🌐';
  }

  logout(): void { 
    this.authService.logout(); 
  }
}