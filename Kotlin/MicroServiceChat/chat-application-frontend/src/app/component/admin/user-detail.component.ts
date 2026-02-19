import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { UserProfileResponse } from '../../models/profile.model';
import { UserRole, UserStatus } from '../../models/enums.model';
import { ErrorHandlerService } from '../../service/error handler.service';
import { AdminService } from '../../service/admin.service';

// Confirmation Dialog Component
@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <h2 mat-dialog-title>Delete user permanently?</h2>
    <mat-dialog-content>
      <p>This is a <strong>hard delete</strong>. The user record will be permanently removed from the database and cannot be recovered.</p>
      <p>User: <strong>{{ data.email }}</strong></p>
      
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Type user email to confirm</mat-label>
        <input matInput [(ngModel)]="confirmEmail" placeholder="Enter email">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="warn" 
              [disabled]="confirmEmail !== data.email"
              [mat-dialog-close]="true">
        Delete permanently
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-top: 16px; }
  `]
})
export class DeleteConfirmDialogComponent {
  confirmEmail = '';
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { email: string }
  ) {}
}

@Component({
  selector: 'app-user-detail',
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
    MatSidenavModule,
    MatListModule,
    // DeleteConfirmDialogComponent
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
      <!-- Breadcrumb -->
      <div class="breadcrumb">
        <a mat-button routerLink="/admin/users" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          Back to users
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-state">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Loading user details...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="alert error-alert">
        <mat-icon>error</mat-icon>
        <span>{{ error }}</span>
        <button mat-button color="primary" routerLink="/admin/users">Return to users list</button>
      </div>

      <!-- User Details -->
      <ng-container *ngIf="user && !loading">
        <!-- User Header -->
        <div class="user-header">
          <div class="user-avatar-large">
            {{ userInitial }}
          </div>
          
          <div class="user-info">
            <h1 class="user-name">{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="user-email">{{ user.email }}</p>
            
            <div class="user-badges">
              <mat-chip-set>
                <mat-chip [class]="'role-chip role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </mat-chip>
                <mat-chip [class]="'status-chip status-' + user.status.toLowerCase()">
                  {{ user.status }}
                </mat-chip>
                <mat-chip *ngIf="!user.isActive" class="inactive-chip" color="warn">
                  Inactive
                </mat-chip>
                <mat-chip *ngIf="user.emailVerified" class="verified-chip" color="primary">
                  <mat-icon>check_circle</mat-icon>
                  Email verified
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </div>

        <!-- Detail Grid -->
        <div class="detail-grid">
          <!-- Account Details Card -->
          <mat-card class="detail-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>account_box</mat-icon>
                Account Details
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content>
              <div class="detail-item">
                <span class="detail-label">User ID</span>
                <span class="detail-value">#{{ user.id }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Phone</span>
                <span class="detail-value">{{ user.phoneNumber || '—' }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Address</span>
                <span class="detail-value">{{ user.address || '—' }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Language</span>
                <span class="detail-value">{{ getLanguageFlag(user.language) }} {{ user.language }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Theme</span>
                <span class="detail-value">{{ getThemeIcon(user.theme) }} {{ user.theme }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Notifications</span>
                <span class="detail-value">
                  <mat-icon class="notif-icon" [class.active]="user.emailNotifications">
                    {{ user.emailNotifications ? 'notifications_active' : 'notifications_off' }}
                  </mat-icon>
                  {{ user.emailNotifications ? 'On' : 'Off' }}
                </span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Joined</span>
                <span class="detail-value">{{ user.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              </div>
              
              <div class="detail-item">
                <span class="detail-label">Failed logins</span>
                <span class="detail-value" [class.warning]="user.failedLoginAttempts >= 3"
                                          [class.danger]="user.failedLoginAttempts >= 5">
                  {{ user.failedLoginAttempts }}/5
                  <mat-icon *ngIf="user.failedLoginAttempts >= 5" class="lock-icon">lock</mat-icon>
                </span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Update Status Card -->
          <mat-card class="detail-card" [formGroup]="statusForm">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>update</mat-icon>
                Update Status
              </mat-card-title>
              <mat-card-subtitle>
                Changing status sends a notification email to the user
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New status</mat-label>
                <mat-select formControlName="status">
                  <mat-option *ngFor="let s of statuses" [value]="s">
                    {{ s }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason (optional)</mat-label>
                <input matInput formControlName="reason" placeholder="Admin note" maxlength="500">
                <mat-hint>Max 500 characters</mat-hint>
              </mat-form-field>
              
              <div *ngIf="statusError" class="alert error-alert compact">
                <mat-icon>error</mat-icon>
                <span>{{ statusError }}</span>
              </div>
              
              <div *ngIf="statusSuccess" class="alert success-alert compact">
                <mat-icon>check_circle</mat-icon>
                <span>Status updated. Email sent.</span>
              </div>
              
              <div class="form-actions">
                <button mat-flat-button color="primary" 
                        [disabled]="savingStatus || statusForm.pristine"
                        (click)="saveStatus()">
                  <mat-spinner diameter="20" *ngIf="savingStatus" class="button-spinner"></mat-spinner>
                  <span>{{ savingStatus ? 'Updating...' : 'Update status' }}</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Update Role Card -->
          <mat-card class="detail-card" [formGroup]="roleForm">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>admin_panel_settings</mat-icon>
                Update Role
              </mat-card-title>
              <mat-card-subtitle>
                Changing role sends a notification email to the user
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>New role</mat-label>
                <mat-select formControlName="role">
                  <mat-option *ngFor="let r of roles" [value]="r">
                    {{ r }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Reason (optional)</mat-label>
                <input matInput formControlName="reason" placeholder="Admin note" maxlength="500">
                <mat-hint>Max 500 characters</mat-hint>
              </mat-form-field>
              
              <div *ngIf="roleError" class="alert error-alert compact">
                <mat-icon>error</mat-icon>
                <span>{{ roleError }}</span>
              </div>
              
              <div *ngIf="roleSuccess" class="alert success-alert compact">
                <mat-icon>check_circle</mat-icon>
                <span>Role updated. Email sent.</span>
              </div>
              
              <div class="form-actions">
                <button mat-flat-button color="primary" 
                        [disabled]="savingRole || roleForm.pristine"
                        (click)="saveRole()">
                  <mat-spinner diameter="20" *ngIf="savingRole" class="button-spinner"></mat-spinner>
                  <span>{{ savingRole ? 'Updating...' : 'Update role' }}</span>
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Danger Zone Card -->
          <mat-card class="detail-card danger-zone">
            <mat-card-header>
              <mat-card-title>
                <mat-icon color="warn">warning</mat-icon>
                Danger Zone
              </mat-card-title>
              <mat-card-subtitle>
                This is a <strong>hard delete</strong>. The user record will be permanently removed.
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <button mat-flat-button color="warn" class="delete-btn" (click)="openDeleteDialog()">
                <mat-icon>delete_forever</mat-icon>
                Delete this user permanently
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
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
      --danger-color: #f44336;
      --danger-light: #ffebee;
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

    /* Breadcrumb */
    .breadcrumb {
      margin-bottom: 24px;
    }

    .back-link {
      color: var(--text-secondary);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .back-link:hover {
      color: var(--primary-color);
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

    .alert.compact {
      padding: 12px;
      margin-bottom: 16px;
    }

    .error-alert {
      background: #ffebee;
      color: #c62828;
    }

    .success-alert {
      background: #e8f5e9;
      color: #2e7d32;
    }

    /* User Header */
    .user-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 32px;
      background: white;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .user-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), #7986cb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 600;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .user-email {
      color: var(--text-secondary);
      margin: 0 0 12px 0;
    }

    .user-badges {
      display: flex;
      gap: 8px;
    }

    .role-chip { min-height: 24px; }
    .role-chip.role-admin { background: #ff9800 !important; color: white !important; }
    .role-chip.role-user { background: #2196f3 !important; color: white !important; }
    .role-chip.role-moderator { background: #9c27b0 !important; color: white !important; }

    .status-chip { min-height: 24px; }
    .status-chip.status-active { background: #4caf50 !important; color: white !important; }
    .status-chip.status-inactive { background: #9e9e9e !important; color: white !important; }
    .status-chip.status-pending { background: #ff9800 !important; color: white !important; }
    .status-chip.status-blocked { background: #f44336 !important; color: white !important; }
    .status-chip.status-suspended { background: #ff5722 !important; color: white !important; }

    .inactive-chip { background: #f44336 !important; color: white !important; }
    .verified-chip { background: #4caf50 !important; color: white !important; }
    .verified-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    /* Detail Grid */
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .detail-card {
      border-radius: 16px !important;
    }

    .detail-card .mat-mdc-card-header {
      padding: 20px 20px 0;
    }

    .detail-card .mat-mdc-card-header mat-icon {
      margin-right: 8px;
      font-size: 20px;
    }

    .detail-card .mat-mdc-card-content {
      padding: 20px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .detail-value {
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .notif-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--text-secondary);
    }

    .notif-icon.active {
      color: var(--success-color);
    }

    .warning {
      color: var(--warning-color);
      font-weight: 500;
    }

    .danger {
      color: var(--error-color);
      font-weight: 600;
    }

    .lock-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-left: 4px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* Danger Zone */
    .danger-zone {
      border: 1px solid var(--danger-color) !important;
      background: var(--danger-light);
    }

    .delete-btn {
      width: 100%;
      background: var(--danger-color) !important;
      color: white !important;
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
      .detail-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .user-header {
        flex-direction: column;
        text-align: center;
      }

      .user-badges {
        justify-content: center;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  user: UserProfileResponse | null = null;
  loading = true;
  error = '';
  userInitial = '';

  statuses = Object.values(UserStatus);
  roles = Object.values(UserRole);

  statusForm: FormGroup;
  savingStatus = false;
  statusError = '';
  statusSuccess = false;

  roleForm: FormGroup;
  savingRole = false;
  roleError = '';
  roleSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private errorHandler: ErrorHandlerService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.statusForm = this.fb.group({ 
      status: [''], 
      reason: ['', Validators.maxLength(500)] 
    });
    this.roleForm = this.fb.group({ 
      role: [''], 
      reason: ['', Validators.maxLength(500)] 
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser(id);
  }

  loadUser(id: number): void {
    this.loading = true;
    this.adminService.getUserById(id).subscribe({
      next: (u) => {
        this.user = u;
        this.userInitial = (u.firstName?.charAt(0) ?? u.email.charAt(0)).toUpperCase();
        this.statusForm.patchValue({ status: u.status });
        this.roleForm.patchValue({ role: u.role });
        this.loading = false;
      },
      error: (e: HttpErrorResponse) => {
        this.error = this.errorHandler.handle(e).userMessage;
        this.loading = false;
        this.snackBar.open('Error loading user details', 'Close', { duration: 5000 });
      }
    });
  }

  getLanguageFlag(lang: string): string {
    const flags: Record<string, string> = {
      'FR': '🇫🇷', 'EN': '🇬🇧', 'ES': '🇪🇸', 'DE': '🇩🇪', 'IT': '🇮🇹'
    };
    return flags[lang] || '🌐';
  }

  getThemeIcon(theme: string): string {
    const icons: Record<string, string> = {
      'LIGHT': '☀️', 'DARK': '🌙', 'SYSTEM': '🖥'
    };
    return icons[theme] || '☀️';
  }

  saveStatus(): void {
    if (!this.user) return;
    
    this.savingStatus = true;
    this.statusError = '';
    this.statusSuccess = false;

    const { status, reason } = this.statusForm.value;
    
    this.adminService.updateUserStatus(this.user.id, { 
      status, 
      reason: reason || undefined 
    }).subscribe({
      next: (updated) => {
        this.user!.status = updated.status;
        this.statusSuccess = true;
        this.savingStatus = false;
        this.statusForm.markAsPristine();
        
        this.snackBar.open('Status updated successfully', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => this.statusSuccess = false, 4000);
      },
      error: (e: HttpErrorResponse) => {
        this.statusError = this.errorHandler.handle(e).userMessage;
        this.savingStatus = false;
      }
    });
  }

  saveRole(): void {
    if (!this.user) return;
    
    this.savingRole = true;
    this.roleError = '';
    this.roleSuccess = false;

    const { role, reason } = this.roleForm.value;
    
    this.adminService.updateUserRole(this.user.id, { 
      role, 
      reason: reason || undefined 
    }).subscribe({
      next: (updated) => {
        this.user!.role = updated.role;
        this.roleSuccess = true;
        this.savingRole = false;
        this.roleForm.markAsPristine();
        
        this.snackBar.open('Role updated successfully', 'Close', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => this.roleSuccess = false, 4000);
      },
      error: (e: HttpErrorResponse) => {
        this.roleError = this.errorHandler.handle(e).userMessage;
        this.savingRole = false;
      }
    });
  }

  openDeleteDialog(): void {
    if (!this.user) return;

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '450px',
      data: { email: this.user.email }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.user) {
        this.deleteUser();
      }
    });
  }

  deleteUser(): void {
    if (!this.user) return;

    this.adminService.deleteUser(this.user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/users']);
      },
      error: (e: HttpErrorResponse) => {
        const error = this.errorHandler.handle(e);
        this.snackBar.open(error.userMessage, 'Close', { duration: 5000 });
      }
    });
  }

  logout(): void { 
    this.authService.logout(); 
  }
}