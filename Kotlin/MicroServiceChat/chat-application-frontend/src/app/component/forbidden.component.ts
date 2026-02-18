import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
<div class="forbidden-container">
  <mat-card class="forbidden-card" appearance="outlined">
    <div class="icon-wrapper">
      <mat-icon class="forbidden-icon">block</mat-icon>
    </div>
    
    <h1 class="forbidden-title">Access Denied</h1>
    
    <p class="forbidden-message">
      You don't have permission to access this page.
    </p>
    
    <div class="action-buttons">
      <button 
        mat-flat-button 
        color="primary" 
        routerLink="/profile"
        class="action-button"
      >
        <mat-icon>person</mat-icon>
        Go to your profile
      </button>
      
      <button 
        mat-stroked-button 
        color="primary" 
        routerLink="/dashboard"
        class="action-button secondary"
      >
        <mat-icon>dashboard</mat-icon>
        Go to dashboard
      </button>
    </div>
    
    <div class="help-section">
      <mat-icon class="help-icon">help</mat-icon>
      <span class="help-text">
        If you believe this is a mistake, please contact your administrator.
      </span>
    </div>
  </mat-card>
</div>
  `,
  styles: [`
    :host {
      --primary-color: #f44336;
      --text-primary: #2c3e50;
      --text-secondary: #7f8c8d;
      --bg-light: #f5f7fa;
    }

    .forbidden-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      padding: 24px;
    }

    .forbidden-card {
      max-width: 480px;
      width: 100%;
      padding: 56px 48px;
      border-radius: 24px !important;
      background: white;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1) !important;
    }

    .icon-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }

    .forbidden-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--primary-color);
    }

    .forbidden-title {
      font-size: 32px;
      font-weight: 600;
      color: var(--primary-color);
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
    }

    .forbidden-message {
      color: var(--text-secondary);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 32px;
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

    .help-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .help-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary-color);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .forbidden-card {
        padding: 40px 24px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .forbidden-title {
        font-size: 28px;
      }
    }
  `]
})
export class ForbiddenComponent {}