import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { UserProfileResponse, UserProfileUpdateRequest, UserPreferencesUpdateRequest, PasswordChangeRequest, EmailUpdateRequest } from '../../core/models/users/profile.model';
import { AuthService } from '../../core/services/users/auth.service';
import { ProfileService } from '../../core/services/users/profile.service';
import { TokenService } from '../../core/services/users/token.service';
import { Language, Theme } from '../../core/models/users/enums.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>My Profile</h1>
        <button class="logout-btn" (click)="logout()">
          <span class="material-icons">logout</span>
          Logout
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="error">
        <span class="material-icons">error</span>
        <p>{{ error }}</p>
        <button class="retry-btn" (click)="loadProfile()">Retry</button>
      </div>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <span class="material-icons">check_circle</span>
        <p>{{ successMessage }}</p>
        <button class="close-btn" (click)="successMessage = ''">×</button>
      </div>

      <!-- Profile Content -->
      <div class="profile-content" *ngIf="profile && !loading">
        <!-- Profile Card -->
        <div class="profile-card">
          <div class="profile-avatar">
            {{ getInitials() }}
          </div>
          <div class="profile-info">
            <h2>{{ getFullName() }}</h2>
            <p class="profile-email">{{ profile.email }}</p>
            <div class="profile-badges">
              <span class="role-badge" [class]="'role-' + profile.role.toLowerCase()">
                {{ profile.role }}
              </span>
              <span class="status-badge" [class]="'status-' + profile.status.toLowerCase()">
                {{ profile.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Edit Tabs -->
        <div class="profile-tabs">
          <button class="tab-btn" [class.active]="activeTab === 'personal'" (click)="activeTab = 'personal'">
            <span class="material-icons">person</span>
            Personal Info
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'preferences'" (click)="activeTab = 'preferences'">
            <span class="material-icons">settings</span>
            Preferences
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">
            <span class="material-icons">security</span>
            Security
          </button>
          <button class="tab-btn" [class.active]="activeTab === 'email'" (click)="activeTab = 'email'">
            <span class="material-icons">email</span>
            Email
          </button>
        </div>

        <!-- Personal Info Tab -->
        <div class="tab-content" *ngIf="activeTab === 'personal'">
          <h3>Personal Information</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                [(ngModel)]="personalInfo.firstName"
                [placeholder]="profile.firstName || 'Enter first name'"
              >
            </div>
            
            <div class="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                [(ngModel)]="personalInfo.lastName"
                [placeholder]="profile.lastName || 'Enter last name'"
              >
            </div>
            
            <div class="form-group full-width">
              <label>Phone Number</label>
              <input 
                type="tel" 
                [(ngModel)]="personalInfo.phoneNumber"
                [placeholder]="profile.phoneNumber || 'Enter phone number'"
              >
            </div>
            
            <div class="form-group full-width">
              <label>Address</label>
              <textarea 
                [(ngModel)]="personalInfo.address"
                [placeholder]="profile.address || 'Enter address'"
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="save-btn" (click)="updatePersonalInfo()" [disabled]="saving">
              <span class="material-icons" *ngIf="!saving">save</span>
              <span class="spinner-small" *ngIf="saving"></span>
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button class="cancel-btn" (click)="resetPersonalInfo()">Reset</button>
          </div>
        </div>

        <!-- Preferences Tab -->
        <div class="tab-content" *ngIf="activeTab === 'preferences'">
          <h3>Preferences</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Language</label>
              <select [(ngModel)]="preferences.language">
                <option value="EN">English</option>
                <option value="FR">French</option>
                <option value="ES">Spanish</option>
                <option value="DE">German</option>
                <option value="IT">Italian</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Theme</label>
              <select [(ngModel)]="preferences.theme">
                <option value="LIGHT">Light</option>
                <option value="DARK">Dark</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
            
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="preferences.emailNotifications">
                Email Notifications
              </label>
            </div>
          </div>
          
          <div class="form-actions">
            <button class="save-btn" (click)="updatePreferences()" [disabled]="saving">
              <span class="material-icons" *ngIf="!saving">save</span>
              <span class="spinner-small" *ngIf="saving"></span>
              {{ saving ? 'Saving...' : 'Save Preferences' }}
            </button>
            <button class="cancel-btn" (click)="resetPreferences()">Reset</button>
          </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-content" *ngIf="activeTab === 'security'">
          <h3>Change Password</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Current Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.currentPassword"
                placeholder="Enter current password"
              >
            </div>
            
            <div class="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.newPassword"
                placeholder="Enter new password"
              >
            </div>
            
            <div class="form-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                [(ngModel)]="passwordData.confirmPassword"
                placeholder="Confirm new password"
              >
            </div>
          </div>
          
          <div class="password-requirements">
            <p><strong>Password requirements:</strong></p>
            <ul>
              <li [class.valid]="passwordData.newPassword.length >= 8">
                At least 8 characters
              </li>
              <li [class.valid]="/[A-Z]/.test(passwordData.newPassword)">
                At least one uppercase letter
              </li>
              <li [class.valid]="/[a-z]/.test(passwordData.newPassword)">
                At least one lowercase letter
              </li>
              <li [class.valid]="/[0-9]/.test(passwordData.newPassword)">
                At least one number
              </li>
              <li [class.valid]="passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length > 0">
                Passwords match
              </li>
            </ul>
          </div>
          
          <div class="form-actions">
            <button class="save-btn" (click)="changePassword()" [disabled]="!isPasswordValid() || saving">
              <span class="material-icons" *ngIf="!saving">lock</span>
              <span class="spinner-small" *ngIf="saving"></span>
              {{ saving ? 'Updating...' : 'Update Password' }}
            </button>
            <button class="cancel-btn" (click)="resetPasswordForm()">Clear</button>
          </div>
        </div>

        <!-- Email Tab -->
        <div class="tab-content" *ngIf="activeTab === 'email'">
          <h3>Change Email Address</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Current Email</label>
              <input 
                type="email" 
                [value]="profile.email" 
                disabled
                class="disabled-input"
              >
            </div>
            
            <div class="form-group full-width">
              <label>New Email</label>
              <input 
                type="email" 
                [(ngModel)]="emailData.newEmail"
                placeholder="Enter new email address"
              >
            </div>
            
            <div class="form-group full-width">
              <label>Password</label>
              <input 
                type="password" 
                [(ngModel)]="emailData.password"
                placeholder="Enter your password to confirm"
              >
            </div>
          </div>
          
          <div class="info-box">
            <span class="material-icons">info</span>
            <p>After requesting an email change, you'll receive a confirmation link at your new email address. The change will take effect after you click the link.</p>
          </div>
          
          <div class="form-actions">
            <button class="save-btn" (click)="requestEmailChange()" [disabled]="!emailData.newEmail || !emailData.password || saving">
              <span class="material-icons" *ngIf="!saving">email</span>
              <span class="spinner-small" *ngIf="saving"></span>
              {{ saving ? 'Sending...' : 'Request Email Change' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .profile-header h1 {
      margin: 0;
      font-size: 24px;
      color: #2d3748;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #e53e3e;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .logout-btn:hover {
      background: #c53030;
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

    /* Profile Card */
    .profile-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      color: white;
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 600;
      border: 3px solid white;
    }

    .profile-info h2 {
      margin: 0 0 8px 0;
      font-size: 24px;
    }

    .profile-email {
      margin: 0 0 12px 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .profile-badges {
      display: flex;
      gap: 8px;
    }

    /* Tabs */
    .profile-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      background: white;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .tab-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: none;
      background: none;
      border-radius: 8px;
      color: #718096;
      cursor: pointer;
      transition: all 0.3s;
    }

    .tab-btn:hover {
      background: #f7fafc;
      color: #4a5568;
    }

    .tab-btn.active {
      background: #667eea;
      color: white;
    }

    .tab-btn .material-icons {
      font-size: 18px;
    }

    /* Tab Content */
    .tab-content {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .tab-content h3 {
      margin: 0 0 24px 0;
      color: #2d3748;
      font-size: 18px;
    }

    /* Forms */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
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

    .disabled-input {
      background: #f7fafc;
      color: #a0aec0;
      cursor: not-allowed;
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

    /* Password Requirements */
    .password-requirements {
      background: #f7fafc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .password-requirements p {
      margin: 0 0 8px 0;
      color: #4a5568;
    }

    .password-requirements ul {
      margin: 0;
      padding-left: 20px;
    }

    .password-requirements li {
      color: #a0aec0;
      margin: 4px 0;
      transition: color 0.3s;
    }

    .password-requirements li.valid {
      color: #48bb78;
    }

    /* Info Box */
    .info-box {
      background: #ebf8ff;
      border: 1px solid #90cdf4;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 12px;
    }

    .info-box .material-icons {
      color: #3182ce;
    }

    .info-box p {
      margin: 0;
      color: #2c5282;
      font-size: 14px;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }

    .save-btn, .cancel-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
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
    .role-badge, .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
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

    /* Responsive */
    @media (max-width: 768px) {
      .profile-card {
        flex-direction: column;
        text-align: center;
      }
      
      .profile-tabs {
        flex-wrap: wrap;
      }
      
      .tab-btn {
        flex: 1 1 calc(50% - 4px);
      }
      
      .form-grid {
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
export class ProfileComponent implements OnInit {
  profile: UserProfileResponse | null = null;
  loading = true;
  error = '';
  successMessage = '';
  saving = false;
  
  activeTab: 'personal' | 'preferences' | 'security' | 'email' = 'personal';
  
  // Form data
  personalInfo: Partial<UserProfileUpdateRequest> = {};
  preferences: UserPreferencesUpdateRequest = {
    language: Language.EN,
    theme: Theme.SYSTEM,
    emailNotifications: true
  };
  passwordData: PasswordChangeRequest & { confirmPassword: string } = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  emailData: EmailUpdateRequest = {
    newEmail: '',
    password: ''
  };

  constructor(
    private profileService: ProfileService,
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.profileService.getUserProfile(userId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.resetPersonalInfo();
        this.resetPreferences();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profile';
        this.loading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  getFullName(): string {
    if (!this.profile) return '';
    const parts = [this.profile.firstName, this.profile.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  }

  getInitials(): string {
    if (!this.profile) return 'U';
    const first = this.profile.firstName ? this.profile.firstName.charAt(0) : '';
    const last = this.profile.lastName ? this.profile.lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  resetPersonalInfo(): void {
    if (!this.profile) return;
    this.personalInfo = {
      firstName: this.profile.firstName || '',
      lastName: this.profile.lastName || '',
      phoneNumber: this.profile.phoneNumber || '',
      address: this.profile.address || ''
    };
  }

  resetPreferences(): void {
    if (!this.profile) return;
    this.preferences = {
      language: this.profile.language,
      theme: this.profile.theme,
      emailNotifications: true // Default value
    };
  }

  resetPasswordForm(): void {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  updatePersonalInfo(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.updateUserProfile(userId, this.personalInfo).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.successMessage = 'Personal information updated successfully';
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to update personal information';
        this.saving = false;
        console.error('Error updating profile:', error);
      }
    });
  }

  updatePreferences(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.updateUserPreferences(userId, this.preferences).subscribe({
      next: (updatedProfile) => {
        this.profile = updatedProfile;
        this.successMessage = 'Preferences updated successfully';
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to update preferences';
        this.saving = false;
        console.error('Error updating preferences:', error);
      }
    });
  }

  isPasswordValid(): boolean {
    const pwd = this.passwordData;
    return pwd.newPassword.length >= 8 &&
           /[A-Z]/.test(pwd.newPassword) &&
           /[a-z]/.test(pwd.newPassword) &&
           /[0-9]/.test(pwd.newPassword) &&
           pwd.newPassword === pwd.confirmPassword;
  }

  changePassword(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.isPasswordValid()) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    // Create the exact PasswordChangeRequest object expected by the service
    const passwordRequest: PasswordChangeRequest = {
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword,
      confirmPassword: this.passwordData.confirmPassword
    };

    this.profileService.changePassword(userId, passwordRequest).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully';
        this.resetPasswordForm();
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.error = 'Failed to change password';
        this.saving = false;
        console.error('Error changing password:', error);
      }
    });
  }

  requestEmailChange(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.emailData.newEmail || !this.emailData.password) return;

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    this.profileService.requestEmailChange(userId, this.emailData).subscribe({
      next: () => {
        this.successMessage = 'Email change request sent. Please check your new email for confirmation.';
        this.emailData = { newEmail: '', password: '' };
        this.saving = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.error = 'Failed to request email change';
        this.saving = false;
        console.error('Error requesting email change:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}