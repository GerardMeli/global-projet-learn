import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TokenService } from '../../core/services/users/token.service';
import { ProfileService } from '../../core/services/users/profile.service';
import { AdminService } from '../../core/services/users/admin.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <!-- Header -->
      <div class="settings-header">
        <h1>System Settings</h1>
        <p class="settings-description">Configure and manage system preferences</p>
      </div>

      <!-- Settings Tabs -->
      <div class="settings-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">
          <span class="material-icons">settings_applications</span>
          General
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">
          <span class="material-icons">security</span>
          Security
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
          <span class="material-icons">notifications</span>
          Notifications
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">
          <span class="material-icons">people</span>
          User Management
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'email'" (click)="activeTab = 'email'">
          <span class="material-icons">email</span>
          Email
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'backup'" (click)="activeTab = 'backup'">
          <span class="material-icons">backup</span>
          Backup
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'api'" (click)="activeTab = 'api'">
          <span class="material-icons">api</span>
          API
        </button>
      </div>

      <!-- Success Message -->
      <div class="success-message" *ngIf="successMessage">
        <span class="material-icons">check_circle</span>
        <p>{{ successMessage }}</p>
        <button class="close-btn" (click)="successMessage = ''">×</button>
      </div>

      <!-- Error Message -->
      <div class="error-message" *ngIf="errorMessage">
        <span class="material-icons">error</span>
        <p>{{ errorMessage }}</p>
        <button class="close-btn" (click)="errorMessage = ''">×</button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading settings...</p>
      </div>

      <!-- General Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'general' && !loading">
        <div class="settings-card">
          <h2>General Settings</h2>
          
          <div class="settings-section">
            <h3>Application Name</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Change the application name displayed throughout the system</p>
              </div>
              <div class="setting-control">
                <input 
                  type="text" 
                  [(ngModel)]="settings.general.appName"
                  placeholder="Enter application name"
                >
                <button class="save-setting-btn" (click)="saveGeneralSetting('appName')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Timezone</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Set the default timezone for the application</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.general.timezone">
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
                <button class="save-setting-btn" (click)="saveGeneralSetting('timezone')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Date Format</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Choose how dates are displayed throughout the application</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.general.dateFormat">
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="DD MMM YYYY">DD MMM YYYY (e.g., 15 Jan 2024)</option>
                </select>
                <button class="save-setting-btn" (click)="saveGeneralSetting('dateFormat')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Language</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Set the default language for the admin interface</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.general.language">
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="pt">Português</option>
                  <option value="ru">Русский</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
                <button class="save-setting-btn" (click)="saveGeneralSetting('language')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Maintenance Mode</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>When enabled, only administrators can access the system</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.general.maintenanceMode">
                  <span class="toggle-slider"></span>
                </label>
                <span class="toggle-status">{{ settings.general.maintenanceMode ? 'Enabled' : 'Disabled' }}</span>
                <button class="save-setting-btn" (click)="saveGeneralSetting('maintenanceMode')">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'security' && !loading">
        <div class="settings-card">
          <h2>Security Settings</h2>
          
          <div class="settings-section">
            <h3>Password Policy</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Minimum password length</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.security.minPasswordLength"
                  min="6"
                  max="32"
                >
                <span class="setting-unit">characters</span>
                <button class="save-setting-btn" (click)="saveSecuritySetting('minPasswordLength')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Require uppercase letters</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.security.requireUppercase">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveSecuritySetting('requireUppercase')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Require lowercase letters</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.security.requireLowercase">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveSecuritySetting('requireLowercase')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Require numbers</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.security.requireNumbers">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveSecuritySetting('requireNumbers')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Require special characters</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.security.requireSpecialChars">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveSecuritySetting('requireSpecialChars')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Session Settings</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Session timeout (minutes)</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.security.sessionTimeout"
                  min="5"
                  max="1440"
                >
                <span class="setting-unit">minutes</span>
                <button class="save-setting-btn" (click)="saveSecuritySetting('sessionTimeout')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Maximum login attempts before lockout</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.security.maxLoginAttempts"
                  min="3"
                  max="10"
                >
                <span class="setting-unit">attempts</span>
                <button class="save-setting-btn" (click)="saveSecuritySetting('maxLoginAttempts')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Lockout duration (minutes)</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.security.lockoutDuration"
                  min="5"
                  max="1440"
                >
                <span class="setting-unit">minutes</span>
                <button class="save-setting-btn" (click)="saveSecuritySetting('lockoutDuration')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Two-Factor Authentication</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Require 2FA for all administrators</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.security.require2FA">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveSecuritySetting('require2FA')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>IP Whitelist</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Restrict admin access to specific IP addresses</p>
              </div>
              <div class="setting-control">
                <textarea 
                  [(ngModel)]="settings.security.ipWhitelist"
                  rows="3"
                  placeholder="Enter IP addresses (one per line)"
                ></textarea>
                <button class="save-setting-btn" (click)="saveSecuritySetting('ipWhitelist')">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'notifications' && !loading">
        <div class="settings-card">
          <h2>Notification Settings</h2>
          
          <div class="settings-section">
            <h3>Email Notifications</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>New user registration</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.email.newUser">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveNotificationSetting('newUser')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Failed login attempts</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.email.failedLogin">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveNotificationSetting('failedLogin')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>User status changes</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.email.userStatusChange">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveNotificationSetting('userStatusChange')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>System updates</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.email.systemUpdates">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveNotificationSetting('systemUpdates')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Daily summary report</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.email.dailySummary">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveNotificationSetting('dailySummary')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>In-App Notifications</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Show desktop notifications</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.notifications.inApp.desktop">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveInAppSetting('desktop')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Notification sound</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.notifications.inApp.sound">
                  <option value="none">None</option>
                  <option value="chime">Chime</option>
                  <option value="bell">Bell</option>
                  <option value="ding">Ding</option>
                </select>
                <button class="save-setting-btn" (click)="saveInAppSetting('sound')">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Management Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'users' && !loading">
        <div class="settings-card">
          <h2>User Management Settings</h2>
          
          <div class="settings-section">
            <h3>Registration Settings</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Allow new user registration</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.users.allowRegistration">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveUserSetting('allowRegistration')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Require email verification</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.users.requireEmailVerification">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveUserSetting('requireEmailVerification')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Default user role</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.users.defaultRole">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPPORT">Support</option>
                </select>
                <button class="save-setting-btn" (click)="saveUserSetting('defaultRole')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Account Cleanup</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Delete inactive accounts after (days)</p>
                <p class="setting-note">Set to 0 to disable automatic deletion</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.users.inactiveAccountDays"
                  min="0"
                  max="365"
                >
                <span class="setting-unit">days</span>
                <button class="save-setting-btn" (click)="saveUserSetting('inactiveAccountDays')">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Email Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'email' && !loading">
        <div class="settings-card">
          <h2>Email Settings</h2>
          
          <div class="settings-section">
            <h3>SMTP Configuration</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>SMTP Host</p>
              </div>
              <div class="setting-control">
                <input 
                  type="text" 
                  [(ngModel)]="settings.email.smtpHost"
                  placeholder="e.g., smtp.gmail.com"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('smtpHost')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>SMTP Port</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.email.smtpPort"
                  placeholder="e.g., 587"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('smtpPort')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Encryption</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.email.encryption">
                  <option value="none">None</option>
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
                <button class="save-setting-btn" (click)="saveEmailSetting('encryption')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Username</p>
              </div>
              <div class="setting-control">
                <input 
                  type="text" 
                  [(ngModel)]="settings.email.username"
                  placeholder="SMTP username"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('username')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Password</p>
              </div>
              <div class="setting-control">
                <input 
                  type="password" 
                  [(ngModel)]="settings.email.password"
                  placeholder="SMTP password"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('password')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>From Email</p>
              </div>
              <div class="setting-control">
                <input 
                  type="email" 
                  [(ngModel)]="settings.email.fromEmail"
                  placeholder="noreply@example.com"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('fromEmail')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>From Name</p>
              </div>
              <div class="setting-control">
                <input 
                  type="text" 
                  [(ngModel)]="settings.email.fromName"
                  placeholder="System Administrator"
                >
                <button class="save-setting-btn" (click)="saveEmailSetting('fromName')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Test Email</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Send a test email to verify your configuration</p>
              </div>
              <div class="setting-control">
                <input 
                  type="email" 
                  [(ngModel)]="testEmailAddress"
                  placeholder="Enter email address"
                >
                <button class="test-btn" (click)="sendTestEmail()" [disabled]="!testEmailAddress || sendingTest">
                  <span class="material-icons" *ngIf="!sendingTest">send</span>
                  <span class="spinner-small" *ngIf="sendingTest"></span>
                  {{ sendingTest ? 'Sending...' : 'Send Test Email' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'backup' && !loading">
        <div class="settings-card">
          <h2>Backup Settings</h2>
          
          <div class="settings-section">
            <h3>Automatic Backups</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Enable automatic backups</p>
              </div>
              <div class="setting-control toggle-control">
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="settings.backup.enabled">
                  <span class="toggle-slider"></span>
                </label>
                <button class="save-setting-btn" (click)="saveBackupSetting('enabled')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Backup frequency</p>
              </div>
              <div class="setting-control">
                <select [(ngModel)]="settings.backup.frequency">
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <button class="save-setting-btn" (click)="saveBackupSetting('frequency')">Save</button>
              </div>
            </div>

            <div class="setting-item">
              <div class="setting-info">
                <p>Keep backups for (days)</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.backup.retentionDays"
                  min="1"
                  max="365"
                >
                <span class="setting-unit">days</span>
                <button class="save-setting-btn" (click)="saveBackupSetting('retentionDays')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Backup Location</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Storage path</p>
              </div>
              <div class="setting-control">
                <input 
                  type="text" 
                  [(ngModel)]="settings.backup.path"
                  placeholder="/var/backups"
                >
                <button class="save-setting-btn" (click)="saveBackupSetting('path')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Manual Backup</h3>
            <div class="setting-item">
              <div class="setting-info">
                <p>Create a backup now</p>
              </div>
              <div class="setting-control">
                <button class="backup-btn" (click)="createBackup()" [disabled]="creatingBackup">
                  <span class="material-icons" *ngIf="!creatingBackup">backup</span>
                  <span class="spinner-small" *ngIf="creatingBackup"></span>
                  {{ creatingBackup ? 'Creating...' : 'Create Backup Now' }}
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Recent Backups</h3>
            <div class="backups-list">
              <div class="backup-item" *ngFor="let backup of recentBackups">
                <div class="backup-info">
                  <span class="material-icons">backup</span>
                  <div>
                    <p class="backup-name">{{ backup.name }}</p>
                    <p class="backup-date">{{ backup.date | date:'medium' }}</p>
                  </div>
                </div>
                <div class="backup-size">{{ backup.size }}</div>
                <div class="backup-actions">
                  <button class="icon-btn" title="Download" (click)="downloadBackup(backup)">
                    <span class="material-icons">download</span>
                  </button>
                  <button class="icon-btn" title="Restore" (click)="restoreBackup(backup)">
                    <span class="material-icons">restore</span>
                  </button>
                </div>
              </div>
              <div class="no-backups" *ngIf="recentBackups.length === 0">
                <span class="material-icons">backup</span>
                <p>No backups available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- API Settings Tab -->
      <div class="settings-content" *ngIf="activeTab === 'api' && !loading">
        <div class="settings-card">
          <h2>API Settings</h2>
          
          <div class="settings-section">
            <h3>API Keys</h3>
            
            <div class="api-keys-list">
              <div class="api-key-item" *ngFor="let key of apiKeys">
                <div class="key-info">
                  <p class="key-name">{{ key.name }}</p>
                  <p class="key-preview">{{ key.key }}</p>
                </div>
                <div class="key-permissions">{{ key.permissions.join(', ') }}</div>
                <div class="key-actions">
                  <button class="icon-btn" title="Copy" (click)="copyApiKey(key)">
                    <span class="material-icons">copy</span>
                  </button>
                  <button class="icon-btn" title="Regenerate" (click)="regenerateApiKey(key)">
                    <span class="material-icons">refresh</span>
                  </button>
                  <button class="icon-btn delete" title="Delete" (click)="deleteApiKey(key)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="add-api-key">
              <h4>Generate New API Key</h4>
              <div class="form-group">
                <input 
                  type="text" 
                  [(ngModel)]="newApiKeyName"
                  placeholder="Key name (e.g., Production API Key)"
                >
                <select [(ngModel)]="newApiKeyPermissions">
                  <option value="read">Read only</option>
                  <option value="read,write">Read & Write</option>
                  <option value="admin">Admin access</option>
                </select>
                <button class="generate-btn" (click)="generateApiKey()" [disabled]="!newApiKeyName">
                  <span class="material-icons">add</span>
                  Generate Key
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Rate Limiting</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Maximum requests per minute</p>
              </div>
              <div class="setting-control">
                <input 
                  type="number" 
                  [(ngModel)]="settings.api.rateLimit"
                  min="10"
                  max="10000"
                >
                <span class="setting-unit">requests/min</span>
                <button class="save-setting-btn" (click)="saveAPISetting('rateLimit')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>CORS Settings</h3>
            
            <div class="setting-item">
              <div class="setting-info">
                <p>Allowed origins</p>
                <p class="setting-note">Enter one domain per line</p>
              </div>
              <div class="setting-control">
                <textarea 
                  [(ngModel)]="settings.api.allowedOrigins"
                  rows="4"
                  placeholder="https://example.com&#10;https://app.example.com"
                ></textarea>
                <button class="save-setting-btn" (click)="saveAPISetting('allowedOrigins')">Save</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>API Documentation</h3>
            <div class="api-docs">
              <button class="docs-btn" (click)="openApiDocs()">
                <span class="material-icons">menu_book</span>
                Open API Documentation
              </button>
              <button class="export-btn" (click)="exportOpenApiSpec()">
                <span class="material-icons">download</span>
                Export OpenAPI Spec
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .settings-header {
      margin-bottom: 24px;
    }

    .settings-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #2d3748;
    }

    .settings-description {
      margin: 0;
      color: #718096;
      font-size: 14px;
    }

    /* Tabs */
    .settings-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      background: white;
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      flex-wrap: wrap;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: none;
      background: none;
      border-radius: 8px;
      color: #718096;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 14px;
    }

    .tab-btn:hover {
      background: #f7fafc;
      color: #4a5568;
    }

    .tab-btn.active {
      background: #667eea;
      color: white;
    }

    .tab-btn .material-icons {
      font-size: 18px;
    }

    /* Messages */
    .success-message, .error-message {
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
    }

    .success-message {
      background: #c6f6d5;
      border: 1px solid #9ae6b4;
      color: #22543d;
    }

    .error-message {
      background: #fed7d7;
      border: 1px solid #feb2b2;
      color: #742a2a;
    }

    .success-message .material-icons,
    .error-message .material-icons {
      font-size: 24px;
    }

    .close-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
    }

    .close-btn:hover {
      opacity: 1;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px;
      background: white;
      border-radius: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    .spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Settings Card */
    .settings-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .settings-card h2 {
      margin: 0 0 24px 0;
      font-size: 20px;
      color: #2d3748;
    }

    .settings-section {
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #e2e8f0;
    }

    .settings-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .settings-section h3 {
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #4a5568;
    }

    .settings-section h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #718096;
    }

    /* Setting Item */
    .setting-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #f7fafc;
    }

    .setting-item:last-child {
      border-bottom: none;
    }

    .setting-info {
      flex: 1;
    }

    .setting-info p {
      margin: 0 0 4px 0;
      color: #2d3748;
      font-size: 14px;
    }

    .setting-note {
      color: #a0aec0;
      font-size: 12px;
      font-style: italic;
    }

    .setting-control {
      width: 300px;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .setting-control input[type="text"],
    .setting-control input[type="email"],
    .setting-control input[type="password"],
    .setting-control input[type="number"],
    .setting-control select,
    .setting-control textarea {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s;
    }

    .setting-control input:focus,
    .setting-control select:focus,
    .setting-control textarea:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      outline: none;
    }

    .setting-control textarea {
      resize: vertical;
      min-height: 80px;
    }

    .setting-unit {
      color: #718096;
      font-size: 14px;
      min-width: 60px;
    }

    .toggle-control {
      align-items: center;
    }

    .toggle-status {
      color: #718096;
      font-size: 14px;
      min-width: 70px;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
      margin-right: 8px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e0;
      transition: .3s;
      border-radius: 34px;
    }

    .toggle-slider:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
    }

    input:checked + .toggle-slider {
      background-color: #667eea;
    }

    input:checked + .toggle-slider:before {
      transform: translateX(26px);
    }

    /* Buttons */
    .save-setting-btn {
      padding: 6px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.3s;
      white-space: nowrap;
    }

    .save-setting-btn:hover {
      background: #5a67d8;
    }

    .test-btn, .backup-btn, .generate-btn, .docs-btn, .export-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .test-btn {
      background: #48bb78;
      color: white;
    }

    .test-btn:hover:not(:disabled) {
      background: #38a169;
    }

    .backup-btn {
      background: #9f7aea;
      color: white;
    }

    .backup-btn:hover:not(:disabled) {
      background: #805ad5;
    }

    .generate-btn {
      background: #667eea;
      color: white;
    }

    .docs-btn {
      background: #ed8936;
      color: white;
    }

    .export-btn {
      background: #4299e1;
      color: white;
    }

    .test-btn:disabled,
    .backup-btn:disabled,
    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Backups List */
    .backups-list {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .backup-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      transition: background 0.3s;
    }

    .backup-item:last-child {
      border-bottom: none;
    }

    .backup-item:hover {
      background: #f7fafc;
    }

    .backup-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .backup-info .material-icons {
      color: #9f7aea;
    }

    .backup-name {
      margin: 0 0 4px 0;
      font-weight: 500;
      color: #2d3748;
    }

    .backup-date {
      margin: 0;
      font-size: 12px;
      color: #718096;
    }

    .backup-size {
      color: #718096;
      font-size: 14px;
    }

    .backup-actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      background: #f7fafc;
      color: #4a5568;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .icon-btn:hover {
      background: #667eea;
      color: white;
    }

    .icon-btn.delete:hover {
      background: #e53e3e;
    }

    .icon-btn .material-icons {
      font-size: 18px;
    }

    .no-backups {
      padding: 40px;
      text-align: center;
      color: #a0aec0;
    }

    .no-backups .material-icons {
      font-size: 32px;
      margin-bottom: 8px;
    }

    /* API Keys */
    .api-keys-list {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .api-key-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .api-key-item:last-child {
      border-bottom: none;
    }

    .key-info {
      flex: 2;
    }

    .key-name {
      margin: 0 0 4px 0;
      font-weight: 500;
      color: #2d3748;
    }

    .key-preview {
      margin: 0;
      font-size: 12px;
      color: #718096;
      font-family: monospace;
    }

    .key-permissions {
      flex: 1;
      color: #667eea;
      font-size: 13px;
    }

    .key-actions {
      display: flex;
      gap: 8px;
    }

    .add-api-key {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
    }

    .form-group {
      display: flex;
      gap: 12px;
    }

    .form-group input {
      flex: 2;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    .form-group select {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    /* API Docs */
    .api-docs {
      display: flex;
      gap: 12px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-tabs {
        flex-wrap: wrap;
      }
      
      .tab-btn {
        flex: 1 1 calc(50% - 4px);
      }
      
      .setting-item {
        flex-direction: column;
        gap: 16px;
      }
      
      .setting-control {
        width: 100%;
      }
      
      .form-group {
        flex-direction: column;
      }
      
      .api-docs {
        flex-direction: column;
      }
      
      .backup-item {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      
      .backup-actions {
        width: 100%;
        justify-content: flex-end;
      }
      
      .api-key-item {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
      
      .key-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab: string = 'general';
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';
  testEmailAddress = '';
  sendingTest = false;
  creatingBackup = false;
  newApiKeyName = '';
  newApiKeyPermissions = 'read';

  // Mock data - replace with actual API calls
  settings = {
    general: {
      appName: 'Admin Dashboard',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      maintenanceMode: false
    },
    security: {
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      require2FA: false,
      ipWhitelist: ''
    },
    notifications: {
      email: {
        newUser: true,
        failedLogin: true,
        userStatusChange: true,
        systemUpdates: false,
        dailySummary: false
      },
      inApp: {
        desktop: true,
        sound: 'chime'
      }
    },
    users: {
      allowRegistration: true,
      requireEmailVerification: true,
      defaultRole: 'USER',
      inactiveAccountDays: 90
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      encryption: 'tls',
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    },
    backup: {
      enabled: false,
      frequency: 'daily',
      retentionDays: 30,
      path: '/var/backups'
    },
    api: {
      rateLimit: 1000,
      allowedOrigins: ''
    }
  };

  recentBackups = [
    { name: 'backup-2024-01-15-1200.sql', date: new Date('2024-01-15T12:00:00'), size: '156 MB' },
    { name: 'backup-2024-01-14-1200.sql', date: new Date('2024-01-14T12:00:00'), size: '152 MB' },
    { name: 'backup-2024-01-13-1200.sql', date: new Date('2024-01-13T12:00:00'), size: '148 MB' }
  ];

  apiKeys = [
    { name: 'Production API Key', key: 'pk_live_••••••••••••••••', permissions: ['read', 'write'] },
    { name: 'Development API Key', key: 'pk_dev_••••••••••••••••', permissions: ['read'] }
  ];

  constructor(
    private tokenService: TokenService,
    private profileService: ProfileService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  saveGeneralSetting(field: string): void {
    this.saving = true;
    // Simulate API call
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `General setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveSecuritySetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `Security setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveNotificationSetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `Notification setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveInAppSetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `In-app setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveUserSetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `User setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveEmailSetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `Email setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveBackupSetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `Backup setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  saveAPISetting(field: string): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.successMessage = `API setting "${field}" saved successfully`;
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  sendTestEmail(): void {
    if (!this.testEmailAddress) return;
    
    this.sendingTest = true;
    // Simulate API call
    setTimeout(() => {
      this.sendingTest = false;
      this.successMessage = `Test email sent to ${this.testEmailAddress}`;
      this.testEmailAddress = '';
      setTimeout(() => this.successMessage = '', 3000);
    }, 1500);
  }

  createBackup(): void {
    this.creatingBackup = true;
    // Simulate API call
    setTimeout(() => {
      this.creatingBackup = false;
      this.successMessage = 'Backup created successfully';
      setTimeout(() => this.successMessage = '', 3000);
    }, 2000);
  }

  downloadBackup(backup: any): void {
    console.log('Downloading backup:', backup);
    // Implement download logic
  }

  restoreBackup(backup: any): void {
    console.log('Restoring backup:', backup);
    // Implement restore logic
  }

  copyApiKey(key: any): void {
    console.log('Copying API key:', key);
    // Implement copy to clipboard
  }

  regenerateApiKey(key: any): void {
    console.log('Regenerating API key:', key);
    // Implement regenerate logic
  }

  deleteApiKey(key: any): void {
    console.log('Deleting API key:', key);
    // Implement delete logic
  }

  generateApiKey(): void {
    if (!this.newApiKeyName) return;
    
    console.log('Generating API key:', {
      name: this.newApiKeyName,
      permissions: this.newApiKeyPermissions
    });
    
    // Simulate API call
    setTimeout(() => {
      this.successMessage = `API key "${this.newApiKeyName}" generated successfully`;
      this.newApiKeyName = '';
      setTimeout(() => this.successMessage = '', 3000);
    }, 500);
  }

  openApiDocs(): void {
    window.open('/api/docs', '_blank');
  }

  exportOpenApiSpec(): void {
    console.log('Exporting OpenAPI spec');
    // Implement export logic
  }
}