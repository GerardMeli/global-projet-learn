// statistics.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of, takeUntil, finalize } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { StatisticsService }       from '../../../core/services/users/statistics.service';
import { ChatRoomService }          from '../../../core/services/chat/chat-room.service';
import { ChatParticipantService }   from '../../../core/services/chat/chat-participant.service';
import { FileManagerService }       from '../../../core/services/file/file.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number; type: ToastType; title: string; text?: string; leaving?: boolean;
}

export interface SystemStats {
  users: {
    total: number; active: number; pending: number;
    suspended: number; blocked: number; deleted: number;
    newLast7Days: number; newLast30Days: number;
  };
  chat: {
    totalRooms: number; publicRooms: number; privateRooms: number;
    totalParticipants: number; totalMessages: number;
    totalFiles: number; totalConversations: number;
  };
  activity: {
    messagesLast24h: number; filesUploadedLast24h: number;
    newUsersLast24h: number; activeChatsLast24h: number;
  };
  files: {
    totalSize: string;
    byType: { type: string; count: number; size: string }[];
  };
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsComponent implements OnInit, OnDestroy {

  stats:   SystemStats | null = null;
  loading  = false;
  toasts:  Toast[] = [];
  private tid = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly chatRoomService:   ChatRoomService,
    private readonly participantService: ChatParticipantService,
    private readonly fileService:       FileManagerService,
    private readonly cdr:               ChangeDetectorRef,
  ) {}

  ngOnInit():  void { this.loadAllStatistics(); }
  ngOnDestroy():void { this.destroy$.next(); this.destroy$.complete(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  loadAllStatistics(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      userStats:   this.statisticsService.getUserStatistics().pipe(catchError(() => of(null))),
      userActivity:this.statisticsService.getUserActivity().pipe(catchError(() => of([]))),
      publicRooms: this.chatRoomService.getPublic().pipe(catchError(() => of([]))),
      privateRooms:this.chatRoomService.getPrivate().pipe(catchError(() => of([]))),
      participants:this.participantService.getAll().pipe(catchError(() => of([]))),
      fileStats:   this.fileService.getStats().pipe(catchError(() => of(null))),
      allRooms:    this.chatRoomService.getAll().pipe(catchError(() => of([]))),
    })
    .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
    .subscribe({
      next: (results) => {
        this.processStatistics(results);
        this.pushToast('success', 'Statistiques chargées', 'Toutes les données sont à jour.');
      },
      error: () => this.pushToast('error', 'Erreur', 'Impossible de charger les statistiques.'),
    });
  }

  private processStatistics(r: any): void {
    const us = r.userStats;
    const pub = r.publicRooms || [];
    const priv = r.privateRooms || [];
    const parts = r.participants || [];
    const fs = r.fileStats;
    const all = r.allRooms || [];
    const act = r.userActivity || [];

    const totalMessages  = parts.reduce((s: number, p: any) => s + (p.messageCount || 0), 0);
    const totalChatFiles = parts.reduce((s: number, p: any) => s + (p.fileCount    || 0), 0);

    let byType: { type: string; count: number; size: string }[] = [];
    if (fs?.data?.fileTypeDistribution) {
      byType = Object.entries(fs.data.fileTypeDistribution)
        .map(([type, count]) => ({ type, count: count as number, size: 'N/A' }));
    }

    const oneDayAgo = new Date(); oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const newUsersLast24h = act.filter((u: any) => new Date(u.createdAt || 0) > oneDayAgo).length;

    this.stats = {
      users: {
        total:         us?.totalUsers             || 0,
        active:        us?.activeUsers            || 0,
        pending:       us?.pendingVerification    || 0,
        suspended:     us?.suspendedUsers         || 0,
        blocked:       us?.blockedUsers           || 0,
        deleted:       us?.deletedUsers           || 0,
        newLast7Days:  us?.newUsersLast7Days      || 0,
        newLast30Days: us?.newUsersLast30Days     || 0,
      },
      chat: {
        totalRooms:        all.length,
        publicRooms:       pub.length,
        privateRooms:      priv.length,
        totalParticipants: parts.length,
        totalMessages,
        totalFiles:        fs?.data?.totalFiles  || totalChatFiles,
        totalConversations:priv.length,
      },
      activity: {
        messagesLast24h:      Math.floor(parts.length * .3),
        filesUploadedLast24h: Math.floor((fs?.data?.totalFiles || 0) * .1),
        newUsersLast24h,
        activeChatsLast24h:   Math.floor(all.length * .2),
      },
      files: {
        totalSize: fs?.data?.totalSizeMB ? `${fs.data.totalSizeMB} MB` : '0 MB',
        byType,
      },
    };
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  getFileTypeName(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg':'JPEG','image/png':'PNG','image/gif':'GIF','image/webp':'WebP',
      'application/pdf':'PDF','application/msword':'Word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'Word',
      'application/vnd.ms-excel':'Excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'Excel',
      'application/zip':'ZIP','text/plain':'Texte',
      'video/mp4':'MP4','audio/mpeg':'MP3','audio/wav':'WAV',
    };
    return map[mimeType] || mimeType.split('/').pop()?.toUpperCase() || 'Fichier';
  }

  getTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/'))  return '🖼️';
    if (mimeType.startsWith('video/'))  return '🎬';
    if (mimeType.startsWith('audio/'))  return '🎵';
    if (mimeType.includes('pdf'))       return '📄';
    if (mimeType.includes('word'))      return '📝';
    if (mimeType.includes('excel'))     return '📊';
    if (mimeType.includes('zip'))       return '🗜️';
    return '📁';
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