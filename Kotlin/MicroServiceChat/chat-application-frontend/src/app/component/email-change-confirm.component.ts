import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ErrorHandlerService } from '../service/error handler.service';
import { ProfileService } from '../service/profile.service';

@Component({
  selector: 'app-email-change-confirm',
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
<div class="confirm-container">
  <mat-card class="confirm-card" appearance="outlined">
    <ng-container [ngSwitch]="state">
      <!-- Loading -->
      <div *ngSwitchCase="'loading'" class="state-block loading-state">
        <mat-spinner diameter="48" color="primary"></mat-spinner>
        <p class="state-message">Confirming your new email...</p>
      </div>

      <!-- Success -->
      <div *ngSwitchCase="'success'" class="state-block success-state">
        <div class="icon-wrapper">
          <mat-icon class="state-icon">mark_email_read</mat-icon>
        </div>
        <h2 class="state-title">Email updated!</h2>
        <p class="state-message">
          Your email address has been changed successfully. Future notifications will go to your new address.
        </p>
        <button 
          mat-flat-button 
          color="primary" 
          routerLink="/profile"
          class="action-button"
        >
          Go to profile
        </button>
      </div>

      <!-- Error -->
      <div *ngSwitchCase="'error'" class="state-block error-state">
        <div class="icon-wrapper error">
          <mat-icon class="state-icon">timer_off</mat-icon>
        </div>
        <h2 class="state-title">Link expired</h2>
        <p class="state-message">{{ errorMessage }}</p>
        <button 
          mat-stroked-button 
          color="primary" 
          routerLink="/profile"
          class="action-button secondary"
        >
          Back to profile
        </button>
      </div>
    </ng-container>
  </mat-card>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #ff9800;
      --success-color: #4caf50;
      --error-color: #f44336;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
    }

    .confirm-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
      padding: 24px;
    }

    .confirm-card {
      max-width: 480px;
      width: 100%;
      padding: 48px 40px;
      border-radius: 24px !important;
      background: white;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
    }

    .state-block {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    /* Icon Wrapper */
    .icon-wrapper {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
    }

    .icon-wrapper.error {
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    }

    .state-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--success-color);
    }

    .error-state .state-icon {
      color: var(--error-color);
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

    /* Loading State */
    .loading-state {
      gap: 24px;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .confirm-card {
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
export class EmailChangeConfirmComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) { 
      this.state = 'error'; 
      this.errorMessage = 'No token provided.'; 
      return; 
    }

    this.profileService.confirmEmailChange(token).subscribe({
      next: () => { 
        this.state = 'success'; 
      },
      error: (err: HttpErrorResponse) => {
        const handled = this.errorHandler.handle(err);
        this.errorMessage = handled.userMessage;
        this.state = 'error';
      }
    });
  }
}