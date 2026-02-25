import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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

import { STRONG_PASSWORD_PATTERN } from '../../core/models/users/email pwd.model'; 
import { AuthService } from '../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../core/services/users/error-handler.service';

function passwordsMatch(control: AbstractControl) {
  const newPwd = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPwd === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
<div class="reset-container">
  <mat-card class="reset-card" appearance="outlined">
    <!-- Token Error State -->
    <ng-container *ngIf="tokenError">
      <div class="error-state">
        <mat-icon class="error-icon" color="warn">timer_off</mat-icon>
        <h1 class="error-title">Link expired</h1>
        <p class="error-message">
          This password reset link is invalid or has expired (30 min limit).
        </p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/forgot-password"
          class="action-button"
        >
          Request new link
        </button>
      </div>
    </ng-container>

    <!-- Reset Form -->
    <ng-container *ngIf="!tokenError && !success">
      <div class="form-header">
        <mat-icon class="header-icon" color="primary">lock_reset</mat-icon>
        <h1 class="header-title">Create new password</h1>
        <p class="header-description">
          Choose a strong password with uppercase, lowercase, number, and special character.
        </p>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="alert error-alert">
        <mat-icon class="alert-icon">error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="reset-form">
        <!-- New Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New password</mat-label>
          <input 
            matInput 
            [type]="hideNewPassword ? 'password' : 'text'" 
            formControlName="newPassword"
            placeholder="Create a strong password"
          />
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hideNewPassword = !hideNewPassword"
            [attr.aria-label]="'Hide password'"
          >
            <mat-icon>{{ hideNewPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="f['newPassword'].touched && f['newPassword'].hasError('minlength')">
            At least 8 characters required
          </mat-error>
          <mat-error *ngIf="f['newPassword'].touched && f['newPassword'].hasError('pattern')">
            Must contain uppercase, lowercase, number, and special character
          </mat-error>
        </mat-form-field>

        <!-- Password Strength Indicator -->
        <div class="password-strength" *ngIf="f['newPassword'].value">
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

        <!-- Confirm Password -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Confirm password</mat-label>
          <input 
            matInput 
            [type]="hideConfirmPassword ? 'password' : 'text'" 
            formControlName="confirmPassword"
            placeholder="Repeat your password"
          />
          <button 
            mat-icon-button 
            matSuffix 
            type="button"
            (click)="hideConfirmPassword = !hideConfirmPassword"
            [attr.aria-label]="'Hide password'"
          >
            <mat-icon>{{ hideConfirmPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          <mat-error *ngIf="f['confirmPassword'].touched && form.errors?.['mismatch']">
            Passwords do not match
          </mat-error>
        </mat-form-field>

        <!-- Requirements Checklist -->
        <div class="requirements-checklist">
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
        </div>

        <button 
          mat-flat-button 
          color="primary" 
          type="submit" 
          class="submit-button"
          [disabled]="loading || form.invalid"
        >
          <mat-spinner diameter="20" *ngIf="loading" class="button-spinner"></mat-spinner>
          <span>{{ loading ? 'Updating...' : 'Reset password' }}</span>
        </button>
      </form>
    </ng-container>

    <!-- Success State -->
    <ng-container *ngIf="success">
      <div class="success-state">
        <mat-icon class="success-icon" color="primary">check_circle</mat-icon>
        <h2 class="success-title">Password updated!</h2>
        <p class="success-message">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/login"
          class="action-button"
        >
          Sign in now
        </button>
      </div>
    </ng-container>
  </mat-card>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --error-color: #f44336;
      --success-color: #4caf50;
      --weak-color: #f44336;
      --medium-color: #ff9800;
      --strong-color: #4caf50;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
    }

    .reset-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-light);
      padding: 24px;
    }

    .reset-card {
      max-width: 520px;
      width: 100%;
      padding: 40px 36px;
      border-radius: 20px !important;
      background: white;
    }

    /* Error State */
    .error-state {
      text-align: center;
      padding: 24px 0;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
    }

    .error-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .error-message {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    /* Form Header */
    .form-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .header-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 12px 0;
      letter-spacing: -0.02em;
    }

    .header-description {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
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
    .reset-form {
      display: flex;
      flex-direction: column;
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

    /* Requirements Checklist */
    .requirements-checklist {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 8px 0;
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

    /* Submit Button */
    .submit-button {
      height: 52px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px !important;
      margin-top: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    /* Success State */
    .success-state {
      text-align: center;
      padding: 24px 0;
    }

    .success-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      margin-bottom: 20px;
    }

    .success-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .success-message {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .action-button {
      height: 48px;
      padding: 0 32px;
      font-size: 15px;
      border-radius: 8px !important;
    }

    /* Material Overrides */
    ::ng-deep .mat-mdc-form-field-flex {
      height: 56px !important;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #f8fafc !important;
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  success = false;
  tokenError = false;
  errorMessage = '';
  hideNewPassword = true;
  hideConfirmPassword = true;
  private token = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.maxLength(100), 
        Validators.pattern(STRONG_PASSWORD_PATTERN)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  get f() { return this.form.controls; }

  // Password validation checks
  get hasMinLength(): boolean {
    return this.f['newPassword'].value?.length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.f['newPassword'].value);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.f['newPassword'].value);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.f['newPassword'].value);
  }

  get hasSpecialChar(): boolean {
    return /[@#$%^&+=]/.test(this.f['newPassword'].value);
  }

  getPasswordStrength(): number {
    const pwd = this.f['newPassword'].value || '';
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

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) this.tokenError = true;
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    this.authService.resetPassword({
      token: this.token,
      newPassword: this.f['newPassword'].value,
      confirmPassword: this.f['confirmPassword'].value
    }).subscribe({
      next: () => { 
        this.success = true; 
        this.loading = false; 
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        if (this.errorHandler.isTokenError(handled)) {
          this.tokenError = true;
        } else {
          this.errorMessage = handled.userMessage;
        }
        this.loading = false;
      }
    });
  }
}