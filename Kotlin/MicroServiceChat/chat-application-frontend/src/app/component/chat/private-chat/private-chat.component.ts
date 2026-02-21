import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PrivateChatNotification } from '../../../core/models/chat/chat.mdel';
import { PrivateChatResponse, UserContactDTO, PrivateFileResponse } from '../../../core/models/chat/private-chat.model';
import { PrivateUserResponse } from '../../../core/models/users/profile.model';
import { ChatWebSocketService } from '../../../core/services/chat/chat.websocket.service';
import { PrivateChatService } from '../../../core/services/chat/private-chat.service';
import { FileManagerService } from '../../../core/services/file/file.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { TokenService } from '../../../core/services/users/token.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 

@Component({
  selector: 'app-private-chat',
  imports: [
    CommonModule,
    FormsModule   // ✅ OBLIGATOIRE pour ngModel
  ],
  templateUrl: './private-chat.html',
  styleUrls: ['./private-chat.scss']
})
export class PrivateChatComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  private privateChatService = inject(PrivateChatService);
  private profileService = inject(ProfileService);
  private fileService = inject(FileManagerService);
  private wsService = inject(ChatWebSocketService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // State
  leftOpen = signal(true);
  activeTab = signal<'contacts' | 'users'>('contacts');
  activeUserId = signal<number | null>(null);
  messages = signal<PrivateChatResponse[]>([]);
  contacts = signal<UserContactDTO[]>([]);
  allUsers = signal<PrivateUserResponse[]>([]);
  sharedFiles = signal<PrivateFileResponse[]>([]);
  showFiles = signal(false);
  isTyping = signal(false);
  totalUnread = signal(0);

  // Input state
  messageText = '';
  contactSearch = '';
  userSearch = '';
  showSendFile = false;
  pendingFile: File | null = null;
  fileDesc = '';
  uploadProgress = 0;
  uploading = false;
  private typingTimer: any;
  private typingHideTimer: any;

  // Computed
  currentUserId = computed(() => this.tokenService.getCurrentUserId());

  filteredContacts = computed(() => {
    const q = this.contactSearch.toLowerCase();
    return this.contacts().filter(c => !q || c.username.toLowerCase().includes(q));
  });

  filteredUsers = computed(() => {
    const q = this.userSearch.toLowerCase();
    return this.allUsers().filter(u => !q || u.email.toLowerCase().includes(q));
  });

  activeUserEmail = computed(() => {
    const id = this.activeUserId();
    if (!id) return null;
    const contact = this.contacts().find(c => c.userId === id);
    if (contact) return contact.username;
    const user = this.allUsers().find(u => u.id === id);
    return user?.email ?? `Utilisateur ${id}`;
  });

  activeUserOnline = computed(() => {
    const id = this.activeUserId();
    if (!id) return false;
    return this.allUsers().find(u => u.id === id)?.isActive ?? false;
  });

  ngOnInit() {
    this.loadContacts();
    this.loadAllUsers();
    this.setupWsSubscriptions();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('userId') ?? params.get('id');
      if (id) this.openConversation(+id);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts() {
    const uid = this.currentUserId();
    if (!uid) return;
    this.privateChatService.getContacts(uid).pipe(takeUntil(this.destroy$)).subscribe(contacts => {
      this.contacts.set(contacts);
      this.totalUnread.set(contacts.reduce((sum, c) => sum + c.unreadCount, 0));
    });
  }

  loadAllUsers() {
    const uid = this.currentUserId();
    if (!uid) return;
    this.profileService.getAllUsersExceptCurrent(uid).pipe(takeUntil(this.destroy$)).subscribe(users => {
      this.allUsers.set(users ?? []);
    });
  }

  setupWsSubscriptions() {
    const uid = this.currentUserId();
    if (!uid) return;

    this.wsService.onPrivateMessages(uid).pipe(takeUntil(this.destroy$)).subscribe((notif: PrivateChatNotification) => {
      if (notif.senderId === this.activeUserId() || notif.isOwnMessage) {
        const otherId = notif.isOwnMessage ? this.activeUserId()! : notif.senderId;
        this.loadMessages(otherId);
      }
      this.loadContacts();
    });

    this.wsService.onPrivateTyping(uid).pipe(takeUntil(this.destroy$)).subscribe(notif => {
      if (notif.userId === this.activeUserId()) {
        this.isTyping.set(notif.isTyping);
        if (notif.isTyping) {
          clearTimeout(this.typingHideTimer);
          this.typingHideTimer = setTimeout(() => this.isTyping.set(false), 3000);
        }
      }
    });
  }

  selectContact(contact: UserContactDTO) {
    this.openConversation(contact.userId);
  }

  selectUser(user: PrivateUserResponse) {
    this.openConversation(user.id);
    this.activeTab.set('contacts');
  }

  openConversation(userId: number) {
    this.activeUserId.set(userId);
    this.messages.set([]);
    this.showFiles.set(false);
    this.loadMessages(userId);
    this.markRead();
  }

  loadMessages(userId: number) {
    const uid = this.currentUserId();
    if (!uid) return;
    this.privateChatService.getConversation(uid, userId).pipe(takeUntil(this.destroy$)).subscribe(msgs => {
      this.messages.set(msgs);
      setTimeout(() => this.scrollToBottom(), 50);
    });
  }

  markRead() {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!uid || !otherId) return;
    const unreadIds = this.messages()
      .filter(m => !m.isRead && m.senderId1 === otherId)
      .map(m => m.id);
    if (unreadIds.length > 0) {
      this.privateChatService.markAsRead(uid, { messageIds: unreadIds }).subscribe();
      this.loadContacts();
    }
  }

  sendMessage() {
    const text = this.messageText.trim();
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!text || !uid || !otherId) return;

    this.wsService.sendPrivateMessage(uid, otherId, text);
    this.messageText = '';
  }

  onTyping() {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!uid || !otherId) return;
    this.wsService.sendPrivateTyping(uid, otherId, true);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.wsService.sendPrivateTyping(uid, otherId, false);
    }, 2000);
  }

  loadSharedFiles() {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!uid || !otherId) return;
    this.privateChatService.getFilesBetween(uid, otherId).pipe(takeUntil(this.destroy$)).subscribe(files => {
      this.sharedFiles.set(files);
      this.showFiles.set(true);
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.pendingFile = input.files[0];
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files?.[0]) this.pendingFile = event.dataTransfer.files[0];
  }

  sendFile() {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!this.pendingFile || !uid || !otherId) return;
    this.uploading = true;
    this.uploadProgress = 0;

    this.privateChatService.sendFile(uid, otherId, this.pendingFile, this.fileDesc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.sharedFiles.update(files => [result, ...files]);
          this.pendingFile = null;
          this.fileDesc = '';
          this.uploading = false;
          this.uploadProgress = 100;
          setTimeout(() => { this.uploadProgress = 0; }, 1000);
          this.loadMessages(otherId);
        },
        error: () => { this.uploading = false; this.uploadProgress = 0; }
      });
  }

  goToRooms() {
    this.router.navigate(['/chat']);
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    return '📁';
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