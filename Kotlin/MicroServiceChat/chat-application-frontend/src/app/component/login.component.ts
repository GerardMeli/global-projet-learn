import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthErrorCode } from '../models/error.model';
import { AuthService } from '../service/auth.service';
import { ErrorHandlerService } from '../service/error handler.service';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule
  ],
  template: `
<div class="login-container">
  <!-- Left Panel - Login Form -->
  <div class="login-form-panel">
    <mat-card class="login-card" appearance="outlined">
      <!-- Brand -->
      <div class="brand">
        <mat-icon class="brand-icon" aria-hidden="false" aria-label="Logo">admin_panel_settings</mat-icon>
        <span class="brand-name">FlowManage</span>
      </div>

      <!-- Header -->
      <div class="form-header">
        <h1 class="form-title">Welcome back</h1>
        <p class="form-subtitle">Sign in to continue to your dashboard</p>
      </div>

      <!-- Account State Alerts (using Material snackbar style) -->
      <div *ngIf="errorCode === AuthErrorCode.ACCOUNT_NOT_VERIFIED" class="alert warning-alert">
        <mat-icon class="alert-icon">warning</mat-icon>
        <div class="alert-content">
          <span>Your email isn't verified yet.</span>
          <button mat-button color="primary" (click)="goToResend()" class="alert-link">
            Resend verification
          </button>
        </div>
      </div>

      <div *ngIf="errorCode === AuthErrorCode.ACCOUNT_BLOCKED" class="alert error-alert">
        <mat-icon class="alert-icon">block</mat-icon>
        <div class="alert-content">
          <span>Account locked after too many failed attempts.</span>
          <a mat-button color="primary" routerLink="/auth/forgot-password" class="alert-link">
            Reset password
          </a>
        </div>
      </div>

      <div *ngIf="errorCode === AuthErrorCode.ACCOUNT_SUSPENDED" class="alert error-alert">
        <mat-icon class="alert-icon">gpp_bad</mat-icon>
        <div class="alert-content">
          <span>Your account has been suspended.</span>
          <button mat-button color="primary" class="alert-link">
            Contact support
          </button>
        </div>
      </div>

      <div *ngIf="errorMessage && !isAccountStateError" class="alert error-alert">
        <mat-icon class="alert-icon">error</mat-icon>
        <div class="alert-content">
          <span>{{ errorMessage }}</span>
        </div>
      </div>

      <!-- Login Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
        <!-- Email Field -->
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

        <!-- Password Field -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input 
            matInput 
            [type]="hidePassword ? 'password' : 'text'" 
            formControlName="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hidePassword = !hidePassword"
            [attr.aria-label]="'Hide password'"
            [attr.aria-pressed]="hidePassword"
          >
            <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="f['password'].touched && f['password'].hasError('required')">
            Password is required
          </mat-error>
        </mat-form-field>

        <!-- Forgot Password Link -->
        <div class="form-actions">
          <a mat-button color="primary" routerLink="/auth/forgot-password" class="forgot-link">
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
        <button 
          mat-flat-button 
          color="primary" 
          type="submit" 
          class="submit-button"
          [disabled]="loading"
        >
          <mat-icon *ngIf="!loading" class="button-icon">login</mat-icon>
          <mat-spinner diameter="20" *ngIf="loading" class="button-spinner"></mat-spinner>
          <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
        </button>

        <!-- Register Link -->
        <div class="register-section">
          <mat-divider></mat-divider>
          <p class="register-text">
            Don't have an account?
            <a routerLink="/auth/register" class="register-link" color="primary">
              Create one now
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
        Manage your team<br/>
        <span class="highlight">with confidence</span>
      </h2>
      
      <div class="feature-cards">
        <!-- Feature 1 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">security</mat-icon>
          <div class="feature-text">
            <h3>Role-based access</h3>
            <p>Granular permissions for your entire team</p>
          </div>
        </mat-card>

        <!-- Feature 2 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">insights</mat-icon>
          <div class="feature-text">
            <h3>Real-time analytics</h3>
            <p>Monitor user activity and engagement</p>
          </div>
        </mat-card>

        <!-- Feature 3 -->
        <mat-card class="feature-card" appearance="outlined">
          <mat-icon class="feature-icon" color="primary">notifications</mat-icon>
          <div class="feature-text">
            <h3>Smart notifications</h3>
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
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --primary-light: #e8eaf6;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
      --success-color: #4caf50;
      --warning-color: #ff9800;
      --error-color: #f44336;
      --border-radius: 12px;
    }

    /* Container */
    .login-container {
      min-height: 100vh;
      display: flex;
      background: var(--bg-light);
    }

    /* Left Panel - Form */
    .login-form-panel {
      flex: 1;
      max-width: 520px;
      padding: 32px;
      background: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
    }

    .login-card {
      padding: 40px 32px;
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

    /* Alerts */
    .alert {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      background: white;
      border: 1px solid;
    }

    .warning-alert {
      background: #fff3e0;
      border-color: #ffe0b2;
      color: #e65100;
    }

    .error-alert {
      background: #ffebee;
      border-color: #ffcdd2;
      color: #c62828;
    }

    .alert-icon {
      font-size: 20px;
    }

    .alert-content {
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .alert-link {
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      min-width: auto !important;
      line-height: 1;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: -8px;
      margin-bottom: 8px;
    }

    .forgot-link {
      font-size: 14px;
      text-decoration: none;
    }

    .forgot-link:hover {
      text-decoration: underline;
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

    .button-icon {
      margin-right: 4px;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    /* Register Section */
    .register-section {
      margin-top: 24px;
    }

    .register-text {
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 24px;
    }

    .register-link {
      text-decoration: none;
      font-weight: 500;
      margin-left: 4px;
    }

    .register-link:hover {
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

    /* Responsive */
    @media (max-width: 1024px) {
      .login-form-panel {
        max-width: 480px;
        padding: 24px;
      }
    }

    @media (max-width: 768px) {
      .login-container {
        flex-direction: column;
      }

      .login-form-panel {
        max-width: 100%;
        padding: 20px;
      }

      .login-card {
        padding: 32px 20px;
      }

      .features-panel {
        display: none;
      }

      .feature-cards {
        grid-template-columns: 1fr;
      }
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
  `]
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  errorCode: AuthErrorCode | null = null;
  hidePassword = true;
  AuthErrorCode = AuthErrorCode;

  private returnUrl: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/profile';
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check for email in query params (e.g., from registration)
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.form.patchValue({ email: params['email'] });
      }
    });
  }

  get f() { return this.form.controls; }

  get isAccountStateError(): boolean {
    return [
      AuthErrorCode.ACCOUNT_NOT_VERIFIED,
      AuthErrorCode.ACCOUNT_BLOCKED,
      AuthErrorCode.ACCOUNT_SUSPENDED,
      AuthErrorCode.ACCOUNT_DELETED,
      AuthErrorCode.ACCOUNT_INACTIVE
      //@ts-ignore
    ].includes(this.errorCode as AuthErrorCode);
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }

    this.loading = true;
    this.errorMessage = '';
    this.errorCode = null;

    this.authService.login(this.form.value).subscribe({
      next: (response) => {
        if (response.success) {
          // Show success snackbar
          this.snackBar.open('Login successful! Redirecting...', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });

          const role = response.data?.user?.role;
          this.router.navigateByUrl(role === 'ADMIN' ? '/admin' : this.returnUrl);
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorCode = handled.code;
        this.errorMessage = handled.userMessage;
        this.loading = false;

        // Scroll to top to show error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  goToResend(): void {
    const email = this.f['email'].value;
    if (email) {
      this.router.navigate(['/auth/resend-verification'], {
        queryParams: { email }
      });
    } else {
      this.router.navigate(['/auth/resend-verification']);
    }
  }
}