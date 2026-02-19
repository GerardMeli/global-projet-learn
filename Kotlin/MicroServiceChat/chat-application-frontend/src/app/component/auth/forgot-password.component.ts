import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider'; 
import { AuthService } from '../../core/services/users/auth.service';
import { ErrorHandlerService } from '../../core/services/users/error-handler.service';

@Component({
  selector: 'app-forgot-password',
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
    <!-- Brand -->
    <div class="brand">
      <mat-icon class="brand-icon" color="primary">admin_panel_settings</mat-icon>
      <span class="brand-name">FlowManage</span>
    </div>

    <!-- Content -->
    <ng-container *ngIf="!sent; else sentBlock">
      <div class="card-header">
        <mat-icon class="header-icon" color="primary">vpn_key</mat-icon>
        <h1 class="header-title">Reset your password</h1>
        <p class="header-description">
          Enter your email and we'll send you a reset link. 
          <strong>Expires in 30 minutes</strong>.
        </p>
      </div>

      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="alert error-alert">
        <mat-icon class="alert-icon">error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="reset-form">
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

        <button 
          mat-flat-button 
          color="primary" 
          type="submit" 
          class="submit-button"
          [disabled]="loading"
        >
          <mat-icon *ngIf="!loading" class="button-icon">lock_reset</mat-icon>
          <mat-spinner diameter="20" *ngIf="loading" class="button-spinner"></mat-spinner>
          <span>{{ loading ? 'Sending...' : 'Send reset link' }}</span>
        </button>
      </form>
    </ng-container>

    <!-- Sent State -->
    <ng-template #sentBlock>
      <div class="success-state">
        <mat-icon class="success-icon" color="primary">mark_email_read</mat-icon>
        <h2 class="success-title">Check your email</h2>
        <p class="success-message">
          We sent a password reset link to <strong>{{ email }}</strong>.
        </p>
        <div class="success-note">
          <mat-icon class="note-icon">schedule</mat-icon>
          <span>The link expires in 30 minutes. Check your spam folder if you don't see it.</span>
        </div>
        <button 
          mat-button 
          color="primary" 
          class="retry-button"
          (click)="sent = false"
        >
          <mat-icon>edit</mat-icon>
          Try a different email
        </button>
      </div>
    </ng-template>

    <mat-divider class="divider"></mat-divider>

    <!-- Back Link -->
    <a mat-button routerLink="/auth/login" class="back-link">
      <mat-icon>arrow_back</mat-icon>
      Back to sign in
    </a>
  </mat-card>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #3f51b5;
      --error-color: #f44336;
      --success-color: #4caf50;
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
      max-width: 480px;
      width: 100%;
      padding: 40px 32px;
      border-radius: 16px !important;
      background: white;
    }

    /* Brand */
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 32px;
    }

    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }

    /* Header */
    .card-header {
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
      gap: 24px;
    }

    .full-width {
      width: 100%;
    }

    .submit-button {
      height: 52px;
      font-size: 16px;
      font-weight: 500;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .button-icon, .button-spinner {
      margin-right: 4px;
    }

    /* Success State */
    .success-state {
      text-align: center;
      padding: 16px 0;
    }

    .success-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    .success-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .success-message {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .success-note {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      text-align: left;
      background: #e3f2fd;
      color: #1565c0;
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .note-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .retry-button {
      margin-top: 8px;
    }

    .divider {
      margin: 24px 0 16px !important;
    }

    .back-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
    }

    .back-link:hover {
      color: var(--primary-color);
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
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  sent = false;
  email = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.email = this.f['email'].value;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => { 
        this.sent = true; 
        this.loading = false; 
      },
      error: (err: HttpErrorResponse) => {
        // Reveal generic message even on 404 to prevent email enumeration
        this.sent = true; 
        this.loading = false;
      }
    });
  }
}