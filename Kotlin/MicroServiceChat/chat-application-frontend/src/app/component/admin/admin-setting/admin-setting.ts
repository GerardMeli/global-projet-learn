// admin-settings.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SettingsTab = 'general' | 'notifications' | 'security' | 'appearance' | 'about';

export interface Toast {
  id:    number;
  type:  'success' | 'error' | 'info' | 'warning';
  title: string;
  text?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector:        'app-admin-settings',
  standalone:      true,
  imports:         [CommonModule, ReactiveFormsModule],
  templateUrl:     './admin-setting.html',
  styleUrls:       ['./admin-setting.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsComponent implements OnInit, OnDestroy {

  // ── Tabs ───────────────────────────────────────────────────────────────────
  activeTab: SettingsTab = 'general';

  readonly tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'general',       label: 'Général',          icon: 'tune'             },
    { id: 'notifications', label: 'Notifications',    icon: 'notifications'    },
    { id: 'security',      label: 'Sécurité',         icon: 'security'         },
    { id: 'appearance',    label: 'Apparence',        icon: 'palette'          },
    { id: 'about',         label: 'À propos',         icon: 'info'             },
  ];

  // ── Toasts ─────────────────────────────────────────────────────────────────
  toasts: Toast[] = [];
  private toastId  = 0;

  // ── Saving state ───────────────────────────────────────────────────────────
  savingGeneral       = false;
  savingNotifications = false;
  savingSecurity      = false;
  savingAppearance    = false;

  // ── Forms ──────────────────────────────────────────────────────────────────
  generalForm!:       FormGroup;
  notifForm!:         FormGroup;
  securityForm!:      FormGroup;
  appearanceForm!:    FormGroup;

  // ── Notifications prefs ────────────────────────────────────────────────────
  notifToggles = {
    emailNewUser:       true,
    emailSuspend:       true,
    emailDelete:        false,
    pushNewMessage:     true,
    pushFileUpload:     false,
    pushSystemAlert:    true,
    weeklySummary:      true,
    securityAlerts:     true,
    maintenanceAlerts:  false,
  };

  // ── Security prefs ─────────────────────────────────────────────────────────
  secToggles = {
    twoFactor:       false,
    ipWhitelist:     false,
    sessionTimeout:  true,
    auditLog:        true,
    forceHttps:      true,
    rateLimiting:    true,
  };

  // ── Appearance prefs ───────────────────────────────────────────────────────
  selectedTheme   = 'light';
  selectedLang    = 'fr';
  selectedDensity = 'normal';

  readonly themes   = [
    { id: 'light',  label: 'Clair',   icon: 'light_mode' },
    { id: 'dark',   label: 'Sombre',  icon: 'dark_mode'  },
    { id: 'system', label: 'Système', icon: 'computer'   },
  ];

  readonly languages = [
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'English'  },
    { id: 'ar', label: 'عربي'    },
    { id: 'es', label: 'Español'  },
  ];

  readonly densities = [
    { id: 'compact', label: 'Compact'  },
    { id: 'normal',  label: 'Normal'   },
    { id: 'spacious',label: 'Aéré'     },
  ];

  // ── About ──────────────────────────────────────────────────────────────────
  readonly appInfo = {
    name:        'FlowChat Admin',
    version:     '2.4.1',
    build:       '20260307',
    angular:     '17.x',
    node:        '20.x',
    environment: 'Production',
    uptime:      '14j 6h 32m',
    lastDeploy:  '2026-02-20',
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb:  FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  ngOnInit(): void {
    this.buildForms();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private buildForms(): void {
    this.generalForm = this.fb.group({
      appName:          ['FlowChat', [Validators.required, Validators.minLength(2)]],
      appDescription:   ['Plateforme de messagerie instantanée sécurisée'],
      supportEmail:     ['support@flowchat.io', [Validators.email]],
      maxFileSize:      [50, [Validators.min(1), Validators.max(500)]],
      maxRoomParticipants: [500, [Validators.min(2), Validators.max(10000)]],
      allowPublicRooms: [true],
      allowGuestAccess: [false],
      maintenanceMode:  [false],
    });

    this.notifForm = this.fb.group({
      smtpHost:   ['smtp.example.com'],
      smtpPort:   [587],
      smtpUser:   ['noreply@flowchat.io'],
      smtpPass:   [''],
      pushKey:    [''],
    });

    this.securityForm = this.fb.group({
      sessionTtl:       [30,  [Validators.min(5)]],
      maxLoginAttempts: [5,   [Validators.min(1), Validators.max(20)]],
      lockoutDuration:  [15,  [Validators.min(1)]],
      passwordMinLen:   [8,   [Validators.min(6), Validators.max(32)]],
      jwtExpiry:        [24,  [Validators.min(1)]],
      allowedIps:       [''],
    });

    this.appearanceForm = this.fb.group({
      primaryColor:   ['#2563eb'],
      accentColor:    ['#7c3aed'],
      logoUrl:        [''],
      faviconUrl:     [''],
      customCss:      [''],
    });
  }

  // ── Tab ────────────────────────────────────────────────────────────────────
  setTab(tab: SettingsTab): void {
    this.activeTab = tab;
    this.cdr.markForCheck();
    // scroll to anchor
    setTimeout(() => {
      document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ── Save handlers ──────────────────────────────────────────────────────────
  saveGeneral(): void {
    if (this.generalForm.invalid) { this.pushToast('error', 'Formulaire invalide', 'Corrigez les erreurs avant d\'enregistrer.'); return; }
    this.savingGeneral = true; this.cdr.markForCheck();
    // TODO: wire to real API
    setTimeout(() => {
      this.savingGeneral = false;
      this.pushToast('success', 'Paramètres généraux sauvegardés');
      this.cdr.markForCheck();
    }, 900);
  }

  saveNotifications(): void {
    this.savingNotifications = true; this.cdr.markForCheck();
    setTimeout(() => {
      this.savingNotifications = false;
      this.pushToast('success', 'Notifications mises à jour');
      this.cdr.markForCheck();
    }, 900);
  }

  saveSecurity(): void {
    if (this.securityForm.invalid) { this.pushToast('error', 'Formulaire invalide'); return; }
    this.savingSecurity = true; this.cdr.markForCheck();
    setTimeout(() => {
      this.savingSecurity = false;
      this.pushToast('success', 'Paramètres de sécurité sauvegardés');
      this.cdr.markForCheck();
    }, 900);
  }

  saveAppearance(): void {
    this.savingAppearance = true; this.cdr.markForCheck();
    setTimeout(() => {
      this.savingAppearance = false;
      this.pushToast('success', 'Apparence mise à jour');
      this.cdr.markForCheck();
    }, 900);
  }

  toggleNotif(key: keyof typeof this.notifToggles): void {
    this.notifToggles[key] = !this.notifToggles[key];
    this.cdr.markForCheck();
  }

  toggleSec(key: keyof typeof this.secToggles): void {
    this.secToggles[key] = !this.secToggles[key];
    this.cdr.markForCheck();
  }

  testSmtp(): void {
    this.pushToast('info', 'Test SMTP', 'Email de test envoyé à l\'adresse configurée.');
  }

  exportConfig(): void {
    const data = JSON.stringify({
      general:  this.generalForm.value,
      security: this.securityForm.value,
      notif:    this.notifToggles,
      secToggle:this.secToggles,
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'flowchat-config.json' });
    a.click();
    URL.revokeObjectURL(url);
    this.pushToast('success', 'Configuration exportée');
  }

  clearCache(): void {
    this.pushToast('success', 'Cache vidé', 'Le cache applicatif a été réinitialisé.');
  }

  // ── Toasts ─────────────────────────────────────────────────────────────────
  pushToast(type: Toast['type'], title: string, text?: string, dur = 4500): void {
    const id = ++this.toastId;
    this.toasts = [...this.toasts, { id, type, title, text }];
    this.cdr.markForCheck();
    setTimeout(() => this.removeToast(id), dur);
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.markForCheck();
  }

  trackByToast(_: number, t: Toast): number { return t.id; }
  trackByTab(_: number, t: any):    string  { return t.id; }

  @HostListener('document:keydown.escape')
  onEscape(): void { /* fermer éventuels modals futurs */ }
}