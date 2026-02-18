import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-resend-verification',
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
<div class="verification-container">
  <mat-card class="verification-card" appearance="outlined">
    <!-- Header -->
    <div class="card-header">
      <mat-icon class="header-icon" color="primary">mark_email_unread</mat-icon>
      <h1 class="header-title">Resend verification</h1>
    </div>

    <!-- Content -->
    <ng-container *ngIf="!sent; else sentBlock">
      <p class="card-description">
        Enter the email you registered with and we'll send a new verification link.
      </p>

      <!-- Error Alert -->
      <div *ngIf="errorMessage" class="alert error-alert">
        <mat-icon class="alert-icon">error</mat-icon>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="verification-form">
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
          <mat-icon *ngIf="!loading" class="button-icon">send</mat-icon>
          <mat-spinner diameter="20" *ngIf="loading" class="button-spinner"></mat-spinner>
          <span>{{ loading ? 'Sending...' : 'Resend verification link' }}</span>
        </button>
      </form>
    </ng-container>

    <!-- Sent State -->
    <ng-template #sentBlock>
      <div class="success-state">
        <mat-icon class="success-icon" color="primary">mark_email_read</mat-icon>
        <h2 class="success-title">Check your inbox</h2>
        <p class="success-message">
          A new verification link has been sent to <strong>{{ form.value.email }}</strong>.
        </p>
        <div class="success-note">
          <mat-icon class="note-icon">info</mat-icon>
          <span>Check your spam folder. The link expires in 24 hours.</span>
        </div>
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

    .verification-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-light);
      padding: 24px;
    }

    .verification-card {
      max-width: 480px;
      width: 100%;
      padding: 40px 32px;
      border-radius: 16px !important;
      background: white;
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
    }

    .header-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
    }

    .card-description {
      color: var(--text-secondary);
      font-size: 15px;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 24px;
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
    .verification-form {
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
      align-items: center;
      gap: 8px;
      justify-content: center;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
    }

    .note-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
export class ResendVerificationComponent implements OnInit {
  form: FormGroup;
  loading = false;
  sent = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]] 
    });
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) this.form.patchValue({ email });
  }

  submit(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    
    this.loading = true;
    this.errorMessage = '';

    this.authService.resendVerification(this.f['email'].value).subscribe({
      next: () => { 
        this.sent = true; 
        this.loading = false; 
      },
      error: (err: HttpErrorResponse) => {
        // Always show success to prevent email enumeration
        this.sent = true; 
        this.loading = false;
      }
    });
  }
}