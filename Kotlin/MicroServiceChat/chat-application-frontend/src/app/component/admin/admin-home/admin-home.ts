// admin-home.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule }  from '@angular/router';
import { Subject }       from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AdminService } from '../../../core/services/users/admin.service';

export interface DashStat {
  label: string; value: number | string;
  icon: string; color: string; bg: string; route?: string;
}
export interface RecentUser {
  id: number; firstName: string; lastName: string;
  email: string; role: string; status: string; createdAt: string;
}
export interface QuickAction {
  label: string; description: string;
  icon: string; color: string; bg: string; route: string;
}

@Component({
  selector:        'app-admin-home',
  standalone:      true,
  imports:         [CommonModule, RouterModule],
  templateUrl:     './admin-home.html',
  styleUrls:       ['./admin-home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeComponent implements OnInit, OnDestroy {

  loading       = true;
  error         = '';
  lastRefreshed = new Date();

  stats: DashStat[] = [
    { label: 'Total utilisateurs', value: '—', icon: 'group',              color: '#2563eb', bg: '#eff6ff', route: 'users'    },
    { label: 'Actifs',             value: '—', icon: 'check_circle',       color: '#16a34a', bg: '#f0fdf4'                    },
    { label: 'Administrateurs',    value: '—', icon: 'admin_panel_settings',color: '#7c3aed', bg: '#f5f3ff'                   },
    { label: 'En attente',         value: '—', icon: 'hourglass_empty',    color: '#d97706', bg: '#fffbeb'                    },
    { label: 'Chat Rooms',         value: '—', icon: 'forum',              color: '#0891b2', bg: '#ecfeff', route: 'rooms'    },
    { label: 'Messages',           value: '—', icon: 'chat',               color: '#be185d', bg: '#fdf2f8', route: 'messages' },
  ];

  recentUsers: RecentUser[] = [];

  readonly quickActions: QuickAction[] = [
    { label: 'Utilisateurs', description: '', icon: 'manage_accounts', color: '#2563eb', bg: '#eff6ff', route: '../users'     },
    { label: 'Chat Rooms',   description: '', icon: 'forum',           color: '#0891b2', bg: '#ecfeff', route: '../rooms'     },
    { label: 'Messages',     description: '', icon: 'chat',            color: '#be185d', bg: '#fdf2f8', route: '../messages'  },
    { label: 'Fichiers',     description: '', icon: 'folder_open',     color: '#d97706', bg: '#fffbeb', route: '../files'     },
    { label: 'Statistiques', description: '', icon: 'bar_chart',       color: '#7c3aed', bg: '#f5f3ff', route: '../statistics'},
    { label: 'Paramètres',   description: '', icon: 'settings',        color: '#475569', bg: '#f8fafc', route: '../settings'  },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly adminService: AdminService,
    private readonly cdr:          ChangeDetectorRef,
  ) {}

  ngOnInit():    void { this.loadData(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadData(): void {
    this.loading = true;
    this.error   = '';
    this.cdr.markForCheck();

    this.adminService.getAllUsers()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (res) => {
          const users = res.data || [];
          this.stats[0].value = users.length;
          this.stats[1].value = users.filter((u: any) => u.isActive).length;
          this.stats[2].value = users.filter((u: any) => u.role === 'ADMIN').length;
          this.stats[3].value = users.filter((u: any) => u.status === 'PENDING').length;
          this.recentUsers = [...users]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 8) as RecentUser[];
          this.lastRefreshed = new Date();
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger les données. Vérifiez votre connexion.';
          this.cdr.markForCheck();
        },
      });
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getInitials(u: RecentUser): string {
    return ((u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')).toUpperCase() || 'U';
  }
  getFullName(u: RecentUser): string {
    return [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Utilisateur';
  }
  getRoleBadgeClass(r: string): string {
    return ({ ADMIN:'badge--admin', USER:'badge--user', SUPPORT:'badge--support' } as any)[r] || '';
  }
  getStatusBadgeClass(s: string): string {
    return ({ ACTIVE:'badge--active', PENDING:'badge--pending', SUSPENDED:'badge--suspended', BLOCKED:'badge--blocked', DELETED:'badge--deleted' } as any)[s] || '';
  }
  getStatusLabel(s: string): string {
    return ({ ACTIVE:'Actif', PENDING:'En attente', SUSPENDED:'Suspendu', BLOCKED:'Bloqué', DELETED:'Supprimé' } as any)[s] || s;
  }
  getRoleLabel(r: string): string {
    return ({ ADMIN:'Admin', USER:'Utilisateur', SUPPORT:'Support' } as any)[r] || r;
  }

  private readonly GRADIENTS = [
    'linear-gradient(135deg,#2563eb,#7c3aed)',
    'linear-gradient(135deg,#0891b2,#2563eb)',
    'linear-gradient(135deg,#16a34a,#0891b2)',
    'linear-gradient(135deg,#d97706,#ef4444)',
    'linear-gradient(135deg,#be185d,#7c3aed)',
  ];
  getGradient(id: number): string { return this.GRADIENTS[id % this.GRADIENTS.length]; }

  trackByStat  (_: number, s: DashStat):    string { return s.label; }
  trackByUser  (_: number, u: RecentUser):  number { return u.id; }
  trackByAction(_: number, a: QuickAction): string { return a.route; }
}