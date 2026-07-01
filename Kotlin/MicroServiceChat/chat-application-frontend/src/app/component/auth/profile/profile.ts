// profile.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Router }       from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

import { Language, Theme }         from '../../../core/models/users/enums.model';
import {
  UserProfileResponse,
  UserProfileUpdateRequest,
  UserPreferencesUpdateRequest,
  PasswordChangeRequest,
  EmailUpdateRequest,
} from '../../../core/models/users/profile.model';
import { AuthService }    from '../../../core/services/users/auth.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { TokenService }   from '../../../core/services/users/token.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ProfileTab = 'personal' | 'preferences' | 'security' | 'email';

export interface Toast {
  id: number; type: ToastType; title: string; text?: string; leaving?: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {

  profile: UserProfileResponse | null = null;
  loading  = false;
  saving   = false;
  activeTab: ProfileTab = 'personal';

  // ── Formulaires ────────────────────────────────────────────────────────
  personalInfo: Partial<UserProfileUpdateRequest> = {};
  preferences: UserPreferencesUpdateRequest = {
    language: Language.EN,
    theme: Theme.SYSTEM,
    emailNotifications: true,
  };
  passwordData: PasswordChangeRequest & { confirmPassword: string } = {
    currentPassword: '', newPassword: '', confirmPassword: '',
  };
  emailData: EmailUpdateRequest = { newEmail: '', password: '' };

  // ── Password visibility ─────────────────────────────────────────────
  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  // ── Toasts ─────────────────────────────────────────────────────────────
  toasts: Toast[] = [];
  private tid = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly profileService: ProfileService,
    private readonly tokenService:   TokenService,
    private readonly authService:    AuthService,
    private readonly router:         Router,
    private readonly cdr:            ChangeDetectorRef,
  ) {}

  ngOnInit():   void { this.loadProfile(); }
  ngOnDestroy():void { this.destroy$.next(); this.destroy$.complete(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT PROFIL
  // ═══════════════════════════════════════════════════════════════════════════

  loadProfile(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId) { this.router.navigate(['/auth/login']); return; }

    this.loading = true;
    this.cdr.markForCheck();

    this.profileService.getUserProfile(userId)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.resetPersonalInfo();
          this.resetPreferences();
          this.cdr.markForCheck();
        },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de charger le profil.'),
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ONGLET INFORMATIONS PERSONNELLES
  // ═══════════════════════════════════════════════════════════════════════════

  resetPersonalInfo(): void {
    if (!this.profile) return;
    this.personalInfo = {
      firstName:   this.profile.firstName   || '',
      lastName:    this.profile.lastName    || '',
      phoneNumber: this.profile.phoneNumber || '',
      address:     this.profile.address     || '',
    };
    this.cdr.markForCheck();
  }

  updatePersonalInfo(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.cdr.markForCheck();

    this.profileService.updateUserProfile(userId, this.personalInfo)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => { this.profile = updated; this.pushToast('success', 'Sauvegardé', 'Informations mises à jour.'); },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de mettre à jour le profil.'),
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ONGLET PRÉFÉRENCES
  // ═══════════════════════════════════════════════════════════════════════════

  resetPreferences(): void {
    if (!this.profile) return;
    this.preferences = {
      language: this.profile.language || Language.FR,
      theme:    this.profile.theme    || Theme.SYSTEM,
      emailNotifications: true,
    };
    this.cdr.markForCheck();
  }

  updatePreferences(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.profile) return;

    this.saving = true;
    this.cdr.markForCheck();

    this.profileService.updateUserPreferences(userId, this.preferences)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (updated) => { this.profile = updated; this.pushToast('success', 'Sauvegardé', 'Préférences mises à jour.'); },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de mettre à jour les préférences.'),
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ONGLET SÉCURITÉ
  // ═══════════════════════════════════════════════════════════════════════════

  get pwdLength(): boolean { return this.passwordData.newPassword.length >= 8; }
  get pwdUpper():  boolean { return /[A-Z]/.test(this.passwordData.newPassword); }
  get pwdLower():  boolean { return /[a-z]/.test(this.passwordData.newPassword); }
  get pwdNumber(): boolean { return /[0-9]/.test(this.passwordData.newPassword); }
  get pwdMatch():  boolean { return this.passwordData.newPassword.length > 0 && this.passwordData.newPassword === this.passwordData.confirmPassword; }

  isPasswordValid(): boolean { return this.pwdLength && this.pwdUpper && this.pwdLower && this.pwdNumber && this.pwdMatch; }

  resetPasswordForm(): void {
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.showCurrent = false; this.showNew = false; this.showConfirm = false;
    this.cdr.markForCheck();
  }

  changePassword(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.isPasswordValid()) return;

    this.saving = true;
    this.cdr.markForCheck();

    this.profileService.changePassword(userId, this.passwordData)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.resetPasswordForm(); this.pushToast('success', 'Mot de passe modifié', 'Votre mot de passe a été mis à jour.'); },
        error: () => this.pushToast('error', 'Erreur', 'Mot de passe actuel incorrect ou erreur serveur.'),
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ONGLET EMAIL
  // ═══════════════════════════════════════════════════════════════════════════

  requestEmailChange(): void {
    const userId = this.tokenService.getCurrentUserId();
    if (!userId || !this.emailData.newEmail || !this.emailData.password) return;

    this.saving = true;
    this.cdr.markForCheck();

    this.profileService.requestEmailChange(userId, this.emailData)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.emailData = { newEmail: '', password: '' };
          this.pushToast('success', 'Email envoyé', 'Vérifiez votre nouvelle boîte email pour confirmer.');
        },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de demander le changement d\'email.'),
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════

  logout(): void { this.authService.logout(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS VISUELS
  // ═══════════════════════════════════════════════════════════════════════════

  getFullName(): string {
    if (!this.profile) return '';
    const p = [this.profile.firstName, this.profile.lastName].filter(Boolean);
    return p.length ? p.join(' ') : 'Utilisateur';
  }

  getInitials(): string {
    if (!this.profile) return 'U';
    const a = this.profile.firstName?.charAt(0) || '';
    const b = this.profile.lastName?.charAt(0)  || '';
    return (a + b).toUpperCase() || 'U';
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────
  pushToast(type: ToastType, title: string, text?: string, dur = 4500): void {
    const id = ++this.tid;
    this.toasts = [...this.toasts, { id, type, title, text }];
    this.cdr.markForCheck();
    setTimeout(() => this.dismissToast(id), dur);
  }
  dismissToast(id: number): void {
    this.toasts = this.toasts.map(t => t.id === id ? { ...t, leaving: true } : t);
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 360);
  }
  toastIcon(t: ToastType): string { return { success:'✅',error:'❌',warning:'⚠️',info:'ℹ️' }[t]; }
  trackByToast(_: number, t: Toast): number { return t.id; }
}