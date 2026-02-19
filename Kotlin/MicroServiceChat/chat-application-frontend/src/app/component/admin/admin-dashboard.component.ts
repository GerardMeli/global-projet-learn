import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav'; // AJOUTER
import { MatListModule } from '@angular/material/list'; // AJOUTER

import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service'; 
import { UserStatisticsResponse } from '../../models/statistics.model';
import { StatisticsService } from '../../service/statistics.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatGridListModule,
    MatMenuModule,
    MatSnackBarModule,
    MatSidenavModule,  // ← AJOUTÉ
    MatListModule       // ← AJOUTÉ
  ],
  template: `
<div class="dashboard-container">
  <!-- Sidebar -->
  <mat-drawer-container class="sidenav-container">
    <mat-drawer mode="side" opened class="sidenav">
      <div class="sidenav-header">
        <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
        <span class="logo-text">FlowManage</span>
      </div>
      
      <mat-divider></mat-divider>
      
      <div class="sidenav-content">
        <a mat-list-item routerLink="/admin" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
          <mat-icon matListItemIcon>dashboard</mat-icon>
          <span matListItemTitle>Dashboard</span>
        </a>
        <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link">
          <mat-icon matListItemIcon>people</mat-icon>
          <span matListItemTitle>Users</span>
        </a>
        <a mat-list-item routerLink="/admin/statistics" routerLinkActive="active-link">
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
        <div class="admin-info">
          <div class="admin-avatar">{{ adminInitial }}</div>
          <div class="admin-details">
            <div class="admin-email">{{ adminEmail }}</div>
            <div class="admin-role">Administrator</div>
          </div>
        </div>
        
        <button mat-button class="logout-btn" (click)="logout()" matTooltip="Sign out">
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
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of all users and activity</p>
        </div>
        
        <button mat-flat-button color="primary" routerLink="/admin/users" class="manage-btn">
          <mat-icon>group_add</mat-icon>
          Manage Users
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid" *ngIf="stats; else loadingStats">
        <!-- Total Users Card -->
        <mat-card class="stat-card stat-card--total">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">Total Users</div>
              <mat-icon class="stat-icon">people</mat-icon>
            </div>
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-footer">All registered accounts</div>
          </mat-card-content>
        </mat-card>

        <!-- Active Users Card -->
        <mat-card class="stat-card stat-card--active">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">Active</div>
              <mat-icon class="stat-icon">check_circle</mat-icon>
            </div>
            <div class="stat-value">{{ stats.activeUsers }}</div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill" 
                     [style.width.%]="pct(stats.activeUsers, stats.totalUsers)">
                </div>
              </div>
              <span class="progress-label">
                {{ pct(stats.activeUsers, stats.totalUsers) }}% of total
              </span>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Pending Verification Card -->
        <mat-card class="stat-card stat-card--pending">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">Pending Verification</div>
              <mat-icon class="stat-icon">hourglass_empty</mat-icon>
            </div>
            <div class="stat-value">{{ stats.pendingVerification }}</div>
            <div class="stat-footer">Unverified email</div>
          </mat-card-content>
        </mat-card>

        <!-- Blocked Users Card -->
        <mat-card class="stat-card stat-card--blocked">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">Blocked</div>
              <mat-icon class="stat-icon">block</mat-icon>
            </div>
            <div class="stat-value">{{ stats.blockedUsers }}</div>
            <div class="stat-footer">After 5 failed logins</div>
          </mat-card-content>
        </mat-card>

        <!-- Suspended Users Card -->
        <mat-card class="stat-card stat-card--suspended">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">Suspended</div>
              <mat-icon class="stat-icon">warning</mat-icon>
            </div>
            <div class="stat-value">{{ stats.suspendedUsers }}</div>
          </mat-card-content>
        </mat-card>

        <!-- New Users Card -->
        <mat-card class="stat-card stat-card--new">
          <mat-card-content>
            <div class="stat-header">
              <div class="stat-title">New Users</div>
              <mat-icon class="stat-icon">trending_up</mat-icon>
            </div>
            <div class="stat-value">+{{ stats.newUsersLast7Days }}</div>
            <div class="stat-period">Last 7 days</div>
            <div class="stat-trend">+{{ stats.newUsersLast30Days }} last 30 days</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loading State -->
      <ng-template #loadingStats>
        <div class="stats-grid">
          <mat-card class="stat-card skeleton" *ngFor="let i of [1,2,3,4,5,6]">
            <mat-card-content>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>

      <!-- Charts Row -->
      <div class="charts-row" *ngIf="stats">
        <!-- Role Distribution -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>admin_panel_settings</mat-icon>
              Users by Role
            </mat-card-title>
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
                  <div class="progress-bar-fill" 
                       [style.width.%]="pct(entry.value, stats.totalUsers)"
                       [style.background]="getRoleColor(entry.key)">
                  </div>
                </div>
                <div class="distribution-footer">
                  <span class="distribution-percent">
                    {{ pct(entry.value, stats.totalUsers) }}%
                  </span>
                  <button mat-icon-button class="view-btn" 
                          [routerLink]="['/admin/users']" 
                          [queryParams]="{role: entry.key}"
                          matTooltip="View {{ entry.key }} users">
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Language Distribution -->
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>language</mat-icon>
              Users by Language
            </mat-card-title>
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
                <div class="distribution-footer">
                  <span class="distribution-percent">
                    {{ pct(entry.value, stats.totalUsers) }}%
                  </span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <mat-card class="quick-actions-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>bolt</mat-icon>
            Quick Actions
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="actions-grid">
            <button mat-stroked-button class="action-btn" routerLink="/admin/users">
              <mat-icon>people</mat-icon>
              <span>View all users</span>
            </button>
            
            <button mat-stroked-button class="action-btn" routerLink="/admin/statistics">
              <mat-icon>bar_chart</mat-icon>
              <span>Activity report</span>
            </button>
            
            <button mat-stroked-button class="action-btn" 
                    routerLink="/admin/users" 
                    [queryParams]="{status:'PENDING'}">
              <mat-icon>hourglass_empty</mat-icon>
              <span>Pending users</span>
              <mat-chip *ngIf="stats?.pendingVerification" class="badge-chip" highlighted>
                {{ stats?.pendingVerification }}
              </mat-chip>
            </button>
            
            <button mat-stroked-button class="action-btn" 
                    routerLink="/admin/users" 
                    [queryParams]="{status:'BLOCKED'}">
              <mat-icon>block</mat-icon>
              <span>Blocked accounts</span>
              <mat-chip *ngIf="stats?.blockedUsers" class="badge-chip" highlighted>
                {{ stats?.blockedUsers }}
              </mat-chip>
            </button>
            
            <button mat-stroked-button class="action-btn" 
                    routerLink="/admin/users" 
                    [queryParams]="{active:'false'}">
              <mat-icon>radio_button_unchecked</mat-icon>
              <span>Inactive users</span>
            </button>
            
            <button mat-stroked-button class="action-btn" (click)="refreshDashboard()">
              <mat-icon>refresh</mat-icon>
              <span>Refresh data</span>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- System Health Card -->
      <mat-card class="health-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>monitor_heart</mat-icon>
            System Health
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="health-grid">
            <div class="health-item">
              <div class="health-label">
                <mat-icon>check_circle</mat-icon>
                System Status
              </div>
              <mat-chip class="health-chip" highlighted color="primary">Operational</mat-chip>
            </div>
            
            <div class="health-item">
              <div class="health-label">
                <mat-icon>schedule</mat-icon>
                Response Time
              </div>
              <span class="health-value">< 200ms</span>
            </div>
            
            <div class="health-item">
              <div class="health-label">
                <mat-icon>cloud</mat-icon>
                API Status
              </div>
              <mat-chip class="health-chip" highlighted color="primary">Connected</mat-chip>
            </div>
            
            <div class="health-item">
              <div class="health-label">
                <mat-icon>storage</mat-icon>
                Database
              </div>
              <mat-chip class="health-chip" highlighted color="primary">Healthy</mat-chip>
            </div>
          </div>
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

    .dashboard-container {
      height: 100vh;
    }

    .sidenav-container {
      height: 100%;
    }

    .sidenav {
      width: 280px;
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

    .admin-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .admin-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 16px;
    }

    .admin-details {
      overflow: hidden;
    }

    .admin-email {
      color: white;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }

    .admin-role {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
    }

    .logout-btn {
      width: 100%;
      color: rgba(255, 255, 255, 0.7);
      justify-content: flex-start;
      border: 1px solid rgba(255, 255, 255, 0.1);
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

    .manage-btn {
      border-radius: 24px !important;
      padding: 0 24px !important;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      border-radius: 16px !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
    }

    .stat-card .mat-mdc-card-content {
      padding: 20px;
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .stat-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
    }

    .stat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      opacity: 0.7;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .stat-footer, .stat-period, .stat-trend {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .stat-trend {
      margin-top: 4px;
    }

    /* Card Colors */
    .stat-card--total { background: linear-gradient(135deg, #1a237e, #283593); color: white; }
    .stat-card--total .stat-title,
    .stat-card--total .stat-footer,
    .stat-card--total .stat-period,
    .stat-card--total .stat-trend { color: rgba(255,255,255,0.7); }

    .stat-card--active { background: #e8f5e9; }
    .stat-card--active .stat-value { color: #2e7d32; }

    .stat-card--pending { background: #fff3e0; }
    .stat-card--pending .stat-value { color: #e65100; }

    .stat-card--blocked { background: #ffebee; }
    .stat-card--blocked .stat-value { color: #c62828; }

    .stat-card--suspended { background: #fff8e1; }
    .stat-card--suspended .stat-value { color: #856404; }

    .stat-card--new { background: #e3f2fd; }
    .stat-card--new .stat-value { color: #0d47a1; }

    /* Progress Bar */
    .stat-progress {
      margin-top: 8px;
    }

    .progress-bar {
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 4px;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      transition: width 0.8s ease;
    }

    .progress-label {
      font-size: 11px;
      color: var(--text-secondary);
    }

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
      margin-bottom: 12px;
    }

    @keyframes shimmer {
      to { background-position: -200% 0; }
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }

    .chart-card {
      border-radius: 16px !important;
    }

    .chart-card .mat-mdc-card-header {
      padding: 20px 20px 0;
    }

    .chart-card .mat-mdc-card-header mat-icon {
      margin-right: 8px;
      font-size: 20px;
    }

    .chart-card .mat-mdc-card-content {
      padding: 20px;
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
      min-height: 24px;
      font-size: 11px;
    }

    .role-chip.role-admin { background: #ff9800 !important; color: white !important; }
    .role-chip.role-user { background: #2196f3 !important; color: white !important; }
    .role-chip.role-moderator { background: #9c27b0 !important; color: white !important; }

    .language-label {
      font-size: 13px;
      font-weight: 500;
    }

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

    .language-fill {
      background: var(--info-color);
    }

    .distribution-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .distribution-percent {
      font-size: 11px;
      color: var(--text-secondary);
    }

    .view-btn {
      opacity: 0.5;
      transition: opacity 0.2s ease;
    }

    .view-btn:hover {
      opacity: 1;
    }

    /* Quick Actions */
    .quick-actions-card {
      border-radius: 16px !important;
      margin-bottom: 20px;
    }

    .quick-actions-card .mat-mdc-card-header {
      padding: 20px 20px 0;
    }

    .quick-actions-card .mat-mdc-card-header mat-icon {
      margin-right: 8px;
    }

    .quick-actions-card .mat-mdc-card-content {
      padding: 20px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px !important;
      height: auto !important;
      border: 1px dashed #ccc !important;
      border-radius: 12px !important;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      background: var(--primary-color) !important;
      color: white !important;
      border-color: var(--primary-color) !important;
    }

    .action-btn .mat-icon {
      margin-right: 4px;
    }

    .badge-chip {
      margin-left: auto;
      background: var(--primary-color) !important;
      color: white !important;
      font-size: 11px;
      min-height: 20px;
    }

    /* Health Card */
    .health-card {
      border-radius: 16px !important;
      background: linear-gradient(135deg, #f5f5f5, #ffffff);
    }

    .health-card .mat-mdc-card-header {
      padding: 20px 20px 0;
    }

    .health-card .mat-mdc-card-header mat-icon {
      margin-right: 8px;
    }

    .health-card .mat-mdc-card-content {
      padding: 20px;
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .health-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .health-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .health-label mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .health-value {
      font-size: 16px;
      font-weight: 500;
      color: var(--text-primary);
    }

    .health-chip {
      width: fit-content;
      background: var(--primary-color) !important;
      color: white !important;
      font-size: 11px;
      min-height: 24px;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1024px) {
      .charts-row { grid-template-columns: 1fr; }
      .health-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .sidenav { width: 0; }
      .stats-grid { grid-template-columns: 1fr; }
      .actions-grid { grid-template-columns: 1fr; }
      .health-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: UserStatisticsResponse | null = null;
  adminEmail = '';
  adminInitial = '';

  constructor(
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.adminEmail = this.tokenService.getEmail() ?? '';
    this.adminInitial = this.adminEmail.charAt(0).toUpperCase();
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.statisticsService.getUserStatistics().subscribe({
      next: (s) => {
        this.stats = s;
      },
      error: (err) => {
        this.snackBar.open('Error loading statistics', 'Close', { duration: 5000 });
      }
    });
  }

  refreshDashboard(): void {
    this.snackBar.open('Refreshing dashboard...', 'Close', { duration: 2000 });
    this.loadStatistics();
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

  pct(value: number, total: number): number {
    return total ? Math.round((value / total) * 100) : 0;
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      'ADMIN': '#ff9800',
      'USER': '#2196f3',
      'MODERATOR': '#9c27b0'
    };
    return colors[role] || '#757575';
  }

  langFlag(lang: string): string {
    const flags: Record<string, string> = {
      'FR': '🇫🇷', 'EN': '🇬🇧', 'ES': '🇪🇸', 'DE': '🇩🇪', 'IT': '🇮🇹'
    };
    return flags[lang] ?? '🌐';
  }

  logout(): void {
    this.authService.logout();
  }
}