// landing.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AdminService } from '../../core/services/users/admin.service';
import { AuthService }  from '../../core/services/users/auth.service';
import { TokenService } from '../../core/services/users/token.service';

export interface LandingStat {
  icon: string; color: string; bg: string;
  value: number | string; label: string; loading: boolean;
}

@Component({
  selector:        'app-landing',
  standalone:      true,
  imports:         [CommonModule, RouterModule],
  templateUrl:     './landing-component.html',
  styleUrls:       ['./landing-component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit, OnDestroy {

  currentYear    = new Date().getFullYear();
  mobileMenuOpen = false;
  isLoggedIn     = false;
  isAdmin        = false;
  userName       = '';

  private readonly destroy$ = new Subject<void>();

  // ── Stats dynamiques (BDD) ────────────────────────────────────────────────
  heroStats: LandingStat[] = [
    { icon: 'group',                color: '#2563eb', bg: '#eff6ff', value: '—', label: 'Utilisateurs',    loading: true  },
    { icon: 'check_circle',         color: '#16a34a', bg: '#f0fdf4', value: '—', label: 'Actifs',          loading: true  },
    { icon: 'admin_panel_settings', color: '#7c3aed', bg: '#f5f3ff', value: '—', label: 'Administrateurs', loading: true  },
    { icon: 'hourglass_empty',      color: '#d97706', bg: '#fffbeb', value: '—', label: 'En attente',      loading: true  },
    { icon: 'security',             color: '#059669', bg: '#ecfdf5', value: 'JWT',  label: 'Auth sécurisée',  loading: false },
    { icon: 'speed',                color: '#0891b2', bg: '#ecfeff', value: 'REST', label: 'API Spring Boot', loading: false },
  ];

  // ── Accès rapide Admin ────────────────────────────────────────────────────
  readonly adminLinks = [
    { icon: 'dashboard',           label: 'Tableau de bord',   route: '/admin/home',
      desc: 'Vue d\'ensemble de la plateforme', color: '#2563eb', bg: '#eff6ff' },
    { icon: 'manage_accounts',     label: 'Utilisateurs',      route: '/admin/users',
      desc: 'Gérer les comptes et les rôles',   color: '#7c3aed', bg: '#f5f3ff' },
    { icon: 'forum',               label: 'Groupes',           route: '/admin/rooms',
      desc: 'Modérer les salles de chat',       color: '#0891b2', bg: '#ecfeff' },
    { icon: 'chat_bubble_outline', label: 'Messagerie privée', route: '/admin/messages',
      desc: 'Superviser les conversations',     color: '#be185d', bg: '#fdf2f8' },
    { icon: 'folder_open',         label: 'Fichiers',          route: '/admin/files',
      desc: 'Médiathèque centralisée',          color: '#d97706', bg: '#fffbeb' },
    { icon: 'bar_chart',           label: 'Statistiques',      route: '/admin/statistics',
      desc: 'Métriques en temps réel',          color: '#16a34a', bg: '#f0fdf4' },
  ];

  // ── Accès rapide User ─────────────────────────────────────────────────────
  readonly userLinks = [
    { icon: 'forum',               label: 'Salles de groupe',  route: '/chat/rooms',   badge: 'GROUPE',
      desc: 'Rejoignez des salles publiques ou privées avec d\'autres membres.',
      color: '#2563eb', bg: '#eff6ff',
      features: ['Salles publiques & privées', 'Participants en temps réel', 'Historique des messages'] },
    { icon: 'chat_bubble_outline', label: 'Messages privés',   route: '/private', badge: 'PRIVÉ',
      desc: 'Conversations 1-à-1 sécurisées avec n\'importe quel membre.',
      color: '#7c3aed', bg: '#f5f3ff',
      features: ['Chiffrement de bout en bout', 'Historique conservé', 'Notifications instantanées'] },
  ];

  // ── Fonctionnalités ───────────────────────────────────────────────────────
  readonly features = [
    { icon: 'manage_accounts', color: '#2563eb', bg: '#eff6ff',
      title: 'Gestion des utilisateurs',
      desc: 'Créez, modifiez et gérez les comptes utilisateurs avec des rôles distincts.',
      items: ['Rôles Admin, Utilisateur, Support', 'Statuts (actif, suspendu, bloqué)', 'Création par l\'administrateur uniquement'] },
    { icon: 'forum', color: '#0891b2', bg: '#ecfeff',
      title: 'Chat Rooms',
      desc: 'Gérez les salles de discussion publiques et privées avec contrôle des participants.',
      items: ['Salles publiques & privées', 'Gestion des participants', 'Historique des messages'] },
    { icon: 'chat_bubble_outline', color: '#be185d', bg: '#fdf2f8',
      title: 'Messagerie privée',
      desc: 'Conversations privées entre utilisateurs avec modération administrative.',
      items: ['Chat 1-à-1 sécurisé', 'Suppression & restauration', 'Audit complet'] },
    { icon: 'folder_open', color: '#d97706', bg: '#fffbeb',
      title: 'Gestion des fichiers',
      desc: 'Médiathèque centralisée pour tous les fichiers partagés sur la plateforme.',
      items: ['Images, vidéos, documents', 'Téléchargement admin', 'Contrôle des accès'] },
    { icon: 'bar_chart', color: '#7c3aed', bg: '#f5f3ff',
      title: 'Statistiques & métriques',
      desc: 'Tableau de bord analytique avec données en temps réel sur l\'activité.',
      items: ['Croissance utilisateurs', 'Volume de messages', 'Activité des 24h'] },
    { icon: 'security', color: '#16a34a', bg: '#f0fdf4',
      title: 'Sécurité & authentification',
      desc: 'Système d\'authentification robuste avec JWT et gestion des sessions.',
      items: ['Tokens JWT', 'OAuth2 (Google)', 'Réinitialisation de mot de passe'] },
  ];

  readonly steps = [
    { num: '01', icon: 'login',           color: '#2563eb', bg: '#eff6ff',
      title: 'Connexion administrateur',
      desc: 'Connectez-vous avec vos identifiants admin via la page de connexion sécurisée.' },
    { num: '02', icon: 'manage_accounts', color: '#7c3aed', bg: '#f5f3ff',
      title: 'Créez vos premiers utilisateurs',
      desc: 'En tant qu\'admin, créez les comptes depuis le panneau de gestion. L\'inscription publique est désactivée.' },
    { num: '03', icon: 'forum',           color: '#0891b2', bg: '#ecfeff',
      title: 'Configurez les salles de chat',
      desc: 'Créez des salles publiques ou privées et invitez des participants.' },
    { num: '04', icon: 'bar_chart',       color: '#d97706', bg: '#fffbeb',
      title: 'Monitorez l\'activité',
      desc: 'Consultez les statistiques, modérez les messages et gérez les fichiers.' },
  ];

  readonly mockNav = ['dashboard', 'group', 'forum', 'chat', 'folder_open', 'bar_chart', 'settings'];

  // ── Colonnes footer ───────────────────────────────────────────────────────
  readonly footerCols: Array<{ title: string; links: Array<{ label: string; action: string; target: string }> }> = [
    {
      title: 'Plateforme',
      links: [
        { label: 'Fonctionnalités',    action: 'scroll', target: 'sec-features' },
        { label: 'Comment ça marche',  action: 'scroll', target: 'sec-how'      },
        { label: 'Chiffres clés',      action: 'scroll', target: 'sec-stats'    },
        { label: 'Administration',     action: 'scroll', target: 'sec-admin'    },
      ],
    },
    {
      title: 'Accès',
      links: [
        { label: 'Connexion',          action: 'route', target: '/auth/login'        },
        { label: 'Espace Admin',       action: 'route', target: '/admin/home'        },
        { label: 'Salles de groupe',   action: 'route', target: '/chat/rooms'        },
        { label: 'Messages privés',    action: 'route', target: '/private'      },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Contacter l\'équipe', action: 'mail',  target: 'admin@flowchat.app' },
        { label: 'Documentation API',   action: 'route', target: '/docs'              },
      ],
    },
  ];

  constructor(
    private readonly adminService: AdminService,
    private readonly authService:  AuthService,
    private readonly tokenService: TokenService,
    private readonly cdr:          ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin    = this.authService.isAdmin();
    const token     = this.tokenService.getAccessToken();
    const t         = token ? this.tokenService.decodeToken(token) : null;
    this.userName   = [t?.firstName, t?.lastName].filter(Boolean).join(' ') || '';
    this.loadStats();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadStats(): void {
    this.adminService.getAllUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          for (let i = 0; i < 4; i++) this.heroStats[i].loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res) => {
          const users = res.data || [];
          this.heroStats[0].value = users.length;
          this.heroStats[1].value = users.filter((u: any) => u.isActive && u.status === 'ACTIVE').length;
          this.heroStats[2].value = users.filter((u: any) => u.role === 'ADMIN').length;
          this.heroStats[3].value = users.filter((u: any) =>
            u.status === 'PENDING' || u.status === 'PENDING_VERIFICATION'
          ).length;
          this.cdr.markForCheck();
        },
        error: () => { this.cdr.markForCheck(); },
      });
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    this.mobileMenuOpen = false;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  handleFooterLink(event: Event, link: { action: string; target: string }): void {
    if (link.action === 'scroll') {
      event.preventDefault();
      document.getElementById(link.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  trackByStat(_: number, s: LandingStat): string { return s.label; }
}