// admin-dashboard.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { TokenService } from '../../../core/services/users/token.service';
import { AuthService }  from '../../../core/services/users/auth.service';

export interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  badge?: number;
}

export interface HomeAnchor {
  label:  string;
  anchor: string;
  icon:   string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'app-admin-dashboard',
  standalone:      true,
  imports:         [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl:     './admin-dashboard.html',
  styleUrls:       ['./admin-dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  // ── Sidebar state ──────────────────────────────────────────────────────────
  sidebarCollapsed = false;
  mobileOpen       = false;
  isMobile         = window.innerWidth < 768;

  // ── Logout modal ───────────────────────────────────────────────────────────
  showLogoutModal = false;
  loggingOut      = false;

  // ── Page title ─────────────────────────────────────────────────────────────
  currentPageTitle = 'Tableau de bord';
  isHome           = true;

  private readonly destroy$ = new Subject<void>();

  // ── Navigation items ───────────────────────────────────────────────────────
  readonly navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: 'dashboard',           route: 'home'       },
    { label: 'Utilisateurs',    icon: 'manage_accounts',     route: 'users'      },
    { label: 'Chat Rooms',      icon: 'forum',               route: 'rooms'      },
    { label: 'Messages',        icon: 'chat_bubble_outline', route: 'messages'   },
    { label: 'Fichiers',        icon: 'folder_open',         route: 'files'      },
    { label: 'Statistiques',    icon: 'bar_chart',           route: 'statistics' },
  ];

  readonly footerItems: NavItem[] = [
    { label: 'Paramètres', icon: 'settings',       route: 'settings' },
    { label: 'Mon profil', icon: 'account_circle', route: 'profile'  },
  ];

  // ── Ancres Home ────────────────────────────────────────────────────────────
  readonly homeAnchors: HomeAnchor[] = [
    { label: 'Vue globale',  anchor: 'overview', icon: 'dashboard'         },
    { label: 'Utilisateurs', anchor: 'users',    icon: 'group'             },
    { label: 'Chat & Msgs',  anchor: 'chat',     icon: 'forum'             },
    { label: 'Fichiers',     anchor: 'files',    icon: 'folder_open'       },
    { label: 'Activité',     anchor: 'activity', icon: 'timeline'          },
    { label: 'Actions',      anchor: 'actions',  icon: 'bolt'              },
  ];

  private readonly titleMap: Record<string, string> = {
    home:       'Tableau de bord',
    users:      'Gestion des utilisateurs',
    rooms:      'Chat Rooms',
    messages:   'Messages',
    files:      'Fichiers',
    statistics: 'Statistiques',
    settings:   'Paramètres',
    profile:    'Mon profil',
  };

  constructor(
    private readonly authService:  AuthService,
    private readonly tokenService: TokenService,
    private readonly router:       Router,
    private readonly cdr:          ChangeDetectorRef,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$),
    ).subscribe((e: any) => {
      const seg             = (e.urlAfterRedirects as string).split('/').pop()?.split('#')[0] || 'home';
      this.currentPageTitle = this.titleMap[seg] ?? 'Admin';
      this.isHome           = seg === 'home' || seg === '';
      this.mobileOpen       = false;
      this.cdr.markForCheck();
    });

    const seg             = this.router.url.split('/').pop()?.split('#')[0] || 'home';
    this.currentPageTitle = this.titleMap[seg] ?? 'Admin';
    this.isHome           = seg === 'home' || seg === '';
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  // ── Window resize ──────────────────────────────────────────────────────────
  @HostListener('window:resize')
  onResize(): void {
    const was     = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    if (was !== this.isMobile) this.cdr.markForCheck();
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  toggleSidebar(): void {
    if (this.isMobile) this.mobileOpen = !this.mobileOpen;
    else               this.sidebarCollapsed = !this.sidebarCollapsed;
    this.cdr.markForCheck();
  }

  closeMobileSidebar(): void { this.mobileOpen = false; this.cdr.markForCheck(); }

  // ── Anchor navigation (home sections) ─────────────────────────────────────
  scrollToAnchor(anchor: string): void {
    if (!this.isHome) {
      this.router.navigate(['admin', 'home']).then(() =>
        setTimeout(() => this.doScroll(anchor), 200)
      );
    } else {
      this.doScroll(anchor);
    }
    if (this.isMobile) this.mobileOpen = false;
  }

  private doScroll(anchor: string): void {
    const el = document.getElementById(anchor);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Profile helpers ────────────────────────────────────────────────────────
  getAdminInitials(): string {
    const t = this.tokenService.getCurrentUserClaims();
    return ((t?.firstName?.charAt(0) || '') + (t?.lastName?.charAt(0) || '')).toUpperCase() || 'A';
  }

  getAdminName(): string {
    const t = this.tokenService.getCurrentUserClaims();
    return [t?.firstName, t?.lastName].filter(Boolean).join(' ') || 'Administrateur';
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  openLogoutModal():  void { this.showLogoutModal = true;  this.cdr.markForCheck(); }
  closeLogoutModal(): void { this.showLogoutModal = false; this.cdr.markForCheck(); }

  confirmLogout(): void {
    this.loggingOut = true;
    this.cdr.markForCheck();
    this.authService.logout();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { if (this.showLogoutModal) this.closeLogoutModal(); }
}