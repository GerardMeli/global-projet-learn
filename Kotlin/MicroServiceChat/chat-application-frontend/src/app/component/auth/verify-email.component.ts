import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router'; 
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../service/auth.service';
import { ErrorHandlerService } from '../../service/error handler.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
<div class="verify-container">
  <mat-card class="verify-card" appearance="outlined">
    <ng-container [ngSwitch]="state">
      <!-- Loading -->
      <div *ngSwitchCase="'loading'" class="state-block loading-state">
        <mat-spinner diameter="48" color="primary"></mat-spinner>
        <p class="state-message">Verifying your email...</p>
      </div>

      <!-- Success -->
      <div *ngSwitchCase="'success'" class="state-block success-state">
        <div class="icon-wrapper success">
          <mat-icon class="state-icon">check_circle</mat-icon>
        </div>
        <h2 class="state-title">Email verified!</h2>
        <p class="state-message">Your account is now active. Welcome aboard!</p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/login"
          class="action-button"
        >
          Go to Sign In
        </button>
      </div>

      <!-- Expired -->
      <div *ngSwitchCase="'expired'" class="state-block error-state">
        <div class="icon-wrapper expired">
          <mat-icon class="state-icon">timer_off</mat-icon>
        </div>
        <h2 class="state-title">Link expired</h2>
        <p class="state-message">
          This verification link has expired (24 hour limit) or has already been used.
        </p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/resend-verification"
          class="action-button"
        >
          Get a new link
        </button>
      </div>

      <!-- Invalid -->
      <div *ngSwitchCase="'invalid'" class="state-block error-state">
        <div class="icon-wrapper invalid">
          <mat-icon class="state-icon">error</mat-icon>
        </div>
        <h2 class="state-title">Invalid link</h2>
        <p class="state-message">
          This verification link is malformed. Please request a new one.
        </p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/auth/resend-verification"
          class="action-button"
        >
          Get a new link
        </button>
      </div>

      <!-- No Token -->
      <div *ngSwitchCase="'no-token'" class="state-block warning-state">
        <div class="icon-wrapper warning">
          <mat-icon class="state-icon">link_off</mat-icon>
        </div>
        <h2 class="state-title">No token found</h2>
        <p class="state-message">
          This page requires a verification link from your email. Check your inbox.
        </p>
        <button 
          mat-stroked-button 
          color="primary" 
          routerLink="/auth/login"
          class="action-button secondary"
        >
          Back to Sign In
        </button>
      </div>
    </ng-container>
  </mat-card>
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
    }

    .verify-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      padding: 24px;
    }

    .verify-card {
      max-width: 480px;
      width: 100%;
      padding: 48px 40px;
      border-radius: 24px !important;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
    }

    .state-block {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    /* Icon Wrappers */
    .icon-wrapper {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }

    .icon-wrapper.success {
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
    }

    .icon-wrapper.expired {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .icon-wrapper.invalid {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    }

    .icon-wrapper.warning {
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
    }

    .state-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
    }

    .success-state .state-icon {
      color: var(--success-color);
    }

    .error-state .state-icon {
      color: var(--error-color);
    }

    .warning-state .state-icon {
      color: var(--warning-color);
    }

    /* Text */
    .state-title {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .state-message {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin: 0;
      max-width: 320px;
    }

    /* Loading State */
    .loading-state {
      gap: 24px;
    }

    /* Button */
    .action-button {
      height: 48px;
      padding: 0 32px;
      font-size: 15px;
      border-radius: 24px !important;
      margin-top: 8px;
    }

    .action-button.secondary {
      background: transparent;
      border: 1px solid var(--primary-color);
    }

    /* Animation */
    @keyframes bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .success-state .icon-wrapper {
      animation: bounce 0.5s ease;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .verify-card {
        padding: 32px 24px;
      }

      .state-title {
        font-size: 24px;
      }

      .state-message {
        font-size: 14px;
      }
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'expired' | 'invalid' | 'no-token' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) { 
      this.state = 'no-token'; 
      return; 
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => { 
        this.state = 'success'; 
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.state = this.errorHandler.isTokenError(handled)
          ? (handled.code === 'EXPIRED_TOKEN' ? 'expired' : 'invalid')
          : 'invalid';
      }
    });
  }
}