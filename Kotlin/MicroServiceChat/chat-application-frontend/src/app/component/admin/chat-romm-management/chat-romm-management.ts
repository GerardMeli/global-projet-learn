// admin-chat-rooms.component.ts
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { RouterModule }  from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';

import { ChatRoomService }         from '../../../core/services/chat/chat-room.service';
import { ChatParticipantService }  from '../../../core/services/chat/chat-participant.service';
import { AdminService }            from '../../../core/services/users/admin.service';
import { ChatRoomResponse, ChatRoomCreateRequest } from '../../../core/models/chat/chat-room.model';
import { UserProfileResponse }     from '../../../core/models/users/profile.model';
import { ParticipantRole }         from '../../../core/models/chat/chat.mdel';

// ─── Types locaux ─────────────────────────────────────────────────────────────
export type ToastType  = 'success' | 'error' | 'warning' | 'info';
export type ModalMode  = 'detail' | 'create' | 'addParticipants' | 'delete' | null;

export interface Toast {
  id: number; type: ToastType; title: string; text?: string; leaving?: boolean;
}

@Component({
  selector:        'app-admin-chat-rooms',
  standalone:      true,
  imports:         [CommonModule, FormsModule, RouterModule],
  templateUrl:     './chat-romm-management.html',
  styleUrls:       ['./chat-romm-management.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChatRoomsComponent implements OnInit, OnDestroy {

  // ── Données ────────────────────────────────────────────────────────────────
  rooms:          ChatRoomResponse[] = [];
  filteredRooms:  ChatRoomResponse[] = [];
  paginatedRooms: ChatRoomResponse[] = [];
  allUsers:       UserProfileResponse[] = [];
  filteredUsers:  UserProfileResponse[] = [];
  roomParticipants: any[] = [];

  // ── Stats ──────────────────────────────────────────────────────────────────
  stats = { total: 0, public: 0, private: 0, participants: 0 };

  // ── Filtres ────────────────────────────────────────────────────────────────
  searchTerm  = '';
  typeFilter  = '';
  private readonly search$ = new Subject<string>();

  // ── Pagination ─────────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 10;
  totalPages  = 1;
  readonly pageSizeOptions = [10, 25, 50];

  // ── États ──────────────────────────────────────────────────────────────────
  loading         = false;
  loadingParticipants = false;
  creatingRoom    = false;
  deletingRoom    = false;
  addingParticipants = false;

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalMode:     ModalMode  = null;
  selectedRoom:  ChatRoomResponse | null = null;
  roomToDelete:  ChatRoomResponse | null = null;
  roomForParticipants: ChatRoomResponse | null = null;

  // ── Formulaire création ────────────────────────────────────────────────────
  newRoom = { name: '', type: 'PUBLIC', description: '' };
  selectedUserIds: Set<number> = new Set();
  userSearchTerm  = '';
  private readonly userSearch$ = new Subject<string>();

  // ── Toasts ─────────────────────────────────────────────────────────────────
  toasts:     Toast[] = [];
  private tid = 0;

  // ── Math (template) ───────────────────────────────────────────────────────
  readonly Math = Math;

  // ── Getters stats ──────────────────────────────────────────────────────────
  get statTotal():       number { return this.rooms.length; }
  get statPublic():      number { return this.rooms.filter(r => r.type === 'PUBLIC').length; }
  get statPrivate():     number { return this.rooms.filter(r => r.type === 'PRIVATE').length; }
  get hasActiveFilters():boolean { return !!(this.searchTerm || this.typeFilter); }

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly chatRoomService:    ChatRoomService,
    private readonly participantService: ChatParticipantService,
    private readonly adminService:       AdminService,
    private readonly cdr:                ChangeDetectorRef,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    // Recherche réactive avec debounce
    this.search$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => this.applyFilters());

    // Recherche utilisateurs réactive
    this.userSearch$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(() => this.filterUsers());

    this.loadData();
    this.loadAllUsers();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeModal(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.chatRoomService.getAll()
      .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.updateStats();
          this.applyFilters();
          this.pushToast('success', 'Chargé', `${rooms.length} salles chargées.`);
        },
        error: () => this.pushToast('error', 'Erreur', 'Impossible de charger les salles.'),
      });
  }

  loadAllUsers(): void {
    this.adminService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.allUsers = res.data || [];
        this.filterUsers();
        this.cdr.markForCheck();
      },
      error: () => { this.allUsers = []; },
    });
  }

  private updateStats(): void {
    this.stats = {
      total:        this.rooms.length,
      public:       this.rooms.filter(r => r.type === 'PUBLIC').length,
      private:      this.rooms.filter(r => r.type === 'PRIVATE').length,
      participants: this.rooms.reduce((s, r) => s + (r.participantCount || 0), 0),
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRES & PAGINATION
  // ═══════════════════════════════════════════════════════════════════════════

  onSearchInput(): void { this.search$.next(this.searchTerm); }
  onFilterChange(): void { this.applyFilters(); }

  applyFilters(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredRooms = this.rooms.filter(r => {
      const matchName = !q || r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
      const matchType = !this.typeFilter || r.type === this.typeFilter;
      return matchName && matchType;
    });
    this.totalPages  = Math.max(1, Math.ceil(this.filteredRooms.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  updatePage(): void {
    const s = (this.currentPage - 1) * this.pageSize;
    this.paginatedRooms = this.filteredRooms.slice(s, s + this.pageSize);
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.totalPages  = Math.max(1, Math.ceil(this.filteredRooms.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODALES
  // ═══════════════════════════════════════════════════════════════════════════

  openCreate(): void {
    this.newRoom = { name: '', type: 'PUBLIC', description: '' };
    this.selectedUserIds.clear();
    this.userSearchTerm = '';
    this.filterUsers();
    this.modalMode = 'create';
    this.cdr.markForCheck();
  }

  openDetail(room: ChatRoomResponse): void {
    this.selectedRoom = room;
    this.roomParticipants = [];
    this.loadingParticipants = true;
    this.modalMode = 'detail';
    this.cdr.markForCheck();

    // Charger les users si pas encore disponibles (garantit le lookup des noms)
    if (this.allUsers.length === 0) this.loadAllUsers();

    this.participantService.getByRoom(room.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (p) => {
          this.roomParticipants = p || [];
          this.loadingParticipants = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loadingParticipants = false;
          this.pushToast('error', 'Erreur', 'Impossible de charger les participants.');
          this.cdr.markForCheck();
        },
      });
  }

  openAddParticipants(room: ChatRoomResponse): void {
    this.roomForParticipants = room;
    this.selectedUserIds.clear();
    this.userSearchTerm = '';
    this.filterUsers();
    this.modalMode = 'addParticipants';
    this.cdr.markForCheck();
  }

  openDelete(room: ChatRoomResponse): void {
    this.roomToDelete = room;
    this.modalMode = 'delete';
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.modalMode           = null;
    this.selectedRoom        = null;
    this.roomToDelete        = null;
    this.roomForParticipants = null;
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CRUD
  // ═══════════════════════════════════════════════════════════════════════════

  createRoom(): void {
    if (!this.newRoom.name.trim()) {
      this.pushToast('warning', 'Champ requis', 'Le nom de la salle est obligatoire.');
      return;
    }
    this.creatingRoom = true;
    this.cdr.markForCheck();

    const req: ChatRoomCreateRequest = {
      name:    this.newRoom.name.trim(),
      type:    this.newRoom.type as any,
      userIds: Array.from(this.selectedUserIds),
    };

    this.chatRoomService.create(req)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.creatingRoom = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (room) => {
          this.rooms = [...this.rooms, room];
          this.updateStats();
          this.applyFilters();
          this.closeModal();
          this.pushToast('success', 'Créée', `Salle « ${room.name} » créée avec succès.`);
        },
        error: (e) => this.pushToast('error', 'Erreur', e.error?.message || 'Impossible de créer la salle.'),
      });
  }

  confirmDelete(): void {
    if (!this.roomToDelete) return;
    this.deletingRoom = true;
    this.cdr.markForCheck();

    const name = this.roomToDelete.name;
    this.chatRoomService.delete(this.roomToDelete.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.deletingRoom = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.rooms = this.rooms.filter(r => r.id !== this.roomToDelete!.id);
          this.updateStats();
          this.applyFilters();
          this.closeModal();
          this.pushToast('success', 'Supprimée', `Salle « ${name} » supprimée.`);
        },
        error: (e) => this.pushToast('error', 'Erreur', e.error?.message || 'Impossible de supprimer la salle.'),
      });
  }

  addParticipants(): void {
    if (!this.roomForParticipants || !this.selectedUserIds.size) return;
    this.addingParticipants = true;
    this.cdr.markForCheck();

    const roomId  = this.roomForParticipants.id;
    const userIds = Array.from(this.selectedUserIds);
    let done = 0;

    userIds.forEach(uid => {
      this.participantService.add({ userId: uid, chatRoomId: roomId, role: ParticipantRole.MEMBER })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            done++;
            if (done === userIds.length) {
              this.addingParticipants = false;
              this.closeModal();
              this.loadData();
              this.pushToast('success', 'Ajoutés', `${done} participant(s) ajouté(s).`);
              this.cdr.markForCheck();
            }
          },
          error: () => {
            this.addingParticipants = false;
            this.pushToast('error', 'Erreur', 'Certains participants n\'ont pas pu être ajoutés.');
            this.cdr.markForCheck();
          },
        });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UTILISATEURS
  // ═══════════════════════════════════════════════════════════════════════════

  onUserSearchInput(): void { this.userSearch$.next(this.userSearchTerm); }

  filterUsers(): void {
    const q = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(u =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName  || '').toLowerCase().includes(q)
    );
    this.cdr.markForCheck();
  }

  toggleUser(id: number): void {
    this.selectedUserIds.has(id) ? this.selectedUserIds.delete(id) : this.selectedUserIds.add(id);
    this.cdr.markForCheck();
  }
  isSelected(id: number): boolean { return this.selectedUserIds.has(id); }

  getUserName(u: UserProfileResponse): string {
    const p = [u.firstName, u.lastName].filter(Boolean);
    return p.join(' ') || u.email;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS VISUELS
  // ═══════════════════════════════════════════════════════════════════════════

  // Lookup d'un utilisateur dans allUsers par son id
  getUserById(userId: number): UserProfileResponse | undefined {
    return this.allUsers.find(u => u.id === userId);
  }

  // Résout l'id réel du participant — supporte p.user.id ET p.userId (legacy)
  private resolveUserId(participant: any): number | undefined {
    return participant?.user?.id ?? participant?.userId;
  }

  // Nom complet d'un participant
  // Priorité : p.user (objet imbriqué) → lookup allUsers → fallback id
  getParticipantName(participant: any): string {
    // Le backend renvoie un objet user imbriqué
    const u = participant?.user;
    if (u) {
      const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
      return full || u.email || `Utilisateur #${u.id}`;
    }
    // Fallback : lookup dans allUsers via userId à plat
    const uid = this.resolveUserId(participant);
    if (uid !== undefined) {
      const found = this.getUserById(uid);
      if (found) {
        const full = [found.firstName, found.lastName].filter(Boolean).join(' ');
        return full || found.email;
      }
      return `Utilisateur #${uid}`;
    }
    return 'Utilisateur inconnu';
  }

  // Email du participant
  getParticipantEmail(participant: any): string {
    return participant?.user?.email ?? this.getUserById(this.resolveUserId(participant)!)?.email ?? '';
  }

  // Initiales d'un participant
  getParticipantInitials(participant: any): string {
    const u = participant?.user;
    if (u?.firstName && u?.lastName) return (u.firstName[0] + u.lastName[0]).toUpperCase();
    if (u?.firstName) return u.firstName.slice(0, 2).toUpperCase();
    if (u?.email) return u.email.slice(0, 2).toUpperCase();
    // Fallback allUsers
    const uid = this.resolveUserId(participant);
    if (uid !== undefined) {
      const found = this.getUserById(uid);
      if (found?.firstName && found?.lastName) return (found.firstName[0] + found.lastName[0]).toUpperCase();
      if (found?.email) return found.email.slice(0, 2).toUpperCase();
    }
    return 'U?';
  }

  getInitials(participant: any): string {
    return this.getParticipantInitials(participant);
  }

  private readonly GRADIENTS = [
    'linear-gradient(135deg,#2563eb,#7c3aed)',
    'linear-gradient(135deg,#0891b2,#2563eb)',
    'linear-gradient(135deg,#16a34a,#0891b2)',
    'linear-gradient(135deg,#d97706,#ef4444)',
    'linear-gradient(135deg,#be185d,#7c3aed)',
  ];
  getGradient(id: number): string { return this.GRADIENTS[id % this.GRADIENTS.length]; }

  getRoleBadgeClass(role: string): string {
    return ({ ADMIN:'badge--admin', MODERATOR:'badge--mod', MEMBER:'badge--member' } as any)[role] || '';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TOASTS
  // ═══════════════════════════════════════════════════════════════════════════

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

  toastIcon(t: ToastType): string {
    return { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' }[t];
  }

  // ── trackBy ────────────────────────────────────────────────────────────────
  trackByRoom(_: number, r: ChatRoomResponse):  number { return r.id; }
  trackByUser(_: number, u: UserProfileResponse): number { return u.id; }
  trackByToast(_: number, t: Toast): number { return t.id; }
}