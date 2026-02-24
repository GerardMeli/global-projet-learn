// admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: './admin-dashboard.html',
  styles: ['./admin-dashboard.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  showLogoutModal = false;
  private routerSubscription: Subscription;

  constructor(
    private router: Router
  ) {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Close mobile menu on navigation
    });
  }

  ngOnInit(): void {
    // Check if user is admin - redirect if not
    this.checkAdminAccess();
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  checkAdminAccess(): void {
    // Implement your admin check logic here
    // Redirect to login if not admin
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/users')) return 'Users Management';
    if (url.includes('/chat-rooms')) return 'Chat Rooms';
    if (url.includes('/messages')) return 'Messages';
    if (url.includes('/files')) return 'Files';
    if (url.includes('/statistics')) return 'Statistics';
    if (url.includes('/settings')) return 'Settings';
    return 'Dashboard';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  confirmLogout(): void {
    this.showLogoutModal = true;
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  logout(): void {
    this.showLogoutModal = false;
    // Implement logout logic
    this.router.navigate(['/auth/login']);
  }
}