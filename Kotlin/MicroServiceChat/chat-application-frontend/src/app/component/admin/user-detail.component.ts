import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { UserProfileResponse } from '../../core/models/users/profile.model';
import { AdminUserUpdateRequest, UserStatusUpdateRequest, UserRoleUpdateRequest, AdminUserResponse } from '../../core/models/users/admin.model';
import { UserStatus, UserRole } from '../../core/models/users/enums.model';
import { AdminService } from '../../core/services/users/admin.service';
import { TokenService } from '../../core/services/users/token.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-detail-container">
      <!-- Header -->
      <div class="detail-header">
        <button class="back-btn" (click)="goBack()">
          <span class="material-icons">arrow_back</span>
          Back to Users
        </button>
        <h1>User Details</h1>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading user details...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <span class="material-icons">error</span>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadUser()">Retry</button>
      </div>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <span class="material-icons">check_circle</span>
        <p>{{ successMessage }}</p>
        <button class="close-btn" (click)="successMessage = ''">×</button>
      </div>

      <!-- User Details -->
      <div class="user-content" *ngIf="user && !loading">
        <!-- User Profile Card -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ getInitials() }}
            </div>
            <div class="profile-info">
              <h2>{{ getFullName() }}</h2>
              <p class="profile-email">{{ user.email }}</p>
              <div class="profile-badges">
                <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </span>
                <span class="status-badge" [class]="'status-' + user.status.toLowerCase()">
                  {{ user.status }}
                </span>
                <span class="active-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="edit-form">
          <div class="form-section">
            <h3>Personal Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="editData.firstName"
                  [placeholder]="user.firstName || 'Not provided'"
                >
              </div>
              
              <div class="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  [(ngModel)]="editData.lastName"
                  [placeholder]="user.lastName || 'Not provided'"
                >
              </div>
              
              <div class="form-group full-width">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  [(ngModel)]="editData.phoneNumber"
                  [placeholder]="user.phoneNumber || 'Not provided'"
                >
              </div>
              
              <div class="form-group full-width">
                <label>Address</label>
                <textarea 
                  [(ngModel)]="editData.address"
                  [placeholder]="user.address || 'Not provided'"
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Account Settings</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Language</label>
                <select [(ngModel)]="editData.language">
                  <option value="EN">English</option>
                  <option value="FR">French</option>
                  <option value="ES">Spanish</option>
                  <option value="DE">German</option>
                  <option value="IT">Italian</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Theme</label>
                <select [(ngModel)]="editData.theme">
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                  <option value="SYSTEM">System</option>
                </select>
              </div>
              
              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="emailNotifications">
                  Email Notifications
                </label>
              </div>

              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="editData.isActive">
                  Account Active
                </label>
              </div>

              <div class="form-group checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="editData.emailVerified">
                  Email Verified
                </label>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Status Management</h3>
            <div class="status-management">
              <div class="status-controls">
                <div class="form-group">
                  <label>Update Status</label>
                  <select [(ngModel)]="statusUpdate.status">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="DELETED">Deleted</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <label>Reason (optional)</label>
                  <textarea 
                    [(ngModel)]="statusUpdate.reason"
                    placeholder="Reason for status change (will be emailed to user)"
                    rows="2"
                    maxlength="500"
                  ></textarea>
                </div>
                
                <button 
                  class="update-btn status" 
                  (click)="updateStatus()"
                  [disabled]="!statusUpdate.status || updating"
                >
                  <span class="material-icons" *ngIf="!updating">update</span>
                  <span class="spinner-small" *ngIf="updating"></span>
                  {{ updating ? 'Updating...' : 'Update Status' }}
                </button>
              </div>

              <div class="status-controls">
                <div class="form-group">
                  <label>Update Role</label>
                  <select [(ngModel)]="roleUpdate.role">
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPPORT">Support</option>
                  </select>
                </div>
                
                <div class="form-group full-width">
                  <label>Reason (optional)</label>
                  <textarea 
                    [(ngModel)]="roleUpdate.reason"
                    placeholder="Reason for role change (will be emailed to user)"
                    rows="2"
                    maxlength="500"
                  ></textarea>
                </div>
                
                <button 
                  class="update-btn role" 
                  (click)="updateRole()"
                  [disabled]="!roleUpdate.role || updating"
                >
                  <span class="material-icons" *ngIf="!updating">admin_panel_settings</span>
                  <span class="spinner-small" *ngIf="updating"></span>
                  {{ updating ? 'Updating...' : 'Update Role' }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Account Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>User ID</label>
                <span>{{ user.id }}</span>
              </div>
              <div class="info-item">
                <label>Created At</label>
                <span>{{ user.createdAt | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <label>Email Verified</label>
                <span class="status-indicator" [class.verified]="user.emailVerified">
                  {{ user.emailVerified ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="info-item">
                <label>Failed Login Attempts</label>
                <span [class.warning]="user.failedLoginAttempts >= 3" 
                      [class.danger]="user.failedLoginAttempts >= 5">
                  {{ user.failedLoginAttempts }}
                </span>
              </div>
              <div class="info-item">
                <label>Last Login</label>
                <span class="never-login">Never</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="form-actions">
            <button class="save-btn" (click)="saveChanges()" [disabled]="saving">
              <span class="material-icons" *ngIf="!saving">save</span>
              <span class="spinner-small" *ngIf="saving"></span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button class="cancel-btn" (click)="resetForm()" [disabled]="saving">
              <span class="material-icons">undo</span>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .detail-header {
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.3s;
    }

    .back-btn:hover {
      background: #f7fafc;
      border-color: #667eea;
      color: #667eea;
    }

    .detail-header h1 {
      margin: 0;
      font-size: 24px;
      color: #2d3748;
    }

    /* Success Message */
    .success-message {
      background: #c6f6d5;
      border: 1px solid #9ae6b4;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .success-message .material-icons {
      color: #38a169;
      font-size: 24px;
    }

    .success-message p {
      margin: 0;
      color: #22543d;
      flex: 1;
    }

    .success-message .close-btn {
      background: none;
      border: none;
      color: #38a169;
      font-size: 24px;
      cursor: pointer;
      padding: 0 8px;
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

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
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

    /* Profile Card */
    .profile-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      color: white;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 600;
      border: 3px solid white;
    }

    .profile-info h2 {
      margin: 0 0 8px 0;
      font-size: 28px;
    }

    .profile-email {
      margin: 0 0 16px 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .profile-badges {
      display: flex;
      gap: 12px;
    }

    /* Edit Form */
    .edit-form {
      background: white;
      border-radius: 16px;
      padding: 32px;
    }

    .form-section {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    .form-section h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
      font-size: 18px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 500;
      color: #4a5568;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s;
      outline: none;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .checkbox-group {
      flex-direction: row;
      align-items: center;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    /* Status Management */
    .status-management {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .status-controls {
      background: #f7fafc;
      padding: 20px;
      border-radius: 12px;
    }

    .update-btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .update-btn.status {
      background: #667eea;
      color: white;
    }

    .update-btn.status:hover:not(:disabled) {
      background: #5a67d8;
    }

    .update-btn.role {
      background: #48bb78;
      color: white;
    }

    .update-btn.role:hover:not(:disabled) {
      background: #38a169;
    }

    .update-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-item label {
      font-size: 12px;
      color: #718096;
    }

    .info-item span {
      font-size: 14px;
      font-weight: 500;
      color: #2d3748;
    }

    .info-item span.warning {
      color: #ed8936;
      font-weight: 600;
    }

    .info-item span.danger {
      color: #e53e3e;
      font-weight: 600;
    }

    .status-indicator {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #f7fafc;
      display: inline-block;
      width: fit-content;
    }

    .status-indicator.verified {
      background: #9ae6b4;
      color: #22543d;
    }

    .never-login {
      color: #a0aec0;
      font-style: italic;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid #e2e8f0;
    }

    .save-btn, .cancel-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }

    .save-btn {
      background: #667eea;
      color: white;
    }

    .save-btn:hover:not(:disabled) {
      background: #5a67d8;
    }

    .cancel-btn {
      background: #f7fafc;
      color: #4a5568;
    }

    .cancel-btn:hover:not(:disabled) {
      background: #edf2f7;
    }

    .save-btn:disabled, .cancel-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Badge Styles */
    .role-badge, .status-badge, .active-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .role-admin {
      background: rgba(254, 178, 178, 0.2);
      color: #feb2b2;
    }

    .role-user {
      background: rgba(154, 230, 180, 0.2);
      color: #9ae6b4;
    }

    .role-support {
      background: rgba(251, 211, 141, 0.2);
      color: #fbd38d;
    }

    .status-active {
      background: rgba(154, 230, 180, 0.2);
      color: #9ae6b4;
    }

    .status-pending {
      background: rgba(254, 252, 191, 0.2);
      color: #fefcbf;
    }

    .status-suspended {
      background: rgba(251, 211, 141, 0.2);
      color: #fbd38d;
    }

    .status-blocked {
      background: rgba(254, 178, 178, 0.2);
      color: #feb2b2;
    }

    .status-deleted {
      background: rgba(203, 213, 224, 0.2);
      color: #cbd5e0;
    }

    .active-badge {
      background: rgba(154, 230, 180, 0.2);
      color: #9ae6b4;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        text-align: center;
      }
      
      .profile-badges {
        justify-content: center;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .status-management {
        grid-template-columns: 1fr;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .save-btn, .cancel-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class UserDetailComponent implements OnInit {
  userId!: number;
  user: UserProfileResponse | null = null;
  loading = true;
  error = '';
  successMessage = '';
  saving = false;
  updating = false;

  editData: Partial<AdminUserUpdateRequest> = {};
  statusUpdate: UserStatusUpdateRequest = { status: UserStatus.ACTIVE };
  roleUpdate: UserRoleUpdateRequest = { role: UserRole.USER };
  
  // Separate from editData for better control
  emailNotifications = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;
    this.error = '';
    
    this.adminService.getUserById(this.userId).subscribe({
      next: (user: UserProfileResponse) => {
        this.user = user;
        this.resetForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load user details';
        this.loading = false;
        console.error('Error loading user:', error);
      }
    });
  }

  getFullName(): string {
    if (!this.user) return '';
    const parts = [this.user.firstName, this.user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  }

  getInitials(): string {
    if (!this.user) return 'U';
    const first = this.user.firstName ? this.user.firstName.charAt(0) : '';
    const last = this.user.lastName ? this.user.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  resetForm(): void {
    if (!this.user) return;
    
    this.editData = {
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      phoneNumber: this.user.phoneNumber || '',
      address: this.user.address || '',
      language: this.user.language,
      theme: this.user.theme,
      isActive: this.user.isActive,
      emailVerified: this.user.emailVerified
    };
    
    this.emailNotifications = true; // Default value
    this.statusUpdate = { status: this.user.status };
    this.roleUpdate = { role: this.user.role };
  }

  saveChanges(): void {
    if (!this.user) return;
    
    this.saving = true;
    this.error = '';
    this.successMessage = '';
    
    // Add emailNotifications to editData if needed
    const updateData = {
      ...this.editData,
      emailNotifications: this.emailNotifications
    };
    
    this.adminService.updateUser(this.user.id, updateData).subscribe({
      next: (updatedUser: AdminUserResponse) => {
        this.successMessage = 'User updated successfully';
        this.loadUser(); // Reload to get fresh data
        this.saving = false;
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to update user';
        this.saving = false;
        console.error('Error updating user:', error);
      }
    });
  }

  updateStatus(): void {
    if (!this.user) return;
    
    this.updating = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.updateUserStatus(this.user.id, this.statusUpdate).subscribe({
      next: (updatedUser: AdminUserResponse) => {
        this.successMessage = 'User status updated successfully';
        this.loadUser(); // Reload to get updated data
        this.statusUpdate.reason = '';
        this.updating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to update status';
        this.updating = false;
        console.error('Error updating status:', error);
      }
    });
  }

  updateRole(): void {
    if (!this.user) return;
    
    this.updating = true;
    this.error = '';
    this.successMessage = '';
    
    this.adminService.updateUserRole(this.user.id, this.roleUpdate).subscribe({
      next: (updatedUser: AdminUserResponse) => {
        this.successMessage = 'User role updated successfully';
        this.loadUser(); // Reload to get updated data
        this.roleUpdate.reason = '';
        this.updating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to update role';
        this.updating = false;
        console.error('Error updating role:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}