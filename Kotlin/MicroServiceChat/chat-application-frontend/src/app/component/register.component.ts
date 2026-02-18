import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Language } from '../models/enums.model';
import { AuthService } from '../service/auth.service';
import { ErrorHandlerService } from '../service/error handler.service';

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
    MatDividerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
<div class="register-container" *ngIf="!registered; else successBlock">
  <!-- Left Panel - Registration Form -->
  <div class="register-form-panel">
    <mat-card class="register-card" appearance="outlined">
      <!-- Brand -->
      <div class="brand">
        <mat-icon class="brand-icon" color="primary">admin_panel_settings</mat-icon>
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

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="register-form">
        <!-- Name Row -->
        <div class="name-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>First name</mat-label>
            <input matInput formControlName="firstName" placeholder="Meli" />
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Last name</mat-label>
            <input matInput formControlName="lastName" placeholder="Gerard" />
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
            placeholder="name@company.com"
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

        <!-- Phone -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Phone number</mat-label>
          <input 
            matInput 
            type="tel" 
            formControlName="phoneNumber" 
            placeholder="+2376xxxx"
          />
          <mat-icon matSuffix>phone</mat-icon>
          <mat-hint>Optional</mat-hint>
        </mat-form-field>

        <!-- Language -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Preferred language</mat-label>
          <mat-select formControlName="language">
            <mat-option value="FR">Français</mat-option>
            <mat-option value="EN">English</mat-option>
            <mat-option value="ES">Español</mat-option>
            <mat-option value="DE">Deutsch</mat-option>
            <mat-option value="IT">Italiano</mat-option>
          </mat-select>
          <mat-icon matSuffix>language</mat-icon>
        </mat-form-field>

        <!-- Submit Button -->
        <button 
          mat-flat-button 
          color="primary" 
          type="submit" 
          class="submit-button"
          [disabled]="loading"
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
            <a routerLink="/auth/login" class="login-link">Sign in</a>
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
            <h3>Role-based access</h3>
            <p>Granular permissions for your team</p>
          </div>
        </mat-card>

        <!-- Feature 2 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">insights</mat-icon>
          <div class="feature-text">
            <h3>Real-time statistics</h3>
            <p>Monitor user activity live</p>
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
            <h3>Multi-language</h3>
            <p>Support for 5+ languages</p>
          </div>
        </mat-card>
      </div>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-item">
          <span class="stat-value">99.9%</span>
          <span class="stat-label">Uptime</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">24/7</span>
          <span class="stat-label">Support</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">10k+</span>
          <span class="stat-label">Users</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Success State -->
<ng-template #successBlock>
  <div class="success-container">
    <mat-card class="success-card" appearance="outlined">
      <div class="icon-wrapper">
        <mat-icon class="success-icon">mark_email_read</mat-icon>
      </div>
      
      <h2 class="success-title">Check your inbox</h2>
      
      <p class="success-message">
        We sent a verification email to <strong>{{ registeredEmail }}</strong>.
      </p>
      
      <div class="success-details">
        <mat-icon class="details-icon">info</mat-icon>
        <p>
          Click the link in the email to activate your account. 
          The link expires in <strong>24 hours</strong>.
        </p>
      </div>
      
      <div class="success-actions">
        <button 
          mat-stroked-button 
          color="primary" 
          class="action-button secondary"
          (click)="goToResend()"
        >
          <mat-icon>refresh</mat-icon>
          Resend email
        </button>
        
        <button 
          mat-flat-button 
          color="primary" 
          class="action-button primary"
          routerLink="/auth/login"
        >
          <mat-icon>login</mat-icon>
          Go to Sign In
        </button>
      </div>
      
      <p class="success-note">
        <mat-icon class="note-icon">schedule</mat-icon>
        The verification link expires in 24 hours
      </p>
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
      --weak-color: #f44336;
      --medium-color: #ff9800;
      --strong-color: #4caf50;
      --border-radius: 12px;
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
      max-width: 50%;
      padding: 32px;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
    }

    .register-card {
      padding: 40px 36px;
      border-radius: var(--border-radius) !important;
      border: none !important;
      box-shadow: none !important;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }

    .brand-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--primary-color);
    }

    .brand-name {
      font-size: 22px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    /* Form Header */
    .form-header {
      margin-bottom: 32px;
    }

    .form-title {
      font-size: 36px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .form-subtitle {
      font-size: 16px;
      color: var(--text-secondary);
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 24px;
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

    .name-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
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

    /* Submit Button */
    .submit-button {
      height: 52px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px !important;
      margin-top: 16px;
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
      margin-top: 24px;
    }

    .login-text {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 24px;
    }

    .login-link {
      color: var(--primary-color);
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
      padding-top: 40px;
      color: var(--text-secondary);
      font-size: 13px;
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
      max-width: 520px;
      width: 100%;
    }

    .features-title {
      font-size: 42px;
      font-weight: 600;
      color: white;
      line-height: 1.2;
      margin-bottom: 48px;
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
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .feature-text p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
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
      font-size: 28px;
      font-weight: 600;
      color: white;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
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
      max-width: 520px;
      width: 100%;
      padding: 56px 48px;
      border-radius: 24px !important;
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
      font-size: 32px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }

    .success-message {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .success-details {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      text-align: left;
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .details-icon {
      color: var(--success-color);
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .success-details p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }

    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 24px;
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

    .success-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: var(--text-secondary);
      font-size: 13px;
      margin: 0;
    }

    .note-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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
      .register-form-panel {
        max-width: 500px;
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

      .name-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .success-actions {
        flex-direction: column;
      }

      .success-card {
        padding: 40px 24px;
      }
    }

    @media (max-width: 480px) {
      .form-title {
        font-size: 28px;
      }

      .success-title {
        font-size: 24px;
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
      phoneNumber: [''],
      language: [Language.FR]
    });
  }

  get f() { return this.form.controls; }

  // Password strength methods
  getPasswordStrength(): number {
    const pwd = this.f['password'].value || '';
    let strength = 0;
    
    if (pwd.length >= 6) strength += 30;
    if (pwd.length >= 8) strength += 20;
    if (/[a-z]/.test(pwd)) strength += 15;
    if (/[A-Z]/.test(pwd)) strength += 15;
    if (/[0-9]/.test(pwd)) strength += 20;
    
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
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: (response) => {
        this.registeredEmail = response.email;
        this.registered = true;
        this.loading = false;
        
        // Show success snackbar
        this.snackBar.open('Account created! Check your email.', 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
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