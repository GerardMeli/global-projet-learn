import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Language } from '../../models/enums.model';
import { AuthService } from '../../service/auth.service';
import { ErrorHandlerService } from '../../service/error handler.service';

// Custom validator for Cameroonian phone number
export function cameroonPhoneValidator(control: AbstractControl): ValidationErrors | null {
  const phoneRegex = /^\+237\s6\d{2}\s\d{3}\s\d{3}$/;
  if (!control.value) {
    return null; // Optional field
  }
  return phoneRegex.test(control.value) ? null : { invalidCameroonPhone: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    // Material Modules
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
<div class="register-container" *ngIf="!registered; else successBlock">
  <!-- Left Panel - Registration Form -->
  <div class="register-form-panel">
    <mat-card class="register-card" appearance="outlined">
      <!-- Brand -->
      <div class="brand">
        <mat-icon class="brand-icon" aria-hidden="false" aria-label="Logo">admin_panel_settings</mat-icon>
        <span class="brand-name">FlowManage</span>
      </div>

      <!-- Header -->
      <div class="form-header">
        <h1 class="form-title">Create account</h1>
        <p class="form-subtitle">Join the platform in seconds</p>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="alert error-alert">
        <mat-icon class="alert-icon">error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Registration Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="register-form">
        <!-- Name Row -->
        <div class="form-row">
          <!-- First Name -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>First name</mat-label>
            <input 
              matInput 
              type="text" 
              formControlName="firstName"
              placeholder="Marie"
            />
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <!-- Last Name -->
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Last name</mat-label>
            <input 
              matInput 
              type="text" 
              formControlName="lastName"
              placeholder="Dupont"
            />
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>
        </div>

        <!-- Email -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email address</mat-label>
          <input 
            matInput 
            type="email" 
            formControlName="email"
            placeholder="marie@example.com"
            autocomplete="email"
          />
          <mat-icon matSuffix>email</mat-icon>
          <mat-error *ngIf="f['email'].touched && f['email'].hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="f['email'].touched && f['email'].hasError('email')">
            Please enter a valid email address
          </mat-error>
        </mat-form-field>

        <!-- Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input 
            matInput 
            [type]="hidePassword ? 'password' : 'text'" 
            formControlName="password"
            placeholder="At least 6 characters"
            autocomplete="new-password"
          />
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="'Hide password'"
          >
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="f['password'].touched && f['password'].hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="f['password'].touched && f['password'].hasError('minlength')">
            Password must be at least 6 characters
          </mat-error>
        </mat-form-field>

        <!-- Password Strength Indicator -->
        <div class="password-strength" *ngIf="f['password'].value">
          <div class="strength-bar">
            <div 
              class="strength-fill" 
              [style.width.%]="getPasswordStrength()"
              [class.weak]="getPasswordStrength() < 40"
              [class.medium]="getPasswordStrength() >= 40 && getPasswordStrength() < 70"
              [class.strong]="getPasswordStrength() >= 70"
            ></div>
          </div>
          <span class="strength-label" [class.weak]="getPasswordStrength() < 40"
                [class.medium]="getPasswordStrength() >= 40 && getPasswordStrength() < 70"
                [class.strong]="getPasswordStrength() >= 70">
            {{ getPasswordStrengthText() }}
          </span>
        </div>

        <!-- Phone Number (with Cameroon format) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone number</mat-label>
          <span matTextPrefix class="phone-prefix">🇨🇲&nbsp;</span>
          <input 
            matInput 
            type="tel" 
            formControlName="phoneNumber"
            placeholder="+237 698 520 147"
            autocomplete="tel"
          />
          <mat-icon matSuffix>phone</mat-icon>
          <mat-hint>Format: +237 6XX XXX XXX (Cameroon)</mat-hint>
          <mat-error *ngIf="f['phoneNumber'].touched && f['phoneNumber'].hasError('invalidCameroonPhone')">
            Invalid Cameroonian phone number format. Example: +237 698 520 147
          </mat-error>
        </mat-form-field>

        <!-- Phone Format Helper -->
        <div class="phone-helper" *ngIf="f['phoneNumber'].value && !f['phoneNumber'].hasError('invalidCameroonPhone')">
          <div class="helper-item" [class.valid]="phoneHasPlus237">
            <mat-icon class="helper-icon">{{ phoneHasPlus237 ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>Starts with +237</span>
          </div>
          <div class="helper-item" [class.valid]="phoneHasSpace">
            <mat-icon class="helper-icon">{{ phoneHasSpace ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>Space after +237</span>
          </div>
          <div class="helper-item" [class.valid]="phoneHas6">
            <mat-icon class="helper-icon">{{ phoneHas6 ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>Starts with 6 after code</span>
          </div>
          <div class="helper-item" [class.valid]="phoneHasCorrectLength">
            <mat-icon class="helper-icon">{{ phoneHasCorrectLength ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
            <span>9 digits total (6XX XXX XXX)</span>
          </div>
        </div>

        <!-- Language Selection -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Preferred language</mat-label>
          <mat-select formControlName="language">
            <mat-option [value]="Language.FR">
              <span class="language-option">🇫🇷 Français</span>
            </mat-option>
            <mat-option [value]="Language.EN">
              <span class="language-option">🇬🇧 English</span>
            </mat-option>
            <mat-option [value]="Language.ES">
              <span class="language-option">🇪🇸 Español</span>
            </mat-option>
            <mat-option [value]="Language.DE">
              <span class="language-option">🇩🇪 Deutsch</span>
            </mat-option>
            <mat-option [value]="Language.IT">
              <span class="language-option">🇮🇹 Italiano</span>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>language</mat-icon>
        </mat-form-field>

        <!-- Submit Button -->
        <button 
          mat-flat-button 
          color="primary" 
          type="submit" 
          class="submit-button"
          [disabled]="loading || form.invalid"
        >
          <mat-icon *ngIf="!loading" class="button-icon">person_add</mat-icon>
          <mat-spinner diameter="20" *ngIf="loading" class="button-spinner"></mat-spinner>
          <span>{{ loading ? 'Creating account...' : 'Create account' }}</span>
        </button>

        <!-- Login Link -->
        <div class="login-section">
          <mat-divider></mat-divider>
          <p class="login-text">
            Already have an account?
            <a routerLink="/auth/login" class="login-link" color="primary">
              Sign in
            </a>
          </p>
        </div>
      </form>
    </mat-card>

    <!-- Footer -->
    <div class="footer">
      <p>© 2024 FlowManage. All rights reserved.</p>
    </div>
  </div>

  <!-- Right Panel - Features Showcase -->
  <div class="features-panel">
    <div class="features-content">
      <h2 class="features-title">
        Start managing<br/>
        <span class="highlight">smarter today</span>
      </h2>
      
      <div class="feature-cards">
        <!-- Feature 1 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">security</mat-icon>
          <div class="feature-text">
            <h3>Role-based access control</h3>
            <p>Granular permissions for your team</p>
          </div>
        </mat-card>

        <!-- Feature 2 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">insights</mat-icon>
          <div class="feature-text">
            <h3>Real-time user statistics</h3>
            <p>Monitor activity and engagement</p>
          </div>
        </mat-card>

        <!-- Feature 3 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">notifications</mat-icon>
          <div class="feature-text">
            <h3>Email notifications</h3>
            <p>Automated alerts and updates</p>
          </div>
        </mat-card>

        <!-- Feature 4 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">language</mat-icon>
          <div class="feature-text">
            <h3>Multi-language support</h3>
            <p>5+ languages available</p>
          </div>
        </mat-card>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">10k+</span>
          <span class="stat-label">Active Users</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">99.9%</span>
          <span class="stat-label">Uptime</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">24/7</span>
          <span class="stat-label">Support</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Success State -->
<ng-template #successBlock>
  <div class="success-container">
    <mat-card class="success-card" appearance="outlined">
      <div class="icon-wrapper success">
        <mat-icon class="success-icon">mark_email_read</mat-icon>
      </div>
      
      <h2 class="success-title">Check your inbox</h2>
      
      <p class="success-message">
        We sent a verification email to <strong>{{ registeredEmail }}</strong>.
      </p>
      
      <div class="success-details">
        <mat-icon class="details-icon">schedule</mat-icon>
        <span>Click the link in the email to activate your account. The link expires in <strong>24 hours</strong>.</span>
      </div>
      
      <div class="success-actions">
        <button 
          mat-stroked-button 
          color="primary" 
          (click)="goToResend()"
          class="action-button secondary"
        >
          <mat-icon>refresh</mat-icon>
          Resend email
        </button>
        
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/login"
          class="action-button"
        >
          <mat-icon>login</mat-icon>
          Go to Sign In
        </button>
      </div>
    </mat-card>
  </div>
</ng-template>
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --primary-light: #e8eaf6;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
      --success-color: #4caf50;
      --error-color: #f44336;
      --warning-color: #ff9800;
      --weak-color: #f44336;
      --medium-color: #ff9800;
      --strong-color: #4caf50;
    }

    /* Container */
    .register-container {
      min-height: 100vh;
      display: flex;
      background: var(--bg-light);
    }

    /* Left Panel - Form */
    .register-form-panel {
      flex: 1;
      max-width: 560px;
      padding: 32px;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
    }

    .register-card {
      padding: 40px 32px;
      border-radius: 20px !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }

    .brand-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--primary-color);
    }

    .brand-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    /* Form Header */
    .form-header {
      margin-bottom: 28px;
    }

    .form-title {
      font-size: 32px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .form-subtitle {
      font-size: 15px;
      color: var(--text-secondary);
      margin: 0;
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

    .alert-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    /* Form */
    .register-form {
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

    .half-width {
      width: 100%;
    }

    /* Phone Input */
    .phone-prefix {
      color: var(--text-secondary);
      font-size: 14px;
      margin-right: 4px;
    }

    /* Phone Helper */
    .phone-helper {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 12px;
      margin-top: -8px;
      margin-bottom: 8px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .helper-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .helper-item.valid {
      color: var(--success-color);
    }

    .helper-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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
      margin-bottom: 4px;
    }

    .strength-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .strength-fill.weak {
      background: var(--weak-color);
    }

    .strength-fill.medium {
      background: var(--medium-color);
    }

    .strength-fill.strong {
      background: var(--strong-color);
    }

    .strength-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    .strength-label.weak {
      color: var(--weak-color);
    }

    .strength-label.medium {
      color: var(--medium-color);
    }

    .strength-label.strong {
      color: var(--strong-color);
    }

    /* Language Option */
    .language-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Submit Button */
    .submit-button {
      height: 52px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px !important;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-icon, .button-spinner {
      margin-right: 4px;
    }

    /* Login Section */
    .login-section {
      margin-top: 16px;
    }

    .login-text {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 20px;
    }

    .login-link {
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .login-link:hover {
      text-decoration: underline;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: auto;
      padding-top: 32px;
      color: var(--text-secondary);
      font-size: 12px;
    }

    /* Right Panel - Features */
    .features-panel {
      flex: 1;
      background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }

    .features-panel::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .features-content {
      position: relative;
      z-index: 1;
      max-width: 480px;
      width: 100%;
    }

    .features-title {
      font-size: 40px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
      margin-bottom: 40px;
    }

    .highlight {
      color: #ffd54f;
      display: block;
    }

    /* Feature Cards */
    .feature-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      padding: 20px;
      border-radius: 12px !important;
      transition: transform 0.2s ease, background 0.2s ease;
    }

    .feature-card:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-bottom: 16px;
      color: #ffd54f !important;
    }

    .feature-text h3 {
      color: white;
      font-size: 15px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .feature-text p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      margin: 0;
      line-height: 1.5;
    }

    /* Stats */
    .stats-row {
      display: flex;
      justify-content: space-between;
      padding: 24px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 600;
      color: white;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Success State */
    .success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      padding: 24px;
    }

    .success-card {
      max-width: 500px;
      width: 100%;
      padding: 56px 48px;
      border-radius: 28px !important;
      background: white;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
    }

    .icon-wrapper {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .success-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--success-color);
    }

    .success-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 12px 0;
    }

    .success-message {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .success-details {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 28px;
      text-align: left;
      font-size: 14px;
      color: var(--text-secondary);
    }

    .details-icon {
      color: var(--primary-color);
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 24px;
      height: 48px;
      font-size: 15px;
      border-radius: 24px !important;
    }

    .action-button.secondary {
      background: transparent;
      border: 1px solid var(--primary-color);
    }

    /* Material Overrides */
    ::ng-deep .mat-mdc-form-field-flex {
      height: 56px !important;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }

    ::ng-deep .mat-mdc-form-field-hint-wrapper {
      padding: 0 !important;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .register-form-panel {
        max-width: 480px;
        padding: 24px;
      }

      .features-title {
        font-size: 36px;
      }
    }

    @media (max-width: 768px) {
      .register-container {
        flex-direction: column;
      }

      .register-form-panel {
        max-width: 100%;
        padding: 20px;
      }

      .register-card {
        padding: 32px 24px;
      }

      .features-panel {
        display: none;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .phone-helper {
        grid-template-columns: 1fr;
      }

      .success-actions {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  registered = false;
  registeredEmail = '';
  errorMessage = '';
  hidePassword = true;
  Language = Language;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      phoneNumber: ['', cameroonPhoneValidator],
      language: [Language.FR]
    });
  }

  get f() { return this.form.controls; }

  // Phone validation helpers
  get phoneHasPlus237(): boolean {
    return this.f['phoneNumber'].value?.startsWith('+237');
  }

  get phoneHasSpace(): boolean {
    const val = this.f['phoneNumber'].value;
    return val && val.length > 4 && val[4] === ' ';
  }

  get phoneHas6(): boolean {
    const val = this.f['phoneNumber'].value;
    return val && val.length > 5 && val[5] === '6';
  }

  get phoneHasCorrectLength(): boolean {
    const val = this.f['phoneNumber'].value;
    return val && val.replace(/\s/g, '').length === 12; // +237 + 9 digits
  }

  // Password strength
  getPasswordStrength(): number {
    const pwd = this.f['password'].value || '';
    let strength = 0;
    
    if (pwd.length >= 6) strength += 30;
    if (pwd.length >= 8) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 10;
    if (/[@#$%^&+=]/.test(pwd)) strength += 10;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      
      // Show snackbar with validation errors
      if (this.f['phoneNumber'].hasError('invalidCameroonPhone')) {
        this.snackBar.open('Please enter a valid Cameroonian phone number', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
      
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: (response) => {
        this.registeredEmail = response.email;
        this.registered = true;
        this.loading = false;
        
        this.snackBar.open('Account created! Check your email for verification.', 'Close', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorMessage = handled.userMessage;
        this.loading = false;
      }
    });
  }

  goToResend(): void {
    this.router.navigate(['/auth/resend-verification'], {
      queryParams: { email: this.registeredEmail }
    });
  }
}