import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TokenService } from '../../core/services/users/token.service';
import { AuthService } from '../../core/services/users/auth.service';
import { AdminService } from '../../core/services/users/admin.service';
import { PrivateChatService } from '../../core/services/chat/private-chat.service';
import { Subscription } from 'rxjs';
import { UserContactDTO } from '../../core/models/chat/private-chat.model';
import { FileManagerService } from '../../core/services/file/file.service';
import { ChatComponent } from '../chat/chat-room/chat-room';

@Component({
    selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container" [class.authenticated]="isAuthenticated">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="nav-brand">
          <span class="brand-icon">⚡</span>
          <span class="brand-name">ManageUsers</span>
        </div>
        
        <div class="nav-menu">
          <!-- Public Links -->
          <a *ngIf="!isAuthenticated" routerLink="/auth/login" class="nav-link">Login</a>
          <a *ngIf="!isAuthenticated" routerLink="/auth/register" class="nav-link register-btn">Register</a>
          
          <!-- Authenticated User Menu -->
          <ng-container *ngIf="isAuthenticated">
            <!-- Role-based navigation -->
            <a *ngIf="isAdmin" routerLink="/admin/users" class="nav-link admin-link">
              <span class="material-icons">dashboard</span>
              Admin Dashboard
            </a>
            <a *ngIf="!isAdmin" routerLink="/profile" class="nav-link">
              <span class="material-icons">person</span>
              My Profile
            </a>
            <a routerLink="/chat/private/1" class="nav-link">
              <span class="material-icons">chat</span>
              Messages
              <span class="notification-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
            </a>
            
            <!-- User Menu Dropdown -->
            <div class="user-menu" (click)="toggleUserMenu()" (clickOutside)="userMenuOpen = false">
              <div class="user-avatar">
                {{ getUserInitials() }}
              </div>
              <span class="user-name">{{ getUserDisplayName() }}</span>
              <span class="material-icons dropdown-icon">arrow_drop_down</span>
              
              <!-- Dropdown Menu -->
              <div class="dropdown-menu" *ngIf="userMenuOpen">
                <a routerLink="/profile" (click)="userMenuOpen = false">
                  <span class="material-icons">person</span>
                  My Profile
                </a>
                <a *ngIf="!isAdmin" routerLink="/settings" (click)="userMenuOpen = false">
                  <span class="material-icons">settings</span>
                  Settings
                </a>
                <a *ngIf="isAdmin" routerLink="/admin/settings" (click)="userMenuOpen = false">
                  <span class="material-icons">admin_panel_settings</span>
                  Admin Settings
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="logout()">
                  <span class="material-icons">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </ng-container>
        </div>
      </nav>

      <!-- Hero Section (shown only to non-authenticated users) -->
      <section class="hero-section" *ngIf="!isAuthenticated">
        <div class="hero-content">
          <h1>Welcome to <span class="gradient-text">ManageUsers</span></h1>
          <p class="hero-subtitle">A complete user management solution with real-time chat, file sharing, and administrative controls</p>
          
          <div class="stats-banner">
            <div class="stat-item">
              <span class="stat-number">1,245</span>
              <span class="stat-label">Users</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">342</span>
              <span class="stat-label">Active Today</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">15k</span>
              <span class="stat-label">Messages</span>
            </div>
          </div>
          
          <div class="cta-buttons">
            <a routerLink="/auth/register" class="btn btn-primary">Get Started</a>
            <a routerLink="/auth/login" class="btn btn-outline">Sign In</a>
          </div>
        </div>
        
        <div class="hero-image">
          <div class="floating-card card-1">
            <span class="material-icons">people</span>
            <span>User Management</span>
          </div>
          <div class="floating-card card-2">
            <span class="material-icons">chat</span>
            <span>Real-time Chat</span>
          </div>
          <div class="floating-card card-3">
            <span class="material-icons">insert_drive_file</span>
            <span>File Sharing</span>
          </div>
        </div>
      </section>

      <!-- Authenticated User Dashboard -->
      <section class="dashboard-section" *ngIf="isAuthenticated">
        <div class="welcome-banner">
          <div>
            <h2>Welcome back, <span class="user-highlight">{{ getUserDisplayName() }}</span>!</h2>
            <p class="user-email">{{ userEmail }}</p>
          </div>
          <p class="user-role-badge" [class.admin]="isAdmin">
            {{ isAdmin ? 'Administrator' : 'Regular User' }}
          </p>
        </div>

        <!-- Admin Dashboard -->
        <div class="admin-dashboard" *ngIf="isAdmin">
          <h3>Admin Quick Actions</h3>
          <div class="quick-actions-grid">
            <a routerLink="/admin/users" class="quick-action-card">
              <span class="material-icons card-icon">people</span>
              <h4>Manage Users</h4>
              <p>View, edit, and manage all users</p>
              <span class="card-badge" *ngIf="totalUsers > 0">{{ totalUsers }} users</span>
            </a>
            
            <a routerLink="/admin/statistics" class="quick-action-card">
              <span class="material-icons card-icon">insights</span>
              <h4>Statistics</h4>
              <p>View platform analytics</p>
            </a>
            
            <a routerLink="/admin/settings" class="quick-action-card">
              <span class="material-icons card-icon">settings</span>
              <h4>System Settings</h4>
              <p>Configure application settings</p>
            </a>
            
            <a routerLink="/chat" class="quick-action-card">
              <span class="material-icons card-icon">chat</span>
              <h4>Chat Rooms</h4>
              <p>Monitor chat activity</p>
              <span class="card-badge" *ngIf="unreadCount > 0">{{ unreadCount }} unread</span>
            </a>
          </div>

          <!-- Recent Activity (Admin) -->
          <div class="recent-activity">
            <h3>Recent Activity</h3>
            <div class="activity-list">
              <div class="activity-item" *ngFor="let activity of recentActivities">
                <span class="material-icons activity-icon" [ngClass]="activity.type">{{ activity.icon }}</span>
                <div class="activity-details">
                  <p><strong>{{ activity.message }}</strong></p>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
              <div class="no-activity" *ngIf="recentActivities.length === 0">
                <span class="material-icons">info</span>
                <p>No recent activity</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Regular User Dashboard -->
        <div class="user-dashboard" *ngIf="!isAdmin">
          <div class="stats-grid">
            <div class="stat-card">
              <span class="material-icons stat-icon">chat</span>
              <div class="stat-info">
                <span class="stat-value">{{ contacts.length }}</span>
                <span class="stat-label">Active Chats</span>
              </div>
            </div>
            
            <div class="stat-card">
              <span class="material-icons stat-icon">insert_drive_file</span>
              <div class="stat-info">
                <span class="stat-value">{{ totalFiles }}</span>
                <span class="stat-label">Shared Files</span>
              </div>
            </div>
            
            <div class="stat-card">
              <span class="material-icons stat-icon">people</span>
              <div class="stat-info">
                <span class="stat-value">{{ contacts.length }}</span>
                <span class="stat-label">Contacts</span>
              </div>
            </div>
            
            <div class="stat-card">
              <span class="material-icons stat-icon">mark_as_unread</span>
              <div class="stat-info">
                <span class="stat-value">{{ unreadCount }}</span>
                <span class="stat-label">Unread</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions for Regular Users -->
          <h3>Quick Actions</h3>
          <div class="quick-actions-grid">
            <a routerLink="/chat" class="quick-action-card">
              <span class="material-icons card-icon">chat</span>
              <h4>Open Chat</h4>
              <p>Start a new conversation</p>
            </a>
            
            <a routerLink="/profile" class="quick-action-card">
              <span class="material-icons card-icon">person</span>
              <h4>My Profile</h4>
              <p>View and edit your profile</p>
            </a>
            
            <a routerLink="/chat/contacts" class="quick-action-card">
              <span class="material-icons card-icon">contacts</span>
              <h4>Contacts</h4>
              <p>Find and add contacts</p>
            </a>
          </div>

          <!-- Recent Chats -->
          <div class="recent-chats">
            <h3>Recent Conversations</h3>
            <div class="chat-list">
              <div class="chat-item" *ngFor="let contact of contacts" (click)="openChat(contact.userId)">
                <div class="chat-avatar">{{ getContactInitials(contact.username) }}</div>
                <div class="chat-info">
                  <p class="chat-name">{{ contact.username }}</p>
                  <p class="chat-preview">{{ contact.lastMessage || 'No messages yet' }}</p>
                </div>
                <div class="chat-meta">
                  <span class="chat-time">{{ contact.lastMessageTime | date:'shortTime' }}</span>
                  <span class="unread-badge" *ngIf="contact.unreadCount > 0">{{ contact.unreadCount }}</span>
                </div>
              </div>
              <div class="no-chats" *ngIf="contacts.length === 0">
                <span class="material-icons">chat</span>
                <p>No conversations yet</p>
                <a routerLink="/chat" class="start-chat-btn">Start Chatting</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section (shown to everyone) -->
      <section class="features-section">
        <h2>Powerful Features</h2>
        <div class="features-grid">
          <div class="feature-card">
            <span class="material-icons feature-icon">security</span>
            <h3>Secure Authentication</h3>
            <p>JWT-based authentication with role-based access control</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons feature-icon">chat</span>
            <h3>Real-time Chat</h3>
            <p>WebSocket-powered instant messaging with typing indicators</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons feature-icon">insert_drive_file</span>
            <h3>File Sharing</h3>
            <p>Share files with drag & drop support</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons feature-icon">admin_panel_settings</span>
            <h3>Admin Dashboard</h3>
            <p>Comprehensive user and system management</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons feature-icon">insights</span>
            <h3>Analytics</h3>
            <p>Detailed statistics and insights</p>
          </div>
          
          <div class="feature-card">
            <span class="material-icons feature-icon">notifications</span>
            <h3>Notifications</h3>
            <p>Real-time notifications and alerts</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>&copy; 2024 ManageUsers. All rights reserved.</p>
      </footer>

      <!-- Logout Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showLogoutModal" (click)="cancelLogout()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirm Logout</h3>
            <button class="close-btn" (click)="cancelLogout()">×</button>
          </div>
          <div class="modal-body">
            <span class="material-icons">logout</span>
            <p>Are you sure you want to logout?</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="cancelLogout()">Cancel</button>
            <button class="logout-confirm-btn" (click)="confirmLogout()">Logout</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .home-container.authenticated {
      background: #f5f5f5;
    }

    /* Navbar */
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .brand-icon {
      font-size: 2rem;
      animation: pulse 2s infinite;
    }

    .brand-name {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 20px;
      position: relative;
    }

    .nav-link {
      text-decoration: none;
      color: #4a5568;
      font-weight: 500;
      transition: color 0.3s;
      display: flex;
      align-items: center;
      gap: 5px;
      position: relative;
    }

    .nav-link:hover {
      color: #667eea;
    }

    .nav-link.admin-link {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
    }

    .register-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 8px 20px;
      border-radius: 25px;
    }

    .notification-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #e53e3e;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
    }

    /* User Menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 30px;
      background: #f7fafc;
      position: relative;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
    }

    .user-name {
      font-size: 14px;
      color: #4a5568;
    }

    .dropdown-icon {
      font-size: 20px;
      color: #718096;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 10px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      z-index: 1000;
      animation: slideDown 0.2s;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-menu a,
    .dropdown-menu button {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      color: #4a5568;
      text-decoration: none;
      transition: background 0.3s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
    }

    .dropdown-menu a:hover,
    .dropdown-menu button:hover {
      background: #f7fafc;
    }

    .dropdown-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 8px 0;
    }

    /* Hero Section */
    .hero-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4rem 6rem;
      min-height: 80vh;
      color: white;
    }

    .hero-content {
      flex: 1;
      max-width: 600px;
    }

    .hero-content h1 {
      font-size: 3.5rem;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .gradient-text {
      background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .stats-banner {
      display: flex;
      gap: 2rem;
      margin-bottom: 2rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 1.5rem;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-number {
      font-size: 1.8rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .cta-buttons {
      display: flex;
      gap: 20px;
    }

    .btn {
      padding: 12px 30px;
      border-radius: 30px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .btn-primary {
      background: white;
      color: #667eea;
    }

    .btn-outline {
      border: 2px solid white;
      color: white;
    }

    .hero-image {
      flex: 1;
      position: relative;
      height: 400px;
    }

    .floating-card {
      position: absolute;
      background: white;
      padding: 15px 25px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      animation: float 3s infinite ease-in-out;
      color: #4a5568;
    }

    .card-1 {
      top: 20%;
      left: 20%;
      animation-delay: 0s;
    }

    .card-2 {
      top: 50%;
      right: 20%;
      animation-delay: 0.5s;
    }

    .card-3 {
      bottom: 20%;
      left: 40%;
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* Dashboard Section */
    .dashboard-section {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .welcome-banner {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .welcome-banner h2 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .user-highlight {
      color: #667eea;
    }

    .user-email {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .user-role-badge {
      padding: 8px 20px;
      background: #f7fafc;
      border-radius: 30px;
      color: #4a5568;
      font-weight: 600;
    }

    .user-role-badge.admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    /* Quick Actions Grid */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 2rem;
    }

    .quick-action-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      text-decoration: none;
      color: inherit;
      transition: transform 0.3s, box-shadow 0.3s;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .quick-action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
    }

    .card-icon {
      font-size: 2.5rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    .quick-action-card h4 {
      margin: 0 0 0.5rem 0;
      color: #2d3748;
    }

    .quick-action-card p {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .card-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #667eea;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    /* Stats Grid for Regular Users */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2.5rem;
      color: #667eea;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: bold;
      color: #2d3748;
    }

    .stat-label {
      color: #718096;
      font-size: 0.9rem;
    }

    /* Recent Activity */
    .recent-activity, .recent-chats {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      margin-top: 2rem;
    }

    .recent-activity h3, .recent-chats h3 {
      margin: 0 0 1rem 0;
      color: #2d3748;
    }

    .activity-list, .chat-list {
      margin-top: 1rem;
    }

    .activity-item, .chat-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: background 0.3s;
    }

    .activity-item:last-child, .chat-item:last-child {
      border-bottom: none;
    }

    .activity-item:hover, .chat-item:hover {
      background: #f7fafc;
    }

    .activity-icon {
      padding: 8px;
      border-radius: 50%;
    }

    .activity-icon.person_add {
      background: #c6f6d5;
      color: #22543d;
    }

    .activity-icon.warning {
      background: #fed7d7;
      color: #742a2a;
    }

    .activity-icon.chat {
      background: #bee3f8;
      color: #2c5282;
    }

    .activity-details {
      flex: 1;
    }

    .activity-details p {
      margin: 0 0 4px 0;
      color: #2d3748;
    }

    .activity-time {
      font-size: 0.8rem;
      color: #a0aec0;
    }

    .no-activity, .no-chats {
      text-align: center;
      padding: 2rem;
      color: #a0aec0;
    }

    .no-activity .material-icons,
    .no-chats .material-icons {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .start-chat-btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 8px 20px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 20px;
    }

    .chat-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .chat-info {
      flex: 1;
    }

    .chat-name {
      margin: 0 0 4px 0;
      font-weight: 600;
      color: #2d3748;
    }

    .chat-preview {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .chat-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .chat-time {
      color: #a0aec0;
      font-size: 0.8rem;
    }

    .unread-badge {
      background: #e53e3e;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-size: 0.7rem;
      min-width: 18px;
      text-align: center;
    }

    /* Features Section */
    .features-section {
      padding: 4rem 2rem;
      background: white;
    }

    .features-section h2 {
      text-align: center;
      margin-bottom: 3rem;
      font-size: 2.5rem;
      color: #2d3748;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      text-align: center;
      padding: 2rem;
      border-radius: 12px;
      transition: transform 0.3s;
      background: #f7fafc;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      color: #667eea;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      margin: 0 0 1rem 0;
      color: #2d3748;
    }

    .feature-card p {
      margin: 0;
      color: #718096;
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 2rem;
      background: #2d3748;
      color: white;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.2s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      animation: slideUp 0.3s;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #2d3748;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #a0aec0;
    }

    .modal-body {
      padding: 24px;
      text-align: center;
    }

    .modal-body .material-icons {
      font-size: 48px;
      color: #e53e3e;
      margin-bottom: 16px;
    }

    .modal-body p {
      margin: 0;
      color: #4a5568;
    }

    .modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-btn, .logout-confirm-btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cancel-btn {
      background: white;
      border: 1px solid #e2e8f0;
      color: #4a5568;
    }

    .cancel-btn:hover {
      background: #f7fafc;
    }

    .logout-confirm-btn {
      background: #e53e3e;
      border: none;
      color: white;
    }

    .logout-confirm-btn:hover {
      background: #c53030;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        padding: 2rem;
        text-align: center;
      }
      
      .hero-content h1 {
        font-size: 2.5rem;
      }
      
      .stats-banner {
        justify-content: center;
      }
      
      .cta-buttons {
        justify-content: center;
      }
      
      .hero-image {
        width: 100%;
        margin-top: 3rem;
        height: 300px;
      }
      
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }
      
      .nav-menu {
        flex-wrap: wrap;
        justify-content: center;
      }
      
      .welcome-banner {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .quick-actions-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .chat-item {
        flex-wrap: wrap;
      }
      
      .chat-preview {
        max-width: 150px;
      }
    }
  `]
})

export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isAdmin = false;
  userEmail: string | null = null;
  userMenuOpen = false;
  showLogoutModal = false;
  
  // Data
  totalUsers = 0;
  unreadCount = 0;
  totalFiles = 0;
  contacts: UserContactDTO[] = [];
  
  recentActivities: Array<{icon: string, message: string, time: string, type: string}> = [];

  // Subscriptions
  private authSubscription: Subscription | null = null;
  private contactsSubscription: Subscription | null = null;

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private adminService: AdminService,
    private privateChatService: PrivateChatService,
    private fileService: FileManagerService,
    private router: Router
  ) {
    // No subscription in constructor - moved to ngOnInit
  }

  ngOnInit(): void {
    this.updateUserInfo();
    
    // Subscribe to auth changes (if your AuthService has such an observable)
    // If AuthService doesn't have authStatus$, we'll just check on init and after login/logout
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.updateUserInfo();
      this.loadUserData();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.contactsSubscription) {
      this.contactsSubscription.unsubscribe();
    }
  }

  private updateUserInfo(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.isAdmin = this.tokenService.isAdmin();
      this.userEmail = this.tokenService.getCurrentUserEmail();
    }
  }

  private loadUserData(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId) return;

    if (this.isAdmin) {
      // Load admin data
      this.adminService.getAllUsers().subscribe({
        next: (response) => {
          this.totalUsers = response.data.length;
        },
        error: (error) => console.error('Error loading users:', error)
      });

      // Mock recent activities - replace with actual API call
      this.recentActivities = [
        { icon: 'person_add', message: 'New user registered', time: '5 min ago', type: 'person_add' },
        { icon: 'warning', message: 'Failed login attempts detected', time: '1 hour ago', type: 'warning' },
        { icon: 'chat', message: 'New messages in General Chat', time: '2 hours ago', type: 'chat' }
      ];
    } else {
      // Load regular user data
      this.contactsSubscription = this.privateChatService.getContacts(userId).subscribe({
        next: (contacts) => {
          this.contacts = contacts;
          this.unreadCount = contacts.reduce((sum, c) => sum + c.unreadCount, 0);
        },
        error: (error) => console.error('Error loading contacts:', error)
      });

      // Load file stats for total files
      this.fileService.getStats().subscribe({
        next: (stats) => {
          if (stats.success) {
            this.totalFiles = stats.data.totalFiles;
          }
        },
        error: (error) => {
          console.error('Error loading file stats:', error);
          // Fallback to mock data
          this.totalFiles = 24;
        }
      });
    }
  }

  getUserDisplayName(): string {
    if (!this.userEmail) return 'User';
    return this.userEmail.split('@')[0];
  }

  getUserInitials(): string {
    if (!this.userEmail) return 'U';
    return this.userEmail.charAt(0).toUpperCase();
  }

  getContactInitials(username: string): string {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout(): void {
    this.userMenuOpen = false;
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    // After logout, update UI
    this.isAuthenticated = false;
    this.isAdmin = false;
    this.userEmail = null;
  }

  openChat(userId: number): void {
    this.router.navigate(['/chat/private', userId]);
  }
}