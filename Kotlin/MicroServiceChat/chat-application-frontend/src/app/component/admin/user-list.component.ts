import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { UserStatus, UserRole } from '../../models/enums.model';
import { UserProfileResponse } from '../../models/profile.model';
import { AdminService } from '../../service/admin.service';
import { ErrorHandlerService } from '../../service/error handler.service';

// Edit Dialog Component
@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,  // ← AJOUTER CECI
    MatChipsModule  // ← AJOUTER CECI (optionnel mais recommandé)
  ],
  template: `
    <h2 mat-dialog-title>Edit User</h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>First name</mat-label>
            <input matInput formControlName="firstName">
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Last name</mat-label>
            <input matInput formControlName="lastName">
          </mat-form-field>
        </div>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option *ngFor="let s of statuses" [value]="s">
              {{ s }}
            </mat-option>
          </mat-select>
          <mat-hint>Changing status sends a notification email</mat-hint>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option *ngFor="let r of roles" [value]="r">
              {{ r }}
            </mat-option>
          </mat-select>
          <mat-hint>Changing role sends a notification email</mat-hint>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reason (optional)</mat-label>
          <input matInput formControlName="reason" placeholder="Reason for changes" maxlength="500">
        </mat-form-field>
      </form>
      
      <div *ngIf="error" class="alert error-alert">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
      </div>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" 
              [disabled]="form.pristine || form.invalid"
              (click)="save()">
        <mat-spinner diameter="20" *ngIf="saving" class="button-spinner"></mat-spinner>
        <span>{{ saving ? 'Saving...' : 'Save changes' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;
      min-width: 400px;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
    .alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 16px;
    }
    .error-alert {
      background: #ffebee;
      color: #c62828;
    }
    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class EditUserDialogComponent {
  form: FormGroup;
  statuses = Object.values(UserStatus);
  roles = Object.values(UserRole);
  saving = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserProfileResponse },
    private fb: FormBuilder,
    private adminService: AdminService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      firstName: [data.user.firstName || ''],
      lastName: [data.user.lastName || ''],
      status: [data.user.status],
      role: [data.user.role],
      reason: ['']
    });
  }

  save(): void {
    if (this.form.invalid || this.form.pristine) return;
    
    this.saving = true;
    this.error = '';

    const userId = this.data.user.id;
    const { firstName, lastName, status, role, reason } = this.form.value;
    const origStatus = this.data.user.status;
    const origRole = this.data.user.role;

    // Update base info first
    this.adminService.updateUser(userId, { firstName, lastName }).subscribe({
      next: () => {
        // Handle status change
        const statusChanged = status !== origStatus;
        const roleChanged = role !== origRole;

        const completeUpdate = () => {
          this.saving = false;
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        };

        const handleRoleChange = () => {
          if (roleChanged) {
            this.adminService.updateUserRole(userId, { role, reason: reason || undefined }).subscribe({
              next: completeUpdate,
              error: (e) => {
                this.error = this.errorHandler.handle(e).userMessage;
                this.saving = false;
              }
            });
          } else {
            completeUpdate();
          }
        };

        if (statusChanged) {
          this.adminService.updateUserStatus(userId, { status, reason: reason || undefined }).subscribe({
            next: handleRoleChange,
            error: (e) => {
              this.error = this.errorHandler.handle(e).userMessage;
              this.saving = false;
            }
          });
        } else {
          handleRoleChange();
        }
      },
      error: (e) => {
        this.error = this.errorHandler.handle(e).userMessage;
        this.saving = false;
      }
    });
  }
}

// Delete Confirmation Dialog
@Component({
  selector: 'app-delete-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule  // ← AJOUTER CECI
  ],
  template: `
    <h2 mat-dialog-title>Delete user permanently?</h2>
    <mat-dialog-content>
      <p>This is a <strong>hard delete</strong>. The user record will be permanently removed from the database and cannot be recovered.</p>
      <p>User: <strong>{{ data.user.email }}</strong></p>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Type user email to confirm</mat-label>
        <input matInput [(ngModel)]="confirmEmail" placeholder="Enter email">
      </mat-form-field>
      
      <div *ngIf="error" class="alert error-alert">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" 
              [disabled]="confirmEmail !== data.user.email || deleting"
              (click)="delete()">
        <mat-spinner diameter="20" *ngIf="deleting" class="button-spinner"></mat-spinner>
        <span>{{ deleting ? 'Deleting...' : 'Delete permanently' }}</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 16px; }
    .alert {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 16px;
    }
    .error-alert {
      background: #ffebee;
      color: #c62828;
    }
    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }
  `]
})
export class DeleteUserDialogComponent {
  confirmEmail = '';
  deleting = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserProfileResponse },
    private adminService: AdminService,
    private errorHandler: ErrorHandlerService,
    private snackBar: MatSnackBar
  ) {}

  delete(): void {
    if (this.confirmEmail !== this.data.user.email) return;
    
    this.deleting = true;
    this.error = '';

    this.adminService.deleteUser(this.data.user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (e) => {
        this.error = this.errorHandler.handle(e).userMessage;
        this.deleting = false;
      }
    });
  }
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    FormsModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatSidenavModule,
    MatListModule,
    // EditUserDialogComponent,
    // DeleteUserDialogComponent
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
        <a mat-list-item routerLink="/admin/users" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact:true}">
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
          <h1 class="page-title">User Management</h1>
          <p class="page-subtitle">{{ filteredData.length }} user(s) found</p>
        </div>
      </div>

      <!-- Filters -->
      <mat-card class="filters-card" appearance="outlined">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search users</mat-label>
              <input matInput formControlName="search" placeholder="Search by name or email...">
              <button mat-icon-button matSuffix *ngIf="filterForm.value.search" (click)="clearSearch()">
                <mat-icon>close</mat-icon>
              </button>
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select formControlName="status">
                <mat-option value="">All statuses</mat-option>
                <mat-option *ngFor="let s of statuses" [value]="s">{{ s }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role">
                <mat-option value="">All roles</mat-option>
                <mat-option *ngFor="let r of roles" [value]="r">{{ r }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Active status</mat-label>
              <mat-select formControlName="active">
                <mat-option value="">All</mat-option>
                <mat-option value="true">Active only</mat-option>
                <mat-option value="false">Inactive only</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button class="reset-btn" (click)="resetFilters()">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Error Alert -->
      <div *ngIf="error" class="alert error-alert">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <mat-card class="table-card" *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="dataSource" matSort class="users-table">

            <!-- User Column -->
            <ng-container matColumnDef="user">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> User </th>
              <td mat-cell *matCellDef="let user">
                <div class="user-cell">
                  <div class="user-avatar">{{ getUserInitial(user) }}</div>
                  <div class="user-info">
                    <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Role Column -->
            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
              <td mat-cell *matCellDef="let user">
                <mat-chip class="role-chip" [class]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let user">
                <mat-chip class="status-chip" [class]="'status-' + user.status.toLowerCase()">
                  {{ user.status }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Active Column -->
            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Active </th>
              <td mat-cell *matCellDef="let user">
                <mat-icon [class.active-icon]="user.isActive" [class.inactive-icon]="!user.isActive">
                  {{ user.isActive ? 'check_circle' : 'radio_button_unchecked' }}
                </mat-icon>
              </td>
            </ng-container>

            <!-- Failed Logins Column -->
            <ng-container matColumnDef="failedLogins">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Failed Logins </th>
              <td mat-cell *matCellDef="let user">
                <span [class.warning]="user.failedLoginAttempts >= 3"
                      [class.danger]="user.failedLoginAttempts >= 5">
                  {{ user.failedLoginAttempts }}/5
                  <mat-icon *ngIf="user.failedLoginAttempts >= 5" class="lock-icon">lock</mat-icon>
                </span>
              </td>
            </ng-container>

            <!-- Joined Column -->
            <ng-container matColumnDef="joined">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Joined </th>
              <td mat-cell *matCellDef="let user">
                {{ user.createdAt | date:'dd MMM yyyy' }}
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu" class="action-btn">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/admin/users', user.id]">
                    <mat-icon>visibility</mat-icon>
                    <span>View details</span>
                  </a>
                  <button mat-menu-item (click)="openEditDialog(user)">
                    <mat-icon>edit</mat-icon>
                    <span>Edit</span>
                  </button>
                  <button mat-menu-item class="delete-option" (click)="openDeleteDialog(user)">
                    <mat-icon color="warn">delete</mat-icon>
                    <span>Delete</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.row-blocked]="row.status === 'BLOCKED'"
                [class.row-inactive]="!row.isActive"></tr>

            <!-- Empty State -->
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell empty-row" [attr.colspan]="displayedColumns.length">
                <mat-icon>people_outline</mat-icon>
                <p>No users match your filters</p>
                <button mat-stroked-button color="primary" (click)="resetFilters()">
                  Clear filters
                </button>
              </td>
            </tr>
          </table>

          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
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
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
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

    /* Filters */
    .filters-card {
      margin-bottom: 20px;
      border-radius: 12px !important;
    }

    .filters-form {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 2;
      min-width: 250px;
    }

    .filter-field {
      flex: 1;
      min-width: 150px;
    }

    .reset-btn {
      height: 56px;
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .error-alert {
      background: #ffebee;
      color: #c62828;
    }

    /* Loading State */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 80px;
      color: var(--text-secondary);
    }

    /* Table */
    .table-card {
      border-radius: 12px !important;
      overflow: hidden;
    }

    .users-table {
      width: 100%;
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e8eaf6;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-info {
      line-height: 1.4;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
    }

    .user-email {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .role-chip {
      min-height: 24px;
      font-size: 11px;
    }

    .role-chip.role-admin { background: #ff9800 !important; color: white !important; }
    .role-chip.role-user { background: #2196f3 !important; color: white !important; }
    .role-chip.role-moderator { background: #9c27b0 !important; color: white !important; }

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

    .action-btn {
      opacity: 0.7;
    }

    tr:hover .action-btn {
      opacity: 1;
    }

    .row-blocked {
      opacity: 0.7;
      background: #fafafa;
    }

    .row-inactive {
      opacity: 0.8;
    }

    .delete-option {
      color: var(--error-color);
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

    /* Material Overrides */
    ::ng-deep .mat-mdc-form-field-flex {
      height: 56px !important;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .filters-form {
        flex-direction: column;
      }
      
      .search-field,
      .filter-field,
      .reset-btn {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .sidenav { width: 0; }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: UserProfileResponse[] = [];
  filteredData: UserProfileResponse[] = [];
  loading = true;
  error = '';

  filterForm: FormGroup;
  statuses = Object.values(UserStatus);
  roles = Object.values(UserRole);

  displayedColumns: string[] = ['user', 'role', 'status', 'active', 'failedLogins', 'joined', 'actions'];

  dataSource: any;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminService: AdminService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private tokenService: TokenService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      role: [''],
      active: ['']
    });
  }

  ngOnInit(): void {
    // Support queryParams from dashboard quick-actions
    const status = this.route.snapshot.queryParams['status'];
    if (status) this.filterForm.patchValue({ status });

    this.loadUsers();
    
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = this.errorHandler.handle(err).userMessage;
        this.loading = false;
        this.snackBar.open('Error loading users', 'Close', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    const { search, status, role, active } = this.filterForm.value;
    const query = (search ?? '').toLowerCase().trim();

    this.filteredData = this.users.filter(user => {
      const matchesSearch = !query || 
        user.email.toLowerCase().includes(query) ||
        (user.firstName?.toLowerCase() || '').includes(query) ||
        (user.lastName?.toLowerCase() || '').includes(query);

      const matchesStatus = !status || user.status === status;
      const matchesRole = !role || user.role === role;
      const matchesActive = active === '' ? true : user.isActive === (active === 'true');

      return matchesSearch && matchesStatus && matchesRole && matchesActive;
    });

    // Update table data source
    this.dataSource = this.filteredData;
  }

  clearSearch(): void {
    this.filterForm.patchValue({ search: '' });
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      role: '',
      active: ''
    });
  }

  getUserInitial(user: UserProfileResponse): string {
    return (user.firstName?.charAt(0) ?? user.email.charAt(0)).toUpperCase();
  }

  openEditDialog(user: UserProfileResponse): void {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: '600px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadUsers(); // Reload to get updated data
      }
    });
  }

  openDeleteDialog(user: UserProfileResponse): void {
    const dialogRef = this.dialog.open(DeleteUserDialogComponent, {
      width: '450px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilters();
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}