import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatChipsModule } from '@angular/material/chips'; // AJOUTER CECI
import { MatToolbarModule } from '@angular/material/toolbar'; // AJOUTER CECI
import { MatMenuModule } from '@angular/material/menu'; // AJOUTER CECI

import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { UserProfileResponse } from '../../models/profile.model';
import { ProfileService } from '../../service/profile.service';
import { ErrorHandlerService } from '../../service/error handler.service';
import { Language, Theme } from '../../models/enums.model';
import { STRONG_PASSWORD_PATTERN } from '../../models/email pwd.model';

function pwdMatch(c: AbstractControl) {
  return c.get('newPassword')?.value === c.get('confirmPassword')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTooltipModule,
    MatChipsModule,      // ← AJOUTÉ
    MatToolbarModule,    // ← AJOUTÉ
    MatMenuModule   
  ],
  template: `
<div class="profile-container">
  <!-- Top App Bar -->
  <mat-toolbar color="primary" class="app-bar">
    <div class="toolbar-left">
      <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
      <span class="app-title">FlowManage</span>
    </div>
    
    <div class="toolbar-right">
      <button *ngIf="isAdmin" mat-stroked-button routerLink="/admin" class="admin-btn">
        <mat-icon>dashboard</mat-icon>
        Admin Dashboard
      </button>
      
      <div class="user-menu" *ngIf="profile">
        <div class="user-avatar" [matTooltip]="profile.email">
          {{ initials }}
        </div>
        <span class="user-name">{{ profile.firstName || profile.email }}</span>
      </div>
      
      <button mat-icon-button [matMenuTriggerFor]="menu" class="more-btn">
        <mat-icon>more_vert</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>Sign out</span>
        </button>
      </mat-menu>
    </div>
  </mat-toolbar>

  <!-- Main Content -->
  <div class="profile-content" *ngIf="profile; else loadingBlock">
    <!-- Profile Sidebar -->
    <mat-card class="profile-sidebar" appearance="outlined">
      <div class="sidebar-header">
        <div class="profile-avatar-large">{{ initials }}</div>
        <h2 class="profile-name">{{ profile.firstName }} {{ profile.lastName }}</h2>
        <div class="profile-email">{{ profile.email }}</div>
        
        <div class="badge-container">
          <mat-chip-set>
            <mat-chip [class]="'role-chip ' + profile.role.toLowerCase()" [disableRipple]="true">
              {{ profile.role }}
            </mat-chip>
            <mat-chip [class]="'status-chip ' + profile.status.toLowerCase()" [disableRipple]="true">
              {{ profile.status }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </div>
      
      <mat-divider></mat-divider>
      
      <!-- Navigation Tabs (vertical) -->
      <nav class="profile-nav">
        <button mat-button 
                [class.active]="tab === 'info'" 
                (click)="tab='info'"
                class="nav-button">
          <mat-icon>person</mat-icon>
          Personal info
        </button>
        <button mat-button 
                [class.active]="tab === 'prefs'" 
                (click)="tab='prefs'"
                class="nav-button">
          <mat-icon>settings</mat-icon>
          Preferences
        </button>
        <button mat-button 
                [class.active]="tab === 'password'" 
                (click)="tab='password'"
                class="nav-button">
          <mat-icon>lock</mat-icon>
          Password
        </button>
        <button mat-button 
                [class.active]="tab === 'email'" 
                (click)="tab='email'"
                class="nav-button">
          <mat-icon>email</mat-icon>
          Change email
        </button>
      </nav>
    </mat-card>

    <!-- Main Panel -->
    <mat-card class="profile-main" appearance="outlined">
      <!-- Personal Info Tab -->
      <div *ngIf="tab === 'info'" class="tab-panel">
        <h2 class="tab-title">Personal information</h2>
        <p class="tab-description">Update your personal details</p>
        
        <form [formGroup]="infoForm" (ngSubmit)="saveInfo()" class="profile-form">
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>First name</mat-label>
              <input matInput formControlName="firstName" placeholder="John">
              <mat-icon matSuffix>badge</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Last name</mat-label>
              <input matInput formControlName="lastName" placeholder="Doe">
              <mat-icon matSuffix>badge</mat-icon>
            </mat-form-field>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Phone number</mat-label>
            <span matTextPrefix>+237 &nbsp;</span>
            <input matInput formControlName="phoneNumber" placeholder="698 520 147">
            <mat-icon matSuffix>phone</mat-icon>
            <mat-hint>Cameroonian format: +237 6XX XXX XXX</mat-hint>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <input matInput formControlName="address" placeholder="Your address">
            <mat-icon matSuffix>home</mat-icon>
          </mat-form-field>
          
          <!-- Alerts -->
          <div *ngIf="infoError" class="alert error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ infoError }}</span>
          </div>
          
          <div *ngIf="infoSuccess" class="alert success-alert">
            <mat-icon>check_circle</mat-icon>
            <span>Profile updated successfully.</span>
          </div>
          
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="savingInfo || infoForm.pristine">
              <mat-spinner diameter="20" *ngIf="savingInfo" class="button-spinner"></mat-spinner>
              <span>{{ savingInfo ? 'Saving...' : 'Save changes' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Preferences Tab -->
      <div *ngIf="tab === 'prefs'" class="tab-panel">
        <h2 class="tab-title">Preferences</h2>
        <p class="tab-description">Customize your experience</p>
        
        <form [formGroup]="prefsForm" (ngSubmit)="savePrefs()" class="profile-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Language</mat-label>
            <mat-select formControlName="language">
              <mat-option *ngFor="let lang of languages" [value]="lang.value">
                <span class="language-option">{{ lang.flag }} {{ lang.label }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Theme</mat-label>
            <mat-select formControlName="theme">
              <mat-option *ngFor="let theme of themes" [value]="theme.value">
                <span class="theme-option">{{ theme.icon }} {{ theme.label }}</span>
              </mat-option>
            </mat-select>
          </mat-form-field>
          
          <div class="toggle-container">
            <div class="toggle-info">
              <div class="toggle-label">Email notifications</div>
              <div class="toggle-hint">Receive account and system notifications</div>
            </div>
            <mat-slide-toggle formControlName="emailNotifications" color="primary">
              {{ prefsForm.get('emailNotifications')?.value ? 'On' : 'Off' }}
            </mat-slide-toggle>
          </div>
          
          <!-- Alerts -->
          <div *ngIf="prefsError" class="alert error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ prefsError }}</span>
          </div>
          
          <div *ngIf="prefsSuccess" class="alert success-alert">
            <mat-icon>check_circle</mat-icon>
            <span>Preferences saved.</span>
          </div>
          
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="savingPrefs || prefsForm.pristine">
              <mat-spinner diameter="20" *ngIf="savingPrefs" class="button-spinner"></mat-spinner>
              <span>{{ savingPrefs ? 'Saving...' : 'Save preferences' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Password Tab -->
      <div *ngIf="tab === 'password'" class="tab-panel">
        <h2 class="tab-title">Change password</h2>
        <p class="tab-description">
          Your new password must include uppercase, lowercase, a number, and a special character.
        </p>
        
        <form [formGroup]="pwdForm" (ngSubmit)="savePassword()" class="profile-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Current password</mat-label>
            <input matInput [type]="hideCurrent ? 'password' : 'text'" formControlName="currentPassword">
            <button mat-icon-button matSuffix type="button" (click)="hideCurrent = !hideCurrent">
              <mat-icon>{{ hideCurrent ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="pwdForm.get('currentPassword')?.touched && pwdForm.get('currentPassword')?.hasError('required')">
              Current password is required
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New password</mat-label>
            <input matInput [type]="hideNew ? 'password' : 'text'" formControlName="newPassword" placeholder="Min. 8 characters">
            <button mat-icon-button matSuffix type="button" (click)="hideNew = !hideNew">
              <mat-icon>{{ hideNew ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="pwdForm.get('newPassword')?.touched && pwdForm.get('newPassword')?.hasError('pattern')">
              Must contain uppercase, lowercase, number, and special character
            </mat-error>
          </mat-form-field>
          
          <!-- Password Strength -->
          <div class="password-strength" *ngIf="pwdForm.get('newPassword')?.value">
            <div class="strength-bar">
              <div class="strength-fill" 
                   [style.width.%]="getPasswordStrength()"
                   [class.weak]="getPasswordStrength() < 40"
                   [class.medium]="getPasswordStrength() >= 40 && getPasswordStrength() < 70"
                   [class.strong]="getPasswordStrength() >= 70">
              </div>
            </div>
            <span class="strength-label">{{ getPasswordStrengthText() }}</span>
          </div>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Confirm new password</mat-label>
            <input matInput [type]="hideConfirm ? 'password' : 'text'" formControlName="confirmPassword">
            <button mat-icon-button matSuffix type="button" (click)="hideConfirm = !hideConfirm">
              <mat-icon>{{ hideConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-error *ngIf="pwdForm.hasError('mismatch') && pwdForm.get('confirmPassword')?.touched">
              Passwords do not match
            </mat-error>
          </mat-form-field>
          
          <!-- Requirements Checklist -->
          <mat-card class="requirements-card" appearance="outlined">
            <div class="requirement" [class.valid]="hasMinLength">
              <mat-icon class="req-icon">{{ hasMinLength ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>At least 8 characters</span>
            </div>
            <div class="requirement" [class.valid]="hasUpperCase">
              <mat-icon class="req-icon">{{ hasUpperCase ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Uppercase letter</span>
            </div>
            <div class="requirement" [class.valid]="hasLowerCase">
              <mat-icon class="req-icon">{{ hasLowerCase ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Lowercase letter</span>
            </div>
            <div class="requirement" [class.valid]="hasNumber">
              <mat-icon class="req-icon">{{ hasNumber ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Number</span>
            </div>
            <div class="requirement" [class.valid]="hasSpecialChar">
              <mat-icon class="req-icon">{{ hasSpecialChar ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Special character (@#$%^&+=)</span>
            </div>
          </mat-card>
          
          <!-- Alerts -->
          <div *ngIf="pwdError" class="alert error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ pwdError }}</span>
          </div>
          
          <div *ngIf="pwdSuccess" class="alert success-alert">
            <mat-icon>check_circle</mat-icon>
            <span>Password changed successfully.</span>
          </div>
          
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="savingPwd || pwdForm.invalid || pwdForm.pristine">
              <mat-spinner diameter="20" *ngIf="savingPwd" class="button-spinner"></mat-spinner>
              <span>{{ savingPwd ? 'Updating...' : 'Change password' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Email Change Tab -->
      <div *ngIf="tab === 'email'" class="tab-panel">
        <h2 class="tab-title">Change email address</h2>
        <p class="tab-description">
          A confirmation link will be sent to your <strong>new email address</strong>. 
          You must click it to complete the change.
        </p>
        
        <form [formGroup]="emailForm" (ngSubmit)="requestEmailChange()" class="profile-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New email address</mat-label>
            <input matInput type="email" formControlName="newEmail" placeholder="new@example.com">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="emailForm.get('newEmail')?.touched && emailForm.get('newEmail')?.hasError('required')">
              Email is required
            </mat-error>
            <mat-error *ngIf="emailForm.get('newEmail')?.touched && emailForm.get('newEmail')?.hasError('email')">
              Enter a valid email address
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Current password</mat-label>
            <input matInput [type]="hideEmailPwd ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix type="button" (click)="hideEmailPwd = !hideEmailPwd">
              <mat-icon>{{ hideEmailPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
            <mat-hint>Required to confirm your identity</mat-hint>
            <mat-error *ngIf="emailForm.get('password')?.touched && emailForm.get('password')?.hasError('required')">
              Password is required
            </mat-error>
          </mat-form-field>
          
          <!-- Alerts -->
          <div *ngIf="emailError" class="alert error-alert">
            <mat-icon>error</mat-icon>
            <span>{{ emailError }}</span>
          </div>
          
          <div *ngIf="emailSent" class="alert success-alert">
            <mat-icon>mark_email_read</mat-icon>
            <span>Confirmation email sent to <strong>{{ emailForm.value.newEmail }}</strong>. Check your inbox!</span>
          </div>
          
          <div class="form-actions">
            <button mat-flat-button color="primary" type="submit" 
                    [disabled]="sendingEmail || emailSent || emailForm.invalid || emailForm.pristine">
              <mat-spinner diameter="20" *ngIf="sendingEmail" class="button-spinner"></mat-spinner>
              <span>{{ sendingEmail ? 'Sending...' : emailSent ? 'Email sent ✓' : 'Send confirmation email' }}</span>
            </button>
          </div>
        </form>
      </div>
    </mat-card>
  </div>

  <!-- Loading State -->
  <ng-template #loadingBlock>
    <div class="loading-container">
      <mat-spinner diameter="48" color="primary"></mat-spinner>
      <p>Loading profile...</p>
    </div>
  </ng-template>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --success-color: #4caf50;
      --error-color: #f44336;
      --warning-color: #ff9800;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
      --weak-color: #f44336;
      --medium-color: #ff9800;
      --strong-color: #4caf50;
    }

    .profile-container {
      min-height: 100vh;
      background: var(--bg-light);
    }

    /* App Bar */
    .app-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white !important;
      color: var(--text-primary) !important;
      border-bottom: 1px solid #e0e0e0;
    }

    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo-icon {
      color: var(--primary-color);
      margin-right: 4px;
    }

    .app-title {
      font-size: 18px;
      font-weight: 600;
    }

    .admin-btn {
      border-color: var(--primary-color) !important;
      color: var(--primary-color) !important;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      font-weight: 500;
    }

    .more-btn {
      color: var(--text-secondary);
    }

    /* Main Content */
    .profile-content {
      max-width: 1200px;
      margin: 32px auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
    }

    /* Sidebar */
    .profile-sidebar {
      padding: 24px;
      height: fit-content;
      border-radius: 16px !important;
      background: white;
    }

    .sidebar-header {
      text-align: center;
      margin-bottom: 20px;
    }

    .profile-avatar-large {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary-color), #7986cb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 600;
      margin: 0 auto 16px;
    }

    .profile-name {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .profile-email {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 12px;
    }

    .badge-container {
      display: flex;
      justify-content: center;
    }

    .role-chip, .status-chip {
      min-height: 24px;
      font-size: 12px;
    }

    .role-chip.admin { background: #ff9800 !important; color: white !important; }
    .role-chip.user { background: #2196f3 !important; color: white !important; }
    .role-chip.moderator { background: #9c27b0 !important; color: white !important; }
    
    .status-chip.active { background: #4caf50 !important; color: white !important; }
    .status-chip.inactive { background: #9e9e9e !important; color: white !important; }
    .status-chip.pending { background: #ff9800 !important; color: white !important; }
    .status-chip.blocked { background: #f44336 !important; color: white !important; }
    .status-chip.suspended { background: #ff5722 !important; color: white !important; }

    .profile-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 16px;
    }

    .nav-button {
      justify-content: flex-start !important;
      text-align: left;
      color: var(--text-secondary);
      border-radius: 8px !important;
      padding: 8px 16px !important;
    }

    .nav-button.active {
      background: #e8eaf6;
      color: var(--primary-color);
    }

    .nav-button mat-icon {
      margin-right: 12px;
    }

    /* Main Panel */
    .profile-main {
      padding: 32px;
      border-radius: 16px !important;
      background: white;
    }

    .tab-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .tab-description {
      color: var(--text-secondary);
      font-size: 14px;
      margin-bottom: 24px;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    /* Toggle Container */
    .toggle-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 8px 0;
    }

    .toggle-info {
      flex: 1;
    }

    .toggle-label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .toggle-hint {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
    }

    .error-alert {
      background: #ffebee;
      color: #c62828;
    }

    .success-alert {
      background: #e8f5e9;
      color: #2e7d32;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* Password Strength */
    .password-strength {
      margin-top: -8px;
      margin-bottom: 8px;
    }

    .strength-bar {
      height: 4px;
      background: #e0e0e0;
      border-radius: 2px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .strength-fill.weak { background: var(--weak-color); }
    .strength-fill.medium { background: var(--medium-color); }
    .strength-fill.strong { background: var(--strong-color); }

    .strength-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    /* Requirements Card */
    .requirements-card {
      padding: 16px;
      background: #f8f9fa;
      border: none !important;
    }

    .requirement {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .requirement.valid {
      color: var(--success-color);
    }

    .req-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Language Options */
    .language-option, .theme-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Loading State */
    .loading-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: var(--text-secondary);
    }

    /* Material Overrides */
    ::ng-deep .mat-mdc-form-field-flex {
      height: 56px !important;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }

    ::ng-deep .mdc-button {
      letter-spacing: 0 !important;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .user-name {
        display: none;
      }

      .admin-btn span {
        display: none;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  profile: UserProfileResponse | null = null;
  userId = 0;
  isAdmin = false;
  initials = '';
  tab: 'info' | 'prefs' | 'password' | 'email' = 'info';

  // Forms
  infoForm: FormGroup;
  prefsForm: FormGroup;
  pwdForm: FormGroup;
  emailForm: FormGroup;

  // States
  savingInfo = false; infoError = ''; infoSuccess = false;
  savingPrefs = false; prefsError = ''; prefsSuccess = false;
  savingPwd = false; pwdError = ''; pwdSuccess = false;
  sendingEmail = false; emailError = ''; emailSent = false;

  // Password visibility
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;
  hideEmailPwd = true;

  // Data
  languages = [
    { value: Language.FR, label: 'Français', flag: '🇫🇷' },
    { value: Language.EN, label: 'English', flag: '🇬🇧' },
    { value: Language.ES, label: 'Español', flag: '🇪🇸' },
    { value: Language.DE, label: 'Deutsch', flag: '🇩🇪' },
    { value: Language.IT, label: 'Italiano', flag: '🇮🇹' }
  ];

  themes = [
    { value: Theme.LIGHT, label: 'Light', icon: '☀️' },
    { value: Theme.DARK, label: 'Dark', icon: '🌙' },
    { value: Theme.SYSTEM, label: 'System default', icon: '🖥' }
  ];

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private tokenService: TokenService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.infoForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      phoneNumber: [''],
      address: ['']
    });

    this.prefsForm = this.fb.group({
      language: [Language.FR],
      theme: [Theme.LIGHT],
      emailNotifications: [true]
    });

    this.pwdForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(STRONG_PASSWORD_PATTERN)]],
      confirmPassword: ['', Validators.required]
    }, { validators: pwdMatch });

    this.emailForm = this.fb.group({
      newEmail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.userId = this.tokenService.getCurrentUserId()!;
    this.isAdmin = this.tokenService.isAdmin();
    
    this.profileService.getUserProfile(this.userId).subscribe({
      next: (p) => {
        this.profile = p;
        this.initials = ((p.firstName?.charAt(0) ?? '') + (p.lastName?.charAt(0) ?? '') || p.email.charAt(0)).toUpperCase();
        this.infoForm.patchValue({ 
          firstName: p.firstName, 
          lastName: p.lastName, 
          phoneNumber: p.phoneNumber, 
          address: p.address 
        });
        this.prefsForm.patchValue({ 
          language: p.language, 
          theme: p.theme, 
          emailNotifications: p.emailNotifications 
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to load profile', 'Close', { duration: 5000 });
      }
    });
  }

  // Password validation getters
  get hasMinLength(): boolean {
    return this.pwdForm.get('newPassword')?.value?.length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.pwdForm.get('newPassword')?.value);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.pwdForm.get('newPassword')?.value);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.pwdForm.get('newPassword')?.value);
  }

  get hasSpecialChar(): boolean {
    return /[@#$%^&+=]/.test(this.pwdForm.get('newPassword')?.value);
  }

  getPasswordStrength(): number {
    const pwd = this.pwdForm.get('newPassword')?.value || '';
    let strength = 0;
    
    if (pwd.length >= 8) strength += 20;
    if (pwd.length >= 10) strength += 10;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 20;
    if (/[@#$%^&+=]/.test(pwd)) strength += 20;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }

  saveInfo(): void {
    this.savingInfo = true;
    this.infoError = '';
    this.infoSuccess = false;

    this.profileService.updateUserProfile(this.userId, this.infoForm.value).subscribe({
      next: (p) => {
        this.profile = p;
        this.infoSuccess = true;
        this.savingInfo = false;
        this.infoForm.markAsPristine();
        
        this.snackBar.open('Profile updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => this.infoSuccess = false, 4000);
      },
      error: (e: HttpErrorResponse) => {
        this.infoError = this.errorHandler.handle(e).userMessage;
        this.savingInfo = false;
      }
    });
  }

  savePrefs(): void {
    this.savingPrefs = true;
    this.prefsError = '';
    this.prefsSuccess = false;

    this.profileService.updateUserPreferences(this.userId, this.prefsForm.value).subscribe({
      next: (p) => {
        this.profile = p;
        this.prefsSuccess = true;
        this.savingPrefs = false;
        this.prefsForm.markAsPristine();
        
        this.snackBar.open('Preferences saved', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => this.prefsSuccess = false, 4000);
      },
      error: (e: HttpErrorResponse) => {
        this.prefsError = this.errorHandler.handle(e).userMessage;
        this.savingPrefs = false;
      }
    });
  }

  savePassword(): void {
    if (this.pwdForm.invalid) { 
      this.pwdForm.markAllAsTouched(); 
      return; 
    }

    this.savingPwd = true;
    this.pwdError = '';
    this.pwdSuccess = false;

    const { currentPassword, newPassword, confirmPassword } = this.pwdForm.value;
    
    this.profileService.changePassword(this.userId, { currentPassword, newPassword, confirmPassword }).subscribe({
      next: () => {
        this.pwdSuccess = true;
        this.savingPwd = false;
        this.pwdForm.reset();
        
        this.snackBar.open('Password changed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        setTimeout(() => this.pwdSuccess = false, 5000);
      },
      error: (e: HttpErrorResponse) => {
        this.pwdError = this.errorHandler.handle(e).userMessage;
        this.savingPwd = false;
      }
    });
  }

  requestEmailChange(): void {
    if (this.emailForm.invalid) { 
      this.emailForm.markAllAsTouched(); 
      return; 
    }

    this.sendingEmail = true;
    this.emailError = '';
    this.emailSent = false;

    const { newEmail, password } = this.emailForm.value;
    
    this.profileService.requestEmailChange(this.userId, { newEmail, password }).subscribe({
      next: () => {
        this.emailSent = true;
        this.sendingEmail = false;
        this.emailForm.markAsPristine();
        
        this.snackBar.open(`Confirmation email sent to ${newEmail}`, 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      },
      error: (e: HttpErrorResponse) => {
        this.emailError = this.errorHandler.handle(e).userMessage;
        this.sendingEmail = false;
      }
    });
  }

  logout(): void { 
    this.authService.logout(); 
  }
}