import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of, finalize, switchMap } from 'rxjs'; 
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
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat', 
  standalone: true,
  imports: [
    CommonModule,
    FormsModule   // ✅ OBLIGATOIRE pour ngModel
  ],
  templateUrl: './chat-room.html',
  styleUrls: ['./chat-room.scss', './chat-participants.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
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
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed
  activeRoom = computed(() => this.rooms().find(r => r.id === this.activeRoomId()) ?? null);
  currentUserId = computed(() => this.tokenService.getCurrentUserId());
  
  isCurrentUserParticipant = computed(() => {
    const userId = this.currentUserId();
    const parts = this.participants();
    return userId ? parts.some(p => p.user.id === userId) : false;
  });

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
  private scrollEnabled = true;

  // Download state: messageId → progress (0-100) | 'done'
  downloadProgress = new Map<number, number | 'done'>();

  ngOnInit() {
    this.loadRooms();
    this.loadAllUsers();
    this.connectWebSocket();
    this.setupWebSocketErrorHandling();
  }

  ngAfterViewChecked() {
    if (this.scrollEnabled) {
      this.scrollToBottom();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
  }

  private connectWebSocket() {
    try {
      this.wsService.connect();
    } catch (err) {
      console.error('[Chat] Failed to connect WebSocket:', err);
      this.error.set('Impossible de se connecter au serveur de chat');
    }
  }

  private setupWebSocketErrorHandling() {
    this.wsService.errors.pipe(takeUntil(this.destroy$)).subscribe(error => {
      console.error('[Chat] WebSocket error:', error);
      this.error.set(`Erreur de connexion: ${error.message}`);
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => this.error.set(null), 5000);
    });
  }

loadRooms() {
  // Check if user is authenticated first
  const token = this.tokenService.getAccessToken();
  const userId = this.currentUserId();
  
  console.log('[Chat] Authentication check:', { 
    hasToken: !!token, 
    userId: userId,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null
  });
  
  if (!token || !userId) {
    this.error.set('Vous n\'êtes pas connecté. Redirection vers la page de connexion...');
    setTimeout(() => this.router.navigate(['/auth/login']), 2000);
    return;
  }
  
  this.isLoading.set(true);
  this.error.set(null);
  
  console.log('[Chat] Loading rooms from:', environment.chatApiUrl);
  
  this.chatRoomService.getAll().pipe(
    takeUntil(this.destroy$),
    catchError((err: any) => {
      console.error('[Chat] Failed to load rooms:', err);
      
      let errorMessage = 'Impossible de charger les salons. ';
      
      if (err.status === 0) {
        errorMessage += 'Le serveur est inaccessible. ';
        errorMessage += 'Vérifiez que: ';
        errorMessage += '1) Le backend Spring Boot est lancé sur http://localhost:8081 ';
        errorMessage += '2) Le profil "chat" est activé ';
        errorMessage += '3) Vous êtes bien authentifié';
      } else if (err.status === 403) {
        errorMessage += 'Vous n\'avez pas les permissions nécessaires. ';
        errorMessage += 'Vérifiez que vous êtes connecté avec un compte valide.';
      } else if (err.status === 401) {
        errorMessage += 'Votre session a expiré. Veuillez vous reconnecter.';
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      } else {
        errorMessage += err.message || 'Erreur inconnue.';
      }
      
      this.error.set(errorMessage);
      return of([]);
    }),
    finalize(() => this.isLoading.set(false))
  ).subscribe({
    next: (rooms) => {
      console.log('[Chat] Loaded rooms successfully:', rooms);
      this.rooms.set(rooms);
      
      if (rooms.length > 0 && !this.activeRoomId()) {
        this.selectRoom(rooms[0]);
      }
    }
  });
}
  loadAllUsers() {
    const userId = this.currentUserId();
    if (!userId) return;
    
    this.profileService.getAllUsersExceptCurrent(userId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to load users', err);
        return of([]);
      })
    ).subscribe(users => {
      this.allUsers.set(users ?? []);
    });
  }

  selectRoom(room: ChatRoomResponse) {
    // Clear any previous room subscriptions
    if (this.activeRoomId()) {
      this.wsService.leaveRoom(this.activeRoomId()!);
    }

    this.activeRoomId.set(room.id);
    this.rightOpen.set(true);
    this.messages.set([]);
    this.participants.set([]);
    this.typingUsers.set([]);
    this.error.set(null);

    // Load messages
    this.isLoading.set(true);
    this.messageService.getByRoom(room.id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to load messages', err);
        this.error.set('Impossible de charger les messages');
        return of([]);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(msgs => {
      this.messages.set(msgs);
      this.scrollEnabled = true;
      setTimeout(() => this.scrollToBottom(), 100);
    });

    // Load participants
    this.participantService.getByRoom(room.id).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to load participants', err);
        return of([]);
      })
    ).subscribe(parts => {
      this.participants.set(parts);
    });

    // Join room via WebSocket
    this.wsService.joinRoom(room.id);

    // Subscribe to new messages
    this.wsService.onRoomMessages(room.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      this.messages.update(msgs => {
        // Check if message already exists (avoid duplicates)
        if (msgs.some(m => m.id === event.message.id)) {
          return msgs;
        }
        return [...msgs, event.message];
      });
      this.scrollEnabled = true;
      setTimeout(() => this.scrollToBottom(), 50);
    });

    // Subscribe to typing notifications
    this.wsService.onRoomTyping(room.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe((notif: TypingNotification) => {
      if (notif.userId === this.currentUserId()) return;
      
      // Find user email from participants
      const user = this.participants().find(p => p.user.id === notif.userId)?.user;
      const userName = user?.email ? user.email.split('@')[0] : `User ${notif.userId}`;
      
      if (notif.isTyping) {
        this.typingUsers.update(list => {
          if (!list.includes(userName)) {
            return [...list, userName];
          }
          return list;
        });
      } else {
        this.typingUsers.update(list => list.filter(u => u !== userName));
      }
    });

    // Subscribe to room activity (join/leave)
    this.wsService.onRoomActivity(room.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      console.log('[Chat] Room activity:', event);
      
      if (event.type === 'USER_JOINED') {
        // Refresh participants list
        this.participantService.getByRoom(room.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(parts => {
          this.participants.set(parts);
        });
      } else if (event.type === 'USER_LEFT') {
        // Refresh participants list
        this.participantService.getByRoom(room.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe(parts => {
          this.participants.set(parts);
        });
      }
    });
  }

  sendMessage() {
    const text = this.messageText.trim();
    const roomId = this.activeRoomId();
    
    if (!text || !roomId) return;
    
    // ✅ VÉRIFICATION : L'utilisateur doit être participant pour envoyer un message
    if (!this.isCurrentUserParticipant()) {
      this.error.set('❌ Vous ne pouvez pas envoyer de messages. Vous devez être participant de ce salon.');
      setTimeout(() => this.error.set(null), 5000);
      return;
    }
    
    console.log(`[Chat] Sending message to room ${roomId}`);
    
    // Send via WebSocket
    this.wsService.sendMessage(roomId, text);
    this.messageText = '';
    
    // Stop typing indicator
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.wsService.sendTyping(roomId, this.currentUserId()!, false);
    }
  }

  onTyping() {
    if (!this.activeRoomId()) return;
    
    // Send typing notification
    this.wsService.sendTyping(this.activeRoomId()!, this.currentUserId()!, true);
    
    // Clear previous timer
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
    }
    
    // Set timer to stop typing after 2 seconds of inactivity
    this.typingTimer = setTimeout(() => {
      this.wsService.sendTyping(this.activeRoomId()!, this.currentUserId()!, false);
    }, 2000);
  }

  deleteMessage(messageId: number) {
    if (!confirm('Supprimer ce message ?')) return;
    
    this.messageService.delete(messageId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to delete message', err);
        this.error.set('Impossible de supprimer le message');
        return of(null);
      })
    ).subscribe(updated => {
      if (updated) {
        this.messages.update(msgs => msgs.map(m => m.id === messageId ? updated : m));
      }
    });
  }

  createRoom() {
    if (!this.newRoomName.trim()) return;
    
    const userId = this.currentUserId();
    if (!userId) {
      this.error.set('Utilisateur non connecté');
      return;
    }
    
    this.isLoading.set(true);
    this.chatRoomService.create({
      name: this.newRoomName.trim(),
      type: this.newRoomType as any,
      userIds: [userId]
    }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to create room', err);
        this.error.set('Impossible de créer le salon');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe(room => {
      if (room) {
        this.rooms.update(list => [...list, room]);
        this.showCreateModal = false;
        this.selectRoom(room);
      }
    });
  }

  addParticipant(userId: number) {
    const roomId = this.activeRoomId();
    if (!roomId) return;
    
    this.participantService.add({ 
      userId, 
      chatRoomId: roomId, 
      role: 'MEMBER' as any 
    }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to add participant', err);
        this.error.set('Impossible d\'ajouter le participant');
        return of(null);
      })
    ).subscribe(p => {
      if (p) {
        this.participants.update(list => [...list, p]);
      }
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
  
  // ✅ VÉRIFICATION : L'utilisateur doit être participant pour envoyer un fichier
  if (!this.isCurrentUserParticipant()) {
    this.error.set('❌ Vous ne pouvez pas envoyer de fichiers. Vous devez être participant de ce salon.');
    setTimeout(() => this.error.set(null), 5000);
    return;
  }
  
  const fileToUpload = this.pendingFile; // Store reference before potential null
  this.uploadProgress = 0;
  
  this.fileService.uploadWithProgress(fileToUpload, this.fileDescription)
    .pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to upload file', err);
        this.error.set('Impossible d\'uploader le fichier');
        this.uploadProgress = 0;
        return of(null);
      })
    )
    .subscribe({
      next: (event) => {
        if (!event) return;
        
        // Handle progress update
        if (event.progress !== undefined) {
          this.uploadProgress = event.progress;
        }
        
        // Handle completion with result
        if (event.result) {
          // File uploaded successfully
          this.pendingFile = null;
          this.fileDescription = '';
          this.showFilesPanel = false;
          
          // Send a message with the file info
          if (this.activeRoomId()) {
            const fileName = fileToUpload.name;
            const fileSize = this.formatFileSize(fileToUpload.size);
            this.wsService.sendMessage(
              this.activeRoomId()!, 
              `📎 Fichier: ${fileName} (${fileSize})`
            );
          }
          
          // Reset progress after a delay
          setTimeout(() => this.uploadProgress = 0, 1000);
        }
      },
      error: (err) => {
        console.error('[Chat] upload error:', err);
        this.uploadProgress = 0;
        this.error.set('Erreur lors de l\'upload');
      }
    });
}

// Add helper method to format file size
private formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  refreshRooms() {
    this.loadRooms();
  }

  /** Vérifie si un message est un message fichier (format: "📎 Fichier: nom (taille)") */
  isFileMessage(content: string): boolean {
    return content?.startsWith('📎 Fichier:') ?? false;
  }

  /** Extrait le nom du fichier depuis le message */
  extractFileName(content: string): string {
    const match = content.match(/📎 Fichier: (.+?) \(/);
    return match ? match[1] : '';
  }

  /** Extrait la taille du fichier depuis le message */
  extractFileSize(content: string): string {
    const match = content.match(/\((.+?)\)$/);
    return match ? match[1] : '';
  }

  /** Retourne la progression de téléchargement pour un message */
  getDownloadProgress(msgId: number): number | 'done' | null {
    return this.downloadProgress.get(msgId) ?? null;
  }

  /** Télécharge le fichier associé à un message */
  downloadFile(msgId: number, content: string): void {
    if (this.downloadProgress.has(msgId)) return; // déjà en cours

    const fileName = this.extractFileName(content);
    if (!fileName) return;

    this.downloadProgress.set(msgId, 0);

    this.fileService.downloadWithProgress(fileName, fileName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.progress !== undefined) {
            this.downloadProgress.set(msgId, event.progress);
          }
          if (event.done) {
            this.downloadProgress.set(msgId, 'done');
            // Retire l'état "done" après 2s pour revenir au bouton normal
            setTimeout(() => {
              this.downloadProgress.delete(msgId);
            }, 2000);
          }
        },
        error: (err) => {
          console.error('[Chat] Download error:', err);
          this.downloadProgress.delete(msgId);
          this.error.set('Erreur lors du téléchargement');
          setTimeout(() => this.error.set(null), 4000);
        }
      });
  }

  requestJoinRoom() {
    const roomId = this.activeRoomId();
    const userId = this.currentUserId();
    
    if (!roomId || !userId) {
      this.error.set('Erreur: Information manquante');
      return;
    }
    
    // Add current user as participant with MEMBER role
    this.participantService.add({
      userId,
      chatRoomId: roomId,
      role: 'MEMBER' as any
    }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Chat] failed to join room', err);
        this.error.set('Impossible de rejoindre le salon');
        return of(null);
      })
    ).subscribe(p => {
      if (p) {
        this.participants.update(list => [...list, p]);
        this.error.set(null);
        setTimeout(() => {
          const roomName = this.activeRoom()?.name || 'le salon';
          this.error.set(`✅ Vous avez rejoint ${roomName}`);
        }, 100);
        setTimeout(() => this.error.set(null), 3000);
      }
    });
  }

  formatTime(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (e) {
      return '';
    }
  }

  private scrollToBottom() {
    if (this.messagesContainer?.nativeElement) {
      try {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      } catch (err) {
        console.error('[Chat] Error scrolling:', err);
      }
    }
  }
}