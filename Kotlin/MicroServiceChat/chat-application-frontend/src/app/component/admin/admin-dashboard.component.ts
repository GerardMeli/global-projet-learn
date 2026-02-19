import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TokenService } from '../../core/services/users/token.service';
import { AuthService } from '../../core/services/users/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip'; // Add this import

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MatTooltipModule, // Add MatTooltipModule here],
    FormsModule
  ],
  template: `
    <div class="admin-dashboard" [class.sidebar-collapsed]="sidebarCollapsed">
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" *ngIf="isMobile">
        <span class="material-icons">{{ mobileMenuOpen ? 'close' : 'menu' }}</span>
      </button>

      <!-- Sidebar -->
      <aside class="sidebar" [class.mobile-open]="mobileMenuOpen" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo-area">
            <span class="logo-icon">⚡</span>
            <h2 *ngIf="!sidebarCollapsed">Admin Panel</h2>
          </div>
          
          <!-- Collapse Toggle (Desktop) -->
          <button class="collapse-toggle" (click)="toggleSidebar()" *ngIf="!isMobile">
            <span class="material-icons">{{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
        </div>

        <!-- User Info -->
        <div class="user-info" *ngIf="!sidebarCollapsed">
          <div class="user-avatar">
            {{ getInitials() }}
          </div>
          <div class="user-details">
            <span class="user-name">{{ getUserName() }}</span>
            <span class="user-email">{{ userEmail }}</span>
            <span class="user-role-badge">Administrator</span>
          </div>
        </div>

        <!-- Compact User Info for Collapsed Sidebar -->
        <div class="user-info-compact" *ngIf="sidebarCollapsed" [matTooltip]="userEmail || ''" matTooltipPosition="right">
          <div class="user-avatar small">
            {{ getInitials() }}
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">
            <span class="material-icons">people</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Users Management</span>
          </a>
          
          <a routerLink="/admin/statistics" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-icons">insights</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Statistics</span>
          </a>
          
          <a routerLink="/admin/settings" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-icons">settings</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Settings</span>
          </a>
          
          <a routerLink="/admin/profile" routerLinkActive="active" class="nav-item" (click)="closeMobileMenu()">
            <span class="material-icons">person</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">My Profile</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="confirmLogout()">
            <span class="material-icons">logout</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Logout</span>
          </button>
          
          <!-- Theme Toggle (Optional) -->
          <button class="theme-toggle" (click)="toggleTheme()" *ngIf="!sidebarCollapsed">
            <span class="material-icons">{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</span>
            <span class="nav-label">{{ isDarkTheme ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content" [class.expanded]="sidebarCollapsed">
        <header class="content-header">
          <div class="header-left">
            <h1>{{ currentPage }}</h1>
            <span class="page-indicator" *ngIf="!isMobile">{{ getPageDescription() }}</span>
          </div>
          
          <div class="header-actions">
            <!-- Search (optional) -->
            <div class="search-box" *ngIf="showSearch && !isMobile">
              <span class="material-icons">search</span>
              <input 
                type="text" 
                placeholder="Search..." 
                [(ngModel)]="searchQuery"
                (keyup.enter)="onSearch()"
              >
            </div>
            
            <!-- Notifications -->
            <div class="notification-icon" (click)="toggleNotifications()">
              <span class="material-icons">notifications</span>
              <span class="notification-badge" *ngIf="notificationCount > 0">{{ notificationCount }}</span>
            </div>
            
            <!-- User Menu -->
            <div class="user-menu" (click)="toggleUserMenu()" #userMenu>
              <div class="user-avatar small">
                {{ getInitials() }}
              </div>
              <span class="material-icons" *ngIf="!isMobile">arrow_drop_down</span>
              
              <!-- Dropdown Menu -->
              <div class="dropdown-menu" *ngIf="userMenuOpen">
                <a routerLink="/admin/profile" (click)="userMenuOpen = false">
                  <span class="material-icons">person</span>
                  My Profile
                </a>
                <a routerLink="/admin/settings" (click)="userMenuOpen = false">
                  <span class="material-icons">settings</span>
                  Settings
                </a>
                <div class="dropdown-divider"></div>
                <button (click)="confirmLogout()">
                  <span class="material-icons">logout</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Breadcrumb -->
        <div class="breadcrumb" *ngIf="!isMobile">
          <span class="material-icons">home</span>
          <span>Admin</span>
          <span class="material-icons">chevron_right</span>
          <span class="current">{{ currentPage }}</span>
        </div>
        
        <div class="content-body">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Logout Confirmation Modal -->
      <div class="modal-overlay" *ngIf="showLogoutModal" (click)="cancelLogout()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirm Logout</h3>
            <button class="close-btn" (click)="cancelLogout()">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <span class="material-icons">logout</span>
            <p>Are you sure you want to logout?</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="cancelLogout()">Cancel</button>
            <button class="logout-confirm-btn" (click)="logout()">
              <span class="material-icons">logout</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Notifications Panel -->
      <div class="notifications-panel" *ngIf="showNotifications" (clickOutside)="closeNotifications()">
        <div class="notifications-header">
          <h3>Notifications</h3>
          <button class="mark-read" (click)="markAllAsRead()">Mark all as read</button>
        </div>
        <div class="notifications-list">
          <div class="notification-item unread" *ngFor="let notif of notifications">
            <div class="notification-icon">
              <span class="material-icons">{{ notif.icon }}</span>
            </div>
            <div class="notification-content">
              <p>{{ notif.message }}</p>
              <span class="notification-time">{{ notif.time }}</span>
            </div>
          </div>
          <div class="no-notifications" *ngIf="notifications.length === 0">
            <span class="material-icons">notifications_off</span>
            <p>No notifications</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      transition: all 0.3s ease;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1100;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .mobile-menu-toggle:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    /* Sidebar Styles */
    .sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 1000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar.mobile-open {
      transform: translateX(0);
    }

    .sidebar-header {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 24px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .collapse-toggle {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: #f7fafc;
      color: #4a5568;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .collapse-toggle:hover {
      background: #edf2f7;
      color: #667eea;
    }

    /* User Info */
    .user-info {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .user-info-compact {
      padding: 16px 0;
      display: flex;
      justify-content: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .user-avatar {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .user-avatar.small {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .user-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
    }

    .user-email {
      font-size: 12px;
      color: #718096;
    }

    .user-role-badge {
      font-size: 11px;
      color: #667eea;
      background: #ebf4ff;
      padding: 2px 8px;
      border-radius: 12px;
      display: inline-block;
      width: fit-content;
    }

    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 16px 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      color: #4a5568;
      text-decoration: none;
      transition: all 0.3s;
      font-weight: 500;
      cursor: pointer;
      position: relative;
      margin: 4px 12px;
      border-radius: 8px;
    }

    .nav-item:hover {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      color: #667eea;
      transform: translateX(4px);
    }

    .nav-item.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 70%;
      background: white;
      border-radius: 0 4px 4px 0;
    }

    .nav-item .material-icons {
      font-size: 20px;
    }

    .nav-label {
      white-space: nowrap;
      transition: opacity 0.3s;
    }

    .sidebar.collapsed .nav-label {
      opacity: 0;
      pointer-events: none;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.08);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .logout-btn, .theme-toggle {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 12px;
      border: none;
      background: none;
      color: #4a5568;
      font-weight: 500;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.3s;
      width: 100%;
    }

    .logout-btn:hover {
      background: #fff5f5;
      color: #e53e3e;
    }

    .theme-toggle:hover {
      background: #f7fafc;
      color: #667eea;
    }

    .logout-btn .material-icons,
    .theme-toggle .material-icons {
      font-size: 20px;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 280px;
      min-height: 100vh;
      background: #f7fafc;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .main-content.expanded {
      margin-left: 80px;
    }

    /* Content Header */
    .content-header {
      background: white;
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #2d3748;
    }

    .page-indicator {
      font-size: 14px;
      color: #a0aec0;
      margin-left: 12px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    /* Search Box */
    .search-box {
      display: flex;
      align-items: center;
      background: #f7fafc;
      border-radius: 8px;
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s;
    }

    .search-box:focus-within {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .search-box .material-icons {
      color: #a0aec0;
      margin-right: 8px;
    }

    .search-box input {
      border: none;
      background: none;
      outline: none;
      font-size: 14px;
      color: #4a5568;
      width: 200px;
    }

    .search-box input::placeholder {
      color: #a0aec0;
    }

    /* Notification Icon */
    .notification-icon {
      position: relative;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.3s;
    }

    .notification-icon:hover {
      background: #f7fafc;
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      background: #e53e3e;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    /* User Menu */
    .user-menu {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.3s;
      position: relative;
    }

    .user-menu:hover {
      background: #f7fafc;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
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
      gap: 12px;
      padding: 12px 16px;
      color: #4a5568;
      text-decoration: none;
      transition: background 0.3s;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      font-size: 14px;
      cursor: pointer;
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

    /* Breadcrumb */
    .breadcrumb {
      padding: 16px 32px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #718096;
      font-size: 14px;
    }

    .breadcrumb .material-icons {
      font-size: 18px;
    }

    .breadcrumb .current {
      color: #2d3748;
      font-weight: 500;
    }

    /* Content Body */
    .content-body {
      padding: 32px;
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
      font-size: 18px;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #a0aec0;
      display: flex;
      align-items: center;
      padding: 4px;
    }

    .close-btn:hover {
      color: #718096;
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
      font-size: 16px;
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
      display: flex;
      align-items: center;
      gap: 8px;
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

    /* Notifications Panel */
    .notifications-panel {
      position: fixed;
      top: 80px;
      right: 32px;
      width: 360px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: slideIn 0.3s;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notifications-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notifications-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 16px;
    }

    .mark-read {
      background: none;
      border: none;
      color: #667eea;
      font-size: 12px;
      cursor: pointer;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      padding: 16px 20px;
      display: flex;
      gap: 12px;
      border-bottom: 1px solid #f7fafc;
      transition: background 0.3s;
    }

    .notification-item:hover {
      background: #f7fafc;
    }

    .notification-item.unread {
      background: #ebf8ff;
    }

    .notification-icon .material-icons {
      color: #667eea;
    }

    .notification-content {
      flex: 1;
    }

    .notification-content p {
      margin: 0 0 4px 0;
      color: #2d3748;
      font-size: 14px;
    }

    .notification-time {
      font-size: 12px;
      color: #a0aec0;
    }

    .no-notifications {
      padding: 40px 20px;
      text-align: center;
      color: #a0aec0;
    }

    .no-notifications .material-icons {
      font-size: 32px;
      margin-bottom: 8px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 280px;
      }
      
      .sidebar.mobile-open {
        transform: translateX(0);
      }
      
      .main-content {
        margin-left: 0;
      }
      
      .main-content.expanded {
        margin-left: 0;
      }
      
      .content-header {
        padding: 16px 20px;
      }
      
      .content-body {
        padding: 16px;
      }
      
      .notifications-panel {
        width: 90%;
        right: 5%;
        top: 70px;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  userEmail: string | null = '';
  currentPage = 'Users Management';
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  isMobile = window.innerWidth <= 768;
  showLogoutModal = false;
  showNotifications = false;
  userMenuOpen = false;
  isDarkTheme = false;
  showSearch = true;
  searchQuery = '';
  
  // Mock notifications - replace with real data
  notificationCount = 3;
  notifications = [
    { icon: 'person_add', message: 'New user registered', time: '5 min ago' },
    { icon: 'warning', message: 'Failed login attempts detected', time: '1 hour ago' },
    { icon: 'update', message: 'System update completed', time: '2 hours ago' }
  ];

  constructor(
    private tokenService: TokenService,
    private authService: AuthService,
    private router: Router
  ) {
    // Update current page based on route
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentPage(event.url);
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  ngOnInit(): void {
    this.userEmail = this.tokenService.getCurrentUserEmail();
    this.updateCurrentPage(this.router.url);
    this.loadThemePreference();
  }

  updateCurrentPage(url: string): void {
    if (url.includes('/users')) {
      this.currentPage = 'Users Management';
    } else if (url.includes('/statistics')) {
      this.currentPage = 'Statistics';
    } else if (url.includes('/settings')) {
      this.currentPage = 'Settings';
    } else if (url.includes('/profile')) {
      this.currentPage = 'My Profile';
    } else {
      this.currentPage = 'Dashboard';
    }
  }

  getPageDescription(): string {
    switch(this.currentPage) {
      case 'Users Management':
        return 'Manage system users and permissions';
      case 'Statistics':
        return 'View platform analytics and metrics';
      case 'Settings':
        return 'Configure system preferences';
      case 'My Profile':
        return 'Edit your personal information';
      default:
        return 'Admin dashboard overview';
    }
  }

  getUserName(): string {
    // Extract name from email or use stored name
    return this.userEmail ? this.userEmail.split('@')[0] : 'Admin User';
  }

  getInitials(): string {
    if (!this.userEmail) return 'A';
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    if (this.isMobile) {
      this.mobileMenuOpen = false;
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    document.body.classList.toggle('dark-theme', this.isDarkTheme);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.userMenuOpen = false;
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  markAllAsRead(): void {
    this.notificationCount = 0;
    // Implement actual mark as read logic
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.showNotifications = false;
    }
  }

  onSearch(): void {
    console.log('Searching for:', this.searchQuery);
    // Implement search logic
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
    this.userMenuOpen = false;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
  }
}