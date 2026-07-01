// admin-messages.component.ts
import {
  Component, OnInit, OnDestroy, HostListener,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { Subject, forkJoin, Observable, of, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { MessageResponse }    from '../../../core/models/chat/message.model';
import { MessageService }     from '../../../core/services/chat/message.service';
import { ChatRoomService }    from '../../../core/services/chat/chat-room.service';
import { PrivateChatService } from '../../../core/services/chat/private-chat.service';
import { TokenService }       from '../../../core/services/users/token.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ModalMode = 'delete' | 'permDelete' | null;

export interface Toast {
  id: number; type: ToastType; title: string; text?: string; leaving?: boolean;
}

export interface ExtendedMessage extends MessageResponse {
  roomName?: string; receiverId?: number; receiverName?: string;
  senderName?: string; isPrivate?: boolean;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages-management.html',
  styleUrls: ['./messages-management.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMessagesComponent implements OnInit, OnDestroy {

  // ── Données ────────────────────────────────────────────────────────────
  messages:          ExtendedMessage[] = [];
  filteredMessages:  ExtendedMessage[] = [];
  paginatedMessages: ExtendedMessage[] = [];

  // ── Filtres ────────────────────────────────────────────────────────────
  searchTerm        = '';
  roomFilter        = '';
  messageTypeFilter = 'all';
  private readonly search$ = new Subject<string>();

  // ── Pagination ─────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 20;
  totalPages  = 1;
  readonly pageSizeOptions = [20, 50, 100];

  // ── États ──────────────────────────────────────────────────────────────
  loading  = false;
  deleting = false;

  // ── Modal ──────────────────────────────────────────────────────────────
  modalMode:      ModalMode          = null;
  messageToDelete: ExtendedMessage | null = null;

  // ── Stats getters ──────────────────────────────────────────────────────
  get totalCount():    number { return this.messages.length; }
  get groupMessages(): number { return this.messages.filter(m => !m.isPrivate).length; }
  get privateMessages():number{ return this.messages.filter(m =>  m.isPrivate).length; }
  get withFiles():     number { return this.messages.filter(m => !!m.fileUrl).length; }
  get deletedCount():  number { return this.messages.filter(m => m.isDeleted === true).length; }
  get hasActiveFilters():boolean { return !!(this.searchTerm || this.roomFilter || this.messageTypeFilter !== 'all'); }

  get uniqueRoomIds(): (number | string)[] {
    const s = new Set<number | string>();
    this.messages.forEach(m => s.add(m.isPrivate ? `private-${m.id}` : m.roomId));
    return Array.from(s);
  }

  readonly Math = Math;

  // ── Toasts ─────────────────────────────────────────────────────────────
  toasts: Toast[] = [];
  private tid = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly messageService:  MessageService,
    private readonly chatRoomService: ChatRoomService,
    private readonly privateChatSvc:  PrivateChatService,
    private readonly tokenService:    TokenService,
    private readonly cdr:             ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
    this.loadMessages();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeModal(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  loadMessages(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin([this.loadGroupMessages(), this.loadPrivateMessages()])
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: ([group, priv]) => {
          this.messages = [...group, ...priv];
          this.applyFilters();
          this.pushToast('success', 'Chargé', `${this.messages.length} messages chargés.`);
        },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de charger les messages.'),
      });
  }

  private loadGroupMessages(): Observable<ExtendedMessage[]> {
    return this.chatRoomService.getAll().pipe(
      switchMap(rooms => {
        if (!rooms.length) return of([]);
        return forkJoin(
          rooms.map(room =>
            this.messageService.getByRoom(room.id).pipe(
              map(msgs => msgs.map(m => ({
                ...m,
                roomName:   room.name,
                senderName: m.sender?.email || `User #${m.sender?.id}`,
                isPrivate:  false,
              } as ExtendedMessage)))
            )
          )
        ).pipe(map(r => r.flat()));
      })
    );
  }

  private loadPrivateMessages(): Observable<ExtendedMessage[]> {
    const uid = this.tokenService.getCurrentUserId();
    if (!uid) return of([]);
    return this.privateChatSvc.getUserChats(uid).pipe(
      map(chats => chats.map(chat => {
        const senderName   = chat.senderId1 === uid ? chat.senderName1 : chat.senderName2;
        const receiverName = chat.senderId1 === uid ? chat.senderName2 : chat.senderName1;
        const receiverId   = chat.senderId1 === uid ? chat.senderId2   : chat.senderId1;
        return {
          id: chat.id, content: chat.content,
          sender: { id: uid, email: senderName }, senderId: uid,
          senderName, receiverId, receiverName,
          roomId: 0, timestamp: chat.timestamp, createdAt: chat.timestamp,
          chatRoomId: 0, messageType: 'TEXT' as any,
          isDeleted: false, fileUrl: null, fileName: null, isPrivate: true,
        } as ExtendedMessage;
      }))
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRES — réactifs
  // ═══════════════════════════════════════════════════════════════════════════

  onSearchInput():  void { this.search$.next(this.searchTerm); }
  onFilterChange(): void { this.applyFilters(); }

  applyFilters(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredMessages = this.messages.filter(m => {
      const matchSearch = !q ||
        (m.content || '').toLowerCase().includes(q) ||
        (m.senderName || '').toLowerCase().includes(q) ||
        (m.receiverName || '').toLowerCase().includes(q) ||
        (m.roomName || '').toLowerCase().includes(q);
      const matchRoom = !this.roomFilter || (
        (m.isPrivate && this.roomFilter === `private-${m.id}`) ||
        (!m.isPrivate && m.roomId === Number(this.roomFilter))
      );
      const matchType = this.messageTypeFilter === 'all' ||
        (this.messageTypeFilter === 'group'   && !m.isPrivate) ||
        (this.messageTypeFilter === 'private' &&  m.isPrivate);
      return matchSearch && matchRoom && matchType;
    });
    this.totalPages  = Math.max(1, Math.ceil(this.filteredMessages.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  updatePage(): void {
    const s = (this.currentPage - 1) * this.pageSize;
    this.paginatedMessages = this.filteredMessages.slice(s, s + this.pageSize);
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.totalPages  = Math.max(1, Math.ceil(this.filteredMessages.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODALES & SUPPRESSION
  // ═══════════════════════════════════════════════════════════════════════════

  openDelete(m: ExtendedMessage):      void { this.messageToDelete = m; this.modalMode = 'delete';     this.cdr.markForCheck(); }
  openPermDelete(m: ExtendedMessage):  void { this.messageToDelete = m; this.modalMode = 'permDelete'; this.cdr.markForCheck(); }
  closeModal(): void { this.modalMode = null; this.messageToDelete = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.messageToDelete) return;
    this.deleting = true;
    this.cdr.markForCheck();

    if (this.modalMode === 'permDelete') {
      this.messageService.deletePermanent(this.messageToDelete.id)
        .pipe(takeUntil(this.destroy$), finalize(() => { this.deleting = false; this.cdr.markForCheck(); }))
        .subscribe({
          next: () => {
            this.messages = this.messages.filter(m => m.id !== this.messageToDelete!.id);
            this.applyFilters(); this.closeModal();
            this.pushToast('success', 'Supprimé', 'Message supprimé définitivement.');
          },
          error: () => { this.closeModal(); this.pushToast('error', 'Erreur', 'Impossible de supprimer.'); },
        });
    } else {
      this.messageService.delete(this.messageToDelete.id)
        .pipe(takeUntil(this.destroy$), finalize(() => { this.deleting = false; this.cdr.markForCheck(); }))
        .subscribe({
          next: (updated) => {
            const i = this.messages.findIndex(m => m.id === updated.id);
            if (i !== -1) this.messages[i] = updated;
            this.applyFilters(); this.closeModal();
            this.pushToast('success', 'Supprimé', 'Message marqué comme supprimé.');
          },
          error: () => { this.closeModal(); this.pushToast('error', 'Erreur', 'Impossible de supprimer.'); },
        });
    }
  }

  restoreMessage(m: ExtendedMessage): void {
    this.messageService.restore(m.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        const i = this.messages.findIndex(x => x.id === updated.id);
        if (i !== -1) this.messages[i] = updated;
        this.applyFilters();
        this.pushToast('success', 'Restauré', 'Message restauré avec succès.');
        this.cdr.markForCheck();
      },
      error: () => this.pushToast('error', 'Erreur', 'Impossible de restaurer le message.'),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  getRoomLabel(roomId: number | string): string {
    if (typeof roomId === 'number') {
      return this.messages.find(m => !m.isPrivate && m.roomId === roomId)?.roomName || `Room #${roomId}`;
    }
    const m = this.messages.find(x => x.isPrivate && `private-${x.id}` === roomId);
    return m ? `${m.senderName} ↔ ${m.receiverName}` : 'Conv. privée';
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
  trackByMsg(_: number, m: ExtendedMessage): number { return m.id; }
}