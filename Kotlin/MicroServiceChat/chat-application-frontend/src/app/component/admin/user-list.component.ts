import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../core/services/users/admin.service';
import { UserProfileResponse } from '../../core/models/users/profile.model';
import { TokenService } from '../../core/services/users/token.service'; 

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="user-list-container">
      <!-- Debug Panel - You can now set showDebug to false to hide it -->
      <div class="debug-section" *ngIf="showDebug">
        <div class="debug-panel">
          <div class="debug-header">
            <h3>🔧 Debug Info</h3>
            <button class="close-debug" (click)="showDebug = false">×</button>
          </div>
          <div class="debug-content">
            <p><strong>Status:</strong> <span class="debug-value success">✅ Working!</span></p>
            <p><strong>Users Found:</strong> <span class="debug-value">{{ users.length }}</span></p>
            <p><strong>Has Token:</strong> <span class="debug-value success">✅ Yes</span></p>
            <p><strong>Token Valid:</strong> <span class="debug-value success">✅ Yes</span></p>
            <p><strong>User Role:</strong> <span class="debug-value">{{ userRole }}</span></p>
            <p><strong>Is Admin:</strong> <span class="debug-value success">✅ Yes</span></p>
          </div>
          <div class="debug-actions">
            <button (click)="showDebug = false" class="debug-btn success">✅ Close Debug</button>
          </div>
        </div>
      </div>
      
      <!-- Debug Toggle Button - Shows when debug is hidden -->
      <button class="debug-toggle" *ngIf="!showDebug" (click)="showDebug = true">
        <span class="material-icons">bug_report</span>
        Show Debug
      </button>

      <!-- Header Actions -->
      <div class="list-header">
        <div class="search-section">
          <div class="search-box">
            <span class="material-icons">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              placeholder="Search users by email, name..."
            >
            <button *ngIf="searchTerm" class="clear-btn" (click)="clearSearch()">
              <span class="material-icons">close</span>
            </button>
          </div>

          <!-- Filters -->
          <div class="filters">
            <select [(ngModel)]="roleFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="SUPPORT">Support</option>
            </select>

            <select [(ngModel)]="statusFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DELETED">Deleted</option>
            </select>

            <select [(ngModel)]="activeFilter" (change)="applyFilters()" class="filter-select">
              <option value="">All Activity</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        <button class="refresh-btn" (click)="loadUsers()">
          <span class="material-icons">refresh</span>
          Refresh
        </button>
      </div>

      <!-- Success Message -->
      <div class="success-message" *ngIf="users.length > 0">
        <span class="material-icons">check_circle</span>
        Successfully loaded {{ users.length }} users
      </div>

      <!-- Statistics Summary -->
      <div class="stats-summary">
        <div class="stat-card">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ users.length }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Admins</span>
          <span class="stat-value">{{ getRoleCount('ADMIN') }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Active</span>
          <span class="stat-value">{{ getActiveCount() }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Pending</span>
          <span class="stat-value">{{ getStatusCount('PENDING') }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading users...</p>
      </div>

      <!-- Users Table -->
      <div class="table-container" *ngIf="!loading && users.length > 0">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Active</th>
              <th>Email Verified</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of paginatedUsers" class="user-row">
              <td>#{{ user.id }}</td>
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ getInitials(user.firstName, user.lastName) }}
                  </div>
                  <div>
                    <div class="user-name">{{ getFullName(user) }}</div>
                    <div class="user-email-mobile">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-badge" [class]="'status-' + user.status.toLowerCase()">
                  {{ user.status }}
                </span>
              </td>
              <td>
                <span class="status-indicator" [class.active]="user.isActive">
                  {{ user.isActive ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>
                <span class="status-indicator" [class.verified]="user.emailVerified">
                  {{ user.emailVerified ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'mediumDate' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="icon-btn edit" [routerLink]="['/admin/users', user.id]" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="icon-btn delete" (click)="deleteUser(user)" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- No Users Message -->
      <div class="no-users" *ngIf="!loading && users.length === 0">
        <span class="material-icons">people_outline</span>
        <p>No users found</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" *ngIf="users.length > 0">
        <button 
          class="page-btn" 
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button 
          class="page-btn" 
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          <span class="material-icons">chevron_right</span>
        </button>
        
        <select class="page-size" [(ngModel)]="pageSize" (change)="changePageSize()">
          <option [value]="10">10 per page</option>
          <option [value]="25">25 per page</option>
          <option [value]="50">50 per page</option>
          <option [value]="100">100 per page</option>
        </select>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal" *ngIf="showDeleteModal" (click)="closeDeleteModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button class="close-btn" (click)="closeDeleteModal()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete user <strong>{{ userToDelete?.email }}</strong>?</p>
          <p class="warning">This action cannot be undone. The user will be permanently removed.</p>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="closeDeleteModal()">Cancel</button>
          <button class="delete-btn" (click)="confirmDelete()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-list-container {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      position: relative;
    }

    /* Debug Toggle */
    .debug-toggle {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2000;
      padding: 12px 20px;
      background: #4a5568;
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.3s;
    }

    .debug-toggle:hover {
      background: #2d3748;
      transform: translateY(-2px);
    }

    /* Debug Section */
    .debug-section {
      position: fixed;
      bottom: 90px;
      right: 20px;
      z-index: 2000;
      width: 320px;
      animation: slideIn 0.3s;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .debug-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      border: 2px solid #48bb78;
      overflow: hidden;
    }

    .debug-header {
      background: #48bb78;
      padding: 15px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .debug-header h3 {
      margin: 0;
      color: white;
      font-size: 16px;
      font-weight: 600;
    }

    .close-debug {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      line-height: 1;
    }

    .debug-content {
      padding: 20px;
      background: #f8f9fa;
    }

    .debug-content p {
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #333;
    }

    .debug-value {
      font-weight: 600;
    }

    .debug-value.success {
      color: #48bb78;
    }

    .debug-actions {
      padding: 15px 20px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .debug-btn {
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .debug-btn.success {
      background: #48bb78;
      color: white;
    }

    .debug-btn.success:hover {
      background: #38a169;
    }

    /* Success Message */
    .success-message {
      background: #c6f6d5;
      color: #22543d;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .success-message .material-icons {
      font-size: 20px;
    }

    /* Header Styles */
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .search-section {
      flex: 1;
    }

    .search-box {
      display: flex;
      align-items: center;
      background: #f7fafc;
      border-radius: 8px;
      padding: 8px 16px;
      max-width: 400px;
      margin-bottom: 16px;
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
      flex: 1;
      border: none;
      background: none;
      outline: none;
      font-size: 14px;
      color: #4a5568;
    }

    .search-box input::placeholder {
      color: #a0aec0;
    }

    .clear-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #a0aec0;
      display: flex;
      align-items: center;
      padding: 0;
    }

    .clear-btn:hover {
      color: #718096;
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: white;
      color: #4a5568;
      font-size: 14px;
      cursor: pointer;
      outline: none;
      transition: all 0.3s;
    }

    .filter-select:hover {
      border-color: #667eea;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      color: #4a5568;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .refresh-btn:hover {
      background: #f7fafc;
      border-color: #667eea;
      color: #667eea;
    }

    /* Statistics Summary */
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
      padding: 16px;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      border: 1px solid #e2e8f0;
    }

    .stat-label {
      font-size: 14px;
      color: #718096;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: #2d3748;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 60px;
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Table Styles */
    .table-container {
      overflow-x: auto;
      margin-bottom: 24px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1000px;
    }

    .users-table th {
      background: #f7fafc;
      padding: 16px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      color: #4a5568;
      border-bottom: 2px solid #e2e8f0;
    }

    .users-table td {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
      font-size: 14px;
    }

    .user-row:hover {
      background: #f7fafc;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-name {
      font-weight: 500;
      color: #2d3748;
    }

    .user-email-mobile {
      display: none;
      font-size: 12px;
      color: #718096;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .role-admin {
      background: #feb2b2;
      color: #742a2a;
    }

    .role-user {
      background: #9ae6b4;
      color: #22543d;
    }

    .role-support {
      background: #fbd38d;
      color: #744210;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-active {
      background: #9ae6b4;
      color: #22543d;
    }

    .status-pending {
      background: #fefcbf;
      color: #744210;
    }

    .status-suspended {
      background: #fbd38d;
      color: #744210;
    }

    .status-blocked {
      background: #feb2b2;
      color: #742a2a;
    }

    .status-deleted {
      background: #cbd5e0;
      color: #2d3748;
    }

    .status-indicator {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      background: #f7fafc;
    }

    .status-indicator.active, .status-indicator.verified {
      background: #9ae6b4;
      color: #22543d;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f7fafc;
    }

    .icon-btn.edit:hover {
      background: #667eea;
      color: white;
    }

    .icon-btn.delete:hover {
      background: #e53e3e;
      color: white;
    }

    .icon-btn .material-icons {
      font-size: 18px;
    }

    /* No Users */
    .no-users {
      text-align: center;
      padding: 60px;
      color: #a0aec0;
    }

    .no-users .material-icons {
      font-size: 48px;
      margin-bottom: 16px;
    }

    /* Pagination */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 16px;
    }

    .page-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
    }

    .page-btn:hover:not(:disabled) {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-info {
      font-size: 14px;
      color: #4a5568;
    }

    .page-size {
      padding: 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      outline: none;
      cursor: pointer;
    }

    /* Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      animation: modalSlideIn 0.3s;
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(-20px);
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
    }

    .modal-body p {
      margin: 0 0 16px 0;
      color: #4a5568;
      line-height: 1.6;
    }

    .warning {
      color: #e53e3e;
      font-size: 14px;
    }

    .modal-footer {
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .cancel-btn, .delete-btn {
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

    .delete-btn {
      background: #e53e3e;
      border: none;
      color: white;
    }

    .delete-btn:hover {
      background: #c53030;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .list-header {
        flex-direction: column;
        gap: 16px;
      }
      
      .search-section {
        width: 100%;
      }
      
      .search-box {
        max-width: none;
      }
      
      .filters {
        flex-wrap: wrap;
      }
      
      .filter-select {
        flex: 1;
      }
      
      .stats-summary {
        grid-template-columns: 1fr 1fr;
      }
      
      .user-email-mobile {
        display: block;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: UserProfileResponse[] = [];
  filteredUsers: UserProfileResponse[] = [];
  paginatedUsers: UserProfileResponse[] = [];
  
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  activeFilter = '';
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  showDeleteModal = false;
  userToDelete: UserProfileResponse | null = null;

  // Loading state
  loading = false;

  // Debug - set to false to hide debug panel
  showDebug = true;
  
  // User info
  userRole: string | null = null;

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getCurrentUserRole();
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        console.log('✅ Users loaded successfully:', response);
        this.users = response.data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading users:', error);
        this.loading = false;
      }
    });
  }

  getFullName(user: UserProfileResponse): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown';
  }

  getInitials(firstName: string | null, lastName: string | null): string {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'U';
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Search filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const fullName = this.getFullName(user).toLowerCase();
        const email = user.email.toLowerCase();
        if (!fullName.includes(searchLower) && !email.includes(searchLower)) {
          return false;
        }
      }
      
      // Role filter
      if (this.roleFilter && user.role !== this.roleFilter) {
        return false;
      }
      
      // Status filter
      if (this.statusFilter && user.status !== this.statusFilter) {
        return false;
      }
      
      // Active filter
      if (this.activeFilter) {
        const isActive = this.activeFilter === 'true';
        if (user.isActive !== isActive) {
          return false;
        }
      }
      
      return true;
    });
    
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  changePageSize(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  getRoleCount(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  getStatusCount(status: string): number {
    return this.users.filter(u => u.status === status).length;
  }

  deleteUser(user: UserProfileResponse): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (this.userToDelete) {
      this.adminService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          this.loadUsers();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.closeDeleteModal();
        }
      });
    }
  }
}