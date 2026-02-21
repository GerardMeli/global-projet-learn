import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs'; 
import { ChatParticipantResponse } from '../../../core/models/chat/chat-participant.model';
import { ChatRoomResponse, ChatRoomDetailResponse } from '../../../core/models/chat/chat-room.model';
import { TypingNotification } from '../../../core/models/chat/chat.mdel';
import { MessageResponse } from '../../../core/models/chat/message.model';
import { PrivateUserResponse } from '../../../core/models/users/profile.model';
import { ChatParticipantService } from '../../../core/services/chat/chat-participant.service';
import { ChatRoomService } from '../../../core/services/chat/chat-room.service';
import { ChatWebSocketService } from '../../../core/services/chat/chat.websocket.service';
import { MessageService } from '../../../core/services/chat/message.service';
import { FileManagerService } from '../../../core/services/file/file.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { TokenService } from '../../../core/services/users/token.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat', 
  imports: [
    CommonModule,
    FormsModule   // ✅ OBLIGATOIRE pour ngModel
  ],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Injected services
  private chatRoomService = inject(ChatRoomService);
  private messageService = inject(MessageService);
  private participantService = inject(ChatParticipantService);
  private wsService = inject(ChatWebSocketService);
  private fileService = inject(FileManagerService);
  private profileService = inject(ProfileService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Panel state
  leftOpen = signal(true);
  rightOpen = signal(false);

  // Data signals
  rooms = signal<ChatRoomResponse[]>([]);
  activeRoomId = signal<number | null>(null);
  activeRoomDetail = signal<ChatRoomDetailResponse | null>(null);
  messages = signal<MessageResponse[]>([]);
  participants = signal<ChatParticipantResponse[]>([]);
  allUsers = signal<PrivateUserResponse[]>([]);
  typingUsers = signal<string[]>([]);
  totalUnread = signal(0);

  // Computed
  activeRoom = computed(() => this.rooms().find(r => r.id === this.activeRoomId()) ?? null);
  currentUserId = computed(() => this.tokenService.getCurrentUserId());

  filteredRooms = computed(() => {
    let list = this.rooms();
    if (this.roomFilter() !== 'all') {
      list = list.filter(r => r.type === this.roomFilter().toUpperCase());
    }
    if (this.roomSearch) {
      list = list.filter(r => r.name.toLowerCase().includes(this.roomSearch.toLowerCase()));
    }
    return list;
  });

  availableUsers = computed(() => {
    const participantUserIds = new Set(this.participants().map(p => p.user.id));
    const currentId = this.currentUserId();
    return this.allUsers().filter(u => u.id !== currentId && !participantUserIds.has(u.id) && u.isActive);
  });

  // Local state
  roomFilter = signal<'all' | 'public' | 'private'>('all');
  roomSearch = '';
  messageText = '';
  showCreateModal = false;
  showFilesPanel = false;
  newRoomName = '';
  newRoomType = 'PUBLIC';
  pendingFile: File | null = null;
  fileDescription = '';
  uploadProgress = 0;
  viewingUserId: number | null = null;
  viewingUserEmail: string | null = null;
  private typingTimer: any;

  ngOnInit() {
    this.loadRooms();
    this.loadAllUsers();
    this.wsService.connect();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
  }

  loadRooms() {
    this.chatRoomService.getAll().pipe(takeUntil(this.destroy$)).subscribe(rooms => {
      this.rooms.set(rooms);
    });
  }

  loadAllUsers() {
    const userId = this.currentUserId();
    if (!userId) return;
    this.profileService.getAllUsersExceptCurrent(userId).pipe(takeUntil(this.destroy$)).subscribe(users => {
      this.allUsers.set(users ?? []);
    });
  }

  selectRoom(room: ChatRoomResponse) {
    if (this.activeRoomId()) {
      this.wsService.leaveRoom(this.activeRoomId()!);
    }

    this.activeRoomId.set(room.id);
    this.rightOpen.set(true);
    this.messages.set([]);
    this.participants.set([]);

    this.messageService.getByRoom(room.id).pipe(takeUntil(this.destroy$)).subscribe(msgs => {
      this.messages.set(msgs);
      setTimeout(() => this.scrollToBottom(), 50);
    });

    this.participantService.getByRoom(room.id).pipe(takeUntil(this.destroy$)).subscribe(parts => {
      this.participants.set(parts);
    });

    this.wsService.joinRoom(room.id);

    this.wsService.onRoomMessages(room.id).pipe(takeUntil(this.destroy$)).subscribe(event => {
      this.messages.update(msgs => [...msgs, event.message]);
      setTimeout(() => this.scrollToBottom(), 50);
    });

    this.wsService.onRoomTyping(room.id).pipe(takeUntil(this.destroy$)).subscribe((notif: TypingNotification) => {
      if (notif.userId === this.currentUserId()) return;
      if (notif.isTyping) {
        this.typingUsers.update(list => [...new Set([...list, `User ${notif.userId}`])]);
      } else {
        this.typingUsers.update(list => list.filter(u => u !== `User ${notif.userId}`));
      }
    });
  }

  sendMessage() {
    const text = this.messageText.trim();
    if (!text || !this.activeRoomId()) return;
    this.wsService.sendMessage(this.activeRoomId()!, text);
    this.messageText = '';
  }

  onTyping() {
    if (!this.activeRoomId()) return;
    this.wsService.sendTyping(this.activeRoomId()!, this.currentUserId()!, true);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.wsService.sendTyping(this.activeRoomId()!, this.currentUserId()!, false);
    }, 2000);
  }

  deleteMessage(messageId: number) {
    this.messageService.delete(messageId).pipe(takeUntil(this.destroy$)).subscribe(updated => {
      this.messages.update(msgs => msgs.map(m => m.id === messageId ? updated : m));
    });
  }

  openCreateRoom() {
    this.showCreateModal = true;
    this.newRoomName = '';
    this.newRoomType = 'PUBLIC';
  }

  createRoom() {
    if (!this.newRoomName.trim()) return;
    const userId = this.currentUserId();
    this.chatRoomService.create({
      name: this.newRoomName.trim(),
      type: this.newRoomType as any,
      userIds: userId ? [userId] : []
    }).pipe(takeUntil(this.destroy$)).subscribe(room => {
      this.rooms.update(list => [...list, room]);
      this.showCreateModal = false;
      this.selectRoom(room);
    });
  }

  addParticipant(userId: number) {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    this.participantService.add({ userId, chatRoomId: roomId, role: 'MEMBER' as any })
      .pipe(takeUntil(this.destroy$)).subscribe(p => {
        this.participants.update(list => [...list, p]);
      });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.pendingFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.[0]) {
      this.pendingFile = event.dataTransfer.files[0];
    }
  }

  sendFile() {
    if (!this.pendingFile) return;
    this.uploadProgress = 0;
    this.fileService.uploadWithProgress(this.pendingFile, this.fileDescription)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ progress, result }) => {
          this.uploadProgress = progress;
          if (result) {
            this.pendingFile = null;
            this.fileDescription = '';
            this.uploadProgress = 0;
          }
        },
        error: () => { this.uploadProgress = 0; }
      });
  }

  viewProfile(userId: number) {
    const user = this.allUsers().find(u => u.id === userId)
      ?? this.participants().find(p => p.user.id === userId)?.user;
    this.viewingUserId = userId;
    this.viewingUserEmail = (user as any)?.email ?? `Utilisateur ${userId}`;
  }

  startPrivateChat(userId: number) {
    this.viewingUserId = null;
    this.router.navigate(['/chat/private', userId]);
  }

  goToPrivate() {
    this.router.navigate(['/chat/private']);
  }

  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}