// user-management.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RouterModule }  from '@angular/router';
import { Router }        from '@angular/router';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
} from 'rxjs';

import { AdminService }          from '../../../core/services/users/admin.service';
import { TokenService }          from '../../../core/services/users/token.service';
import { UserProfileResponse }   from '../../../core/models/users/profile.model';
import {
  AdminUserUpdateRequest,
  UserStatusUpdateRequest,
  UserRoleUpdateRequest,
} from '../../../core/models/users/admin.model';
import {
  UserStatus,
  UserRole,
  Language,
  Theme,
} from '../../../core/models/users/enums.model';
import { MigrationReport, AgriUserDto } from '../../../core/models/users/migration.model';
import { MigrationService } from '../../../core/services/users/migration.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ModalMode = 'add' | 'edit' | 'detail' | 'delete' | 'status' | 'role' | 'migration' | 'migration-single' | null;

export interface Toast {
  id:       number;
  type:     ToastType;
  title:    string;
  text?:    string;
  duration: number;
  leaving?: boolean;
}

export interface NewUserForm {
  firstName:     string;
  lastName:      string;
  email:         string;
  phoneNumber:   string;
  address:       string;
  role:          UserRole;
  status:        UserStatus;
  language:      Language;
  theme:         Theme;
  isActive:      boolean;
  emailVerified: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'app-user-management',
  standalone:      true,
  imports:         [CommonModule, FormsModule, RouterModule],
  templateUrl:     './user-management.html',
  styleUrls:       ['./user-management.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit, OnDestroy {

  // ── Données ────────────────────────────────────────────────────────────────
  users:          UserProfileResponse[] = [];
  filteredUsers:  UserProfileResponse[] = [];
  paginatedUsers: UserProfileResponse[] = [];

  // ── Migration ──────────────────────────────────────────────────────────────
  migrating         = false;
  migrationReport:  MigrationReport | null = null;
  singleAgriUser:   Partial<AgriUserDto> = {};
  migratingOne      = false;

  // ── Recherche réactive — aucun clic requis ─────────────────────────────────
  searchTerm   = '';
  roleFilter   = '';
  statusFilter = '';
  activeFilter = '';

  private readonly search$  = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  // ── Pagination ─────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 10;
  totalPages  = 1;

  // ── États ─────────────────────────────────────────────────────────────────
  loading        = false;
  saving         = false;
  updating       = false;
  deleteProgress = false;

  // ── Toasts ─────────────────────────────────────────────────────────────────
  toasts:  Toast[]  = [];
  private toastId   = 0;

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalMode:    ModalMode                  = null;
  selectedUser: UserProfileResponse | null = null;

  // ── Formulaires ────────────────────────────────────────────────────────────
  editData:           Partial<AdminUserUpdateRequest> = {};
  emailNotifications  = true;
  newUser:            NewUserForm = this.emptyUser();
  statusUpdate:       UserStatusUpdateRequest = { status: UserStatus.ACTIVE };
  roleUpdate:         UserRoleUpdateRequest   = { role: UserRole.USER };

  readonly Math = Math;

  // ── Options ────────────────────────────────────────────────────────────────
  readonly languageOptions = [
    { value: Language.EN, label: '🇬🇧 English'  },
    { value: Language.FR, label: '🇫🇷 Français'  },
    { value: Language.ES, label: '🇪🇸 Español'   },
    { value: Language.DE, label: '🇩🇪 Deutsch'   },
    { value: Language.IT, label: '🇮🇹 Italiano'  },
  ];

  readonly themeOptions = [
    { value: Theme.LIGHT,  label: '☀️ Clair'   },
    { value: Theme.DARK,   label: '🌙 Sombre'  },
    { value: Theme.SYSTEM, label: '💻 Système' },
  ];

  readonly statusOptions = [
    { value: UserStatus.ACTIVE,    label: 'Actif',      icon: '✅' },
    { value: UserStatus.PENDING,   label: 'En attente', icon: '⏳' },
    { value: UserStatus.SUSPENDED, label: 'Suspendu',   icon: '⚠️' },
    { value: UserStatus.BLOCKED,   label: 'Bloqué',     icon: '🚫' },
    { value: UserStatus.DELETED,   label: 'Supprimé',   icon: '🗑️' },
  ];

  readonly roleOptions = [
    { value: UserRole.USER,    label: 'Utilisateur',    icon: '👤' },
    { value: UserRole.ADMIN,   label: 'Administrateur', icon: '👑' },
    { value: UserRole.SUPPORT, label: 'Support',        icon: '🎧' },
  ];

  readonly filterRoleOptions   = [{ value: '', label: 'Tous les rôles',   icon: '' }, ...this.roleOptions];
  readonly filterStatusOptions = [{ value: '', label: 'Tous les statuts', icon: '' }, ...this.statusOptions];
  readonly activeOptions = [
    { value: '',      label: 'Toute activité'        },
    { value: 'true',  label: '● Actifs seulement'    },
    { value: 'false', label: '○ Inactifs seulement'  },
  ];

  private readonly GRADIENTS = [
    'linear-gradient(135deg,#7c3aed,#4f46e5)',
    'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    'linear-gradient(135deg,#10b981,#14b8a6)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#ec4899,#8b5cf6)',
  ];

  // ═══════════════════════════════════════════════════════════════════════════

  constructor(
    private readonly adminService:     AdminService,
    private readonly migrationService: MigrationService,
    private readonly tokenService:     TokenService,
    private readonly router:           Router,
    private readonly cdr:              ChangeDetectorRef,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    // L'utilisateur tape → debounce 250 ms → tableau mis à jour automatiquement
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => { this.applyFilters(); this.cdr.markForCheck(); });

    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  loadUsers(): void {
    this.loading = true;
    this.cdr.markForCheck();

    if (!this.tokenService.isAdmin()) {
      this.pushToast('error', 'Accès refusé', 'Vous devez être administrateur.');
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users   = res.data || [];
        this.loading = false;
        this.applyFilters();  // stats + tableau recalculés automatiquement
        this.pushToast('success', 'Utilisateurs chargés', `${this.users.length} compte(s).`);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.handleError(err, 'chargement des utilisateurs');
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRES — réactifs, aucun clic requis
  // ═══════════════════════════════════════════════════════════════════════════

  /** Liaison sur (ngModelChange) de l'input → Subject → debounce → applyFilters */
  onSearchInput(): void { this.search$.next(this.searchTerm); }

  /** Liaison sur (ngModelChange) des selects → immédiat */
  onFilterChange(): void { this.applyFilters(); this.cdr.markForCheck(); }

  clearSearch(): void { this.searchTerm = ''; this.search$.next(''); }

  clearAllFilters(): void {
    this.searchTerm = ''; this.roleFilter = '';
    this.statusFilter = ''; this.activeFilter = '';
    this.applyFilters(); this.cdr.markForCheck();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(u => {
      if (term) {
        const n = this.getFullName(u).toLowerCase();
        const e = u.email.toLowerCase();
        const i = String(u.id);
        if (!n.includes(term) && !e.includes(term) && !i.includes(term)) return false;
      }
      if (this.roleFilter   && u.role   !== this.roleFilter)   return false;
      if (this.statusFilter && u.status !== this.statusFilter) return false;
      if (this.activeFilter && u.isActive !== (this.activeFilter === 'true')) return false;
      return true;
    });
    this.totalPages  = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    this.currentPage = 1;
    this.refreshPage();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.roleFilter || this.statusFilter || this.activeFilter);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PAGINATION
  // ═══════════════════════════════════════════════════════════════════════════

  refreshPage(): void {
    const s = (this.currentPage - 1) * this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(s, s + this.pageSize);
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p; this.refreshPage(); this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.totalPages  = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
    this.currentPage = 1; this.refreshPage(); this.cdr.markForCheck();
  }

  get pageStart(): number { return (this.currentPage - 1) * this.pageSize + 1; }
  get pageEnd():   number { return Math.min(this.currentPage * this.pageSize, this.filteredUsers.length); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  STATISTIQUES — getters purs, recalcul automatique
  // ═══════════════════════════════════════════════════════════════════════════

  get statTotal()   { return this.users.length; }
  get statActive()  { return this.users.filter(u => u.isActive).length; }
  get statAdmin()   { return this.users.filter(u => u.role === UserRole.ADMIN).length; }
  get statPending() { return this.users.filter(u => u.status === UserStatus.PENDING).length; }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODALES
  // ═══════════════════════════════════════════════════════════════════════════

  openAdd(): void    { this.newUser = this.emptyUser(); this.modalMode = 'add'; this.cdr.markForCheck(); }

  openDetail(u: UserProfileResponse): void {
    this.selectedUser = u; this.modalMode = 'detail'; this.cdr.markForCheck();
  }

  openEdit(u: UserProfileResponse): void {
    this.selectedUser = u;
    this.editData = {
      firstName: u.firstName || '', lastName: u.lastName || '',
      phoneNumber: u.phoneNumber || '', address: u.address || '',
      language: u.language, theme: u.theme,
      isActive: u.isActive, emailVerified: u.emailVerified,
    };
    this.emailNotifications = true;
    this.modalMode = 'edit'; this.cdr.markForCheck();
  }

  openStatus(u: UserProfileResponse): void {
    this.selectedUser = u; this.statusUpdate = { status: u.status, reason: '' };
    this.modalMode = 'status'; this.cdr.markForCheck();
  }

  openRole(u: UserProfileResponse): void {
    this.selectedUser = u; this.roleUpdate = { role: u.role, reason: '' };
    this.modalMode = 'role'; this.cdr.markForCheck();
  }

  openDelete(u: UserProfileResponse): void {
    this.selectedUser = u; this.modalMode = 'delete'; this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalMode = null; this.selectedUser = null; this.cdr.markForCheck();
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closeModal();
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.modalMode) this.closeModal();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  createUser(): void {
    if (!this.newUser.email.trim()) return;
    this.saving = true; this.cdr.markForCheck();
    // Remplacer par adminService.createUser(this.newUser) quand disponible
    setTimeout(() => {
      this.saving = false; this.closeModal();
      this.pushToast('info', 'Non implémenté',
        'Branchez adminService.createUser() sur POST /admin/users.');
      this.cdr.markForCheck();
    }, 600);
  }

  saveEdit(): void {
    if (!this.selectedUser || !this.hasEditChanges()) return;
    this.saving = true; this.cdr.markForCheck();
    const payload = { ...this.editData, emailNotifications: this.emailNotifications } as AdminUserUpdateRequest;
    const name    = this.getFullName(this.selectedUser);
    this.adminService.updateUser(this.selectedUser.id, payload).subscribe({
      next: () => {
        this.saving = false; this.closeModal(); this.loadUsers();
        this.pushToast('success', 'Modifié', `${name} a été mis à jour.`);
        this.cdr.markForCheck();
      },
      error: (err) => { this.handleError(err, 'mise à jour'); this.saving = false; this.cdr.markForCheck(); },
    });
  }

  hasEditChanges(): boolean {
    if (!this.selectedUser) return false;
    const orig = {
      firstName: this.selectedUser.firstName || '', lastName: this.selectedUser.lastName || '',
      phoneNumber: this.selectedUser.phoneNumber || '', address: this.selectedUser.address || '',
      language: this.selectedUser.language, theme: this.selectedUser.theme,
      isActive: this.selectedUser.isActive, emailVerified: this.selectedUser.emailVerified,
    };
    return JSON.stringify(this.editData) !== JSON.stringify(orig);
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;
    this.deleteProgress = true; this.cdr.markForCheck();
    const name = this.getFullName(this.selectedUser);
    this.adminService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.deleteProgress = false; this.closeModal(); this.loadUsers();
        this.pushToast('success', 'Supprimé', `${name} a été supprimé définitivement.`);
        this.cdr.markForCheck();
      },
      error: (err) => { this.handleError(err, 'suppression'); this.deleteProgress = false; this.cdr.markForCheck(); },
    });
  }

  updateStatus(): void {
    if (!this.selectedUser) return;
    this.updating = true; this.cdr.markForCheck();
    const label = this.statusOptions.find(o => o.value === this.statusUpdate.status)?.label || '';
    this.adminService.updateUserStatus(this.selectedUser.id, this.statusUpdate).subscribe({
      next: () => {
        this.updating = false; this.closeModal(); this.loadUsers();
        this.pushToast('success', 'Statut mis à jour', `Nouveau statut : ${label}`);
        this.cdr.markForCheck();
      },
      error: (err) => { this.handleError(err, 'mise à jour du statut'); this.updating = false; this.cdr.markForCheck(); },
    });
  }

  updateRole(): void {
    if (!this.selectedUser) return;
    this.updating = true; this.cdr.markForCheck();
    const label = this.roleOptions.find(o => o.value === this.roleUpdate.role)?.label || '';
    this.adminService.updateUserRole(this.selectedUser.id, this.roleUpdate).subscribe({
      next: () => {
        this.updating = false; this.closeModal(); this.loadUsers();
        this.pushToast('success', 'Rôle mis à jour', `Nouveau rôle : ${label}`);
        this.cdr.markForCheck();
      },
      error: (err) => { this.handleError(err, 'mise à jour du rôle'); this.updating = false; this.cdr.markForCheck(); },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MIGRATION Agriculture → Chat
  // ═══════════════════════════════════════════════════════════════════════════

  openMigration(): void {
    this.migrationReport = null;
    this.modalMode = 'migration';
    this.cdr.markForCheck();
  }

  openMigrationSingle(): void {
    this.singleAgriUser = {};
    this.migrationReport = null;
    this.modalMode = 'migration-single';
    this.cdr.markForCheck();
  }

  /** Lance la migration en masse via POST /api/admin/migration/run */
  runMigration(): void {
    this.migrating = true;
    this.migrationReport = null;
    this.cdr.markForCheck();

    this.migrationService.runMassiveMigration().subscribe({
      next: (report) => {
        this.migrating      = false;
        this.migrationReport = report;
        this.loadUsers();  // rafraîchir la liste après migration
        this.pushToast(
          report.errors > 0 ? 'warning' : 'success',
          'Migration terminée',
          `✅ ${report.created} créés · ⏭️ ${report.skipped} ignorés · ❌ ${report.errors} erreurs`
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.migrating = false;
        this.handleError(err, 'migration en masse');
        this.cdr.markForCheck();
      },
    });
  }

  /** Migre un seul user via POST /api/admin/migration/single */
  runSingleMigration(): void {
    if (!this.singleAgriUser.userCode || !this.singleAgriUser.userEmail) return;
    this.migratingOne = true;
    this.cdr.markForCheck();

    this.migrationService.runSingleMigration(this.singleAgriUser as AgriUserDto).subscribe({
      next: (res) => {
        this.migratingOne = false;
        const isNew = res.resultat === 'CREE';
        this.pushToast(
          isNew ? 'success' : 'info',
          isNew ? 'User migré' : 'Déjà migré',
          res.message
        );
        if (isNew) this.loadUsers();
        this.closeModal();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.migratingOne = false;
        this.handleError(err, 'migration unitaire');
        this.cdr.markForCheck();
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TOASTS — automatiques, aucun clic requis
  // ═══════════════════════════════════════════════════════════════════════════

  pushToast(type: ToastType, title: string, text?: string, duration = 4500): void {
    const id = ++this.toastId;
    this.toasts = [...this.toasts, { id, type, title, text, duration }];
    this.cdr.markForCheck();
    setTimeout(() => this.dismissToast(id), duration);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.map(t => t.id === id ? { ...t, leaving: true } : t);
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 380);
  }

  toastIcon(type: ToastType): string {
    return { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }[type];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  getFullName(u: UserProfileResponse): string {
    const p = [u.firstName, u.lastName].filter(Boolean);
    return p.length ? p.join(' ') : 'Utilisateur';
  }

  getInitials(u: UserProfileResponse): string {
    return ((u.firstName?.charAt(0) || '') + (u.lastName?.charAt(0) || '')).toUpperCase() || 'U';
  }

  getAvatarGradient(id: number): string { return this.GRADIENTS[id % this.GRADIENTS.length]; }

  getRoleBadgeClass(r: string): string {
    return ({ ADMIN: 'badge--role-admin', USER: 'badge--role-user', SUPPORT: 'badge--role-support' } as any)[r] || '';
  }

  getStatusBadgeClass(s: string): string {
    return ({
      ACTIVE: 'badge--active', PENDING: 'badge--pending',
      SUSPENDED: 'badge--suspended', BLOCKED: 'badge--blocked', DELETED: 'badge--deleted',
    } as any)[s] || '';
  }

  getRoleLabel(r: string):   string { return this.roleOptions.find(o => o.value === r)?.label   || r; }
  getStatusLabel(s: string): string { return this.statusOptions.find(o => o.value === s)?.label || s; }
  getStatusIcon(s: string):  string { return this.statusOptions.find(o => o.value === s)?.icon  || '●'; }
  getRoleIcon(r: string):    string { return this.roleOptions.find(o => o.value === r)?.icon    || '●'; }

  trackByUser(_: number, u: UserProfileResponse): number { return u.id; }
  trackByToast(_: number, t: Toast): number { return t.id; }

  private emptyUser(): NewUserForm {
    return {
      firstName: '', lastName: '', email: '', phoneNumber: '', address: '',
      role: UserRole.USER, status: UserStatus.ACTIVE,
      language: Language.FR, theme: Theme.DARK,
      isActive: true, emailVerified: false,
    };
  }

  private handleError(err: any, ctx: string): void {
    const map: Record<number, [string, string]> = {
      0:   ['Hors ligne',      'Impossible de joindre le serveur.'],
      401: ['Session expirée', 'Redirection dans 2 secondes...'],
      403: ['Accès refusé',    'Permissions insuffisantes.'],
      404: ['Introuvable',     'La ressource n\'existe pas.'],
    };
    const [title, text] = map[err.status] || [`Erreur — ${ctx}`, err.error?.message || 'Veuillez réessayer.'];
    this.pushToast('error', title, text);
    if (err.status === 401) setTimeout(() => this.router.navigate(['/auth/login']), 2200);
  }
}