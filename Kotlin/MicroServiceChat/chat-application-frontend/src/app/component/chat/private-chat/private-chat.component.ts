import { Component, OnInit, OnDestroy, signal, computed, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { PrivateChatNotification, TypingNotification, MessagesReadNotification } from '../../../core/models/chat/chat.mdel';
import { PrivateChatResponse, UserContactDTO, PrivateFileResponse } from '../../../core/models/chat/private-chat.model';
import { PrivateUserResponse } from '../../../core/models/users/profile.model';
import { ChatWebSocketService } from '../../../core/services/chat/chat.websocket.service';
import { PrivateChatService } from '../../../core/services/chat/private-chat.service';
import { FileManagerService } from '../../../core/services/file/file.service';
import { ProfileService } from '../../../core/services/users/profile.service';
import { TokenService } from '../../../core/services/users/token.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-private-chat',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './private-chat.html',
  styleUrls: ['./private-chat.scss']
})
export class PrivateChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private destroy$ = new Subject<void>();

  private privateChatService = inject(PrivateChatService);
  private profileService = inject(ProfileService);
  private fileService = inject(FileManagerService);
  private wsService = inject(ChatWebSocketService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('filePreview') filePreview!: ElementRef;

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
  loadingMessages = signal(false);
  private shouldScroll = false;

  // Upload state
  showSendFile = signal(false);
  pendingFile: File | null = null;
  fileDesc = '';
  uploadProgress = 0;
  uploading = false;
  filePreviewUrl: SafeUrl | null = null;
  fileError = signal<string | null>(null);
  dragActive = signal(false);
  acceptedFileTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  maxFileSize = 50 * 1024 * 1024; // 50 MB

  // Input state
  messageText = '';
  contactSearch = '';
  userSearch = '';
  
  private typingTimer: any;
  private typingHideTimer: any;

  // Computed
  currentUserId = computed(() => this.tokenService.getCurrentUserId());

  // Helper pour extraire le nom d'utilisateur avant le @
  getUsernameFromEmail(email: string): string {
    if (!email) return '';
    return email.split('@')[0];
  }

  // Helper pour obtenir l'icône du fichier
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '🗜️';
    if (mimeType.startsWith('video/')) return '🎬';
    if (mimeType.startsWith('audio/')) return '🎵';
    return '📁';
  }

  // Helper pour formater la taille du fichier
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Vérifier si le fichier est une image
  isImageFile(file: File | PrivateFileResponse): boolean {
    if (file instanceof File) {
      return file.type.startsWith('image/');
    } else {
      return file.fileType?.startsWith('image/') || false;
    }
  }

  // Obtenir l'URL sécurisée pour l'aperçu
  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getContactOnlineStatus(userId: number): boolean {
    return this.allUsers().find(u => u.id === userId)?.isActive ?? false;
  }

  filteredContacts = computed(() => {
    const q = this.contactSearch.toLowerCase();
    return this.contacts()
      .map(contact => ({
        ...contact,
        isOnline: this.getContactOnlineStatus(contact.userId),
        displayName: this.getUsernameFromEmail(contact.username)
      }))
      .filter(c => !q || 
        c.username.toLowerCase().includes(q) || 
        c.displayName.toLowerCase().includes(q)
      );
  });

  filteredUsers = computed(() => {
    const q = this.userSearch.toLowerCase();
    return this.allUsers()
      .map(user => ({
        ...user,
        displayName: this.getUsernameFromEmail(user.email)
      }))
      .filter(u => !q || 
        u.email.toLowerCase().includes(q) || 
        u.displayName.toLowerCase().includes(q)
      );
  });

  activeUserEmail = computed(() => {
    const id = this.activeUserId();
    if (!id) return null;
    const contact = this.contacts().find(c => c.userId === id);
    if (contact) return contact.username;
    const user = this.allUsers().find(u => u.id === id);
    return user?.email ?? `Utilisateur ${id}`;
  });

  activeUserDisplayName = computed(() => {
    const email = this.activeUserEmail();
    return email ? this.getUsernameFromEmail(email) : null;
  });

  activeUserOnline = computed(() => {
    const id = this.activeUserId();
    if (!id) return false;
    return this.allUsers().find(u => u.id === id)?.isActive ?? false;
  });

  // Propriétés pour le drag & drop
  isFileValid = computed(() => {
    if (!this.pendingFile) return false;
    
    // Vérifier la taille
    if (this.pendingFile.size > this.maxFileSize) {
      this.fileError.set(`Fichier trop volumineux (max ${this.formatFileSize(this.maxFileSize)})`);
      return false;
    }
    
    // Vérifier le type (simplifié)
    const fileType = this.pendingFile.type;
    const isValidType = this.acceptedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return fileType.startsWith(category);
      }
      return type === fileType;
    });
    
    if (!isValidType) {
      this.fileError.set('Type de fichier non supporté');
      return false;
    }
    
    this.fileError.set(null);
    return true;
  });

  ngOnInit() {
    const currentUserId = this.currentUserId();
    console.log('Current user ID:', currentUserId);
    
    if (currentUserId) {
      // Connecter WebSocket
      this.wsService.connect();
      
      // Attendre la connexion WebSocket avant de souscrire
      setTimeout(() => {
        this.setupWsSubscriptions();
      }, 1000);
      
      this.loadContacts();
      this.loadAllUsers();
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('userId') ?? params.get('id');
      if (id) {
        this.openConversation(parseInt(id, 10));
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    if (this.typingTimer) clearTimeout(this.typingTimer);
    if (this.typingHideTimer) clearTimeout(this.typingHideTimer);
    this.clearFilePreview();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContacts() {
    const uid = this.currentUserId();
    if (!uid) return;
    
    this.privateChatService.getContacts(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (contacts) => {
          console.log('Contacts loaded:', contacts);
          this.contacts.set(contacts);
          this.totalUnread.set(contacts.reduce((sum, c) => sum + c.unreadCount, 0));
        },
        error: (err) => console.error('Error loading contacts:', err)
      });
  }

  loadAllUsers() {
    const uid = this.currentUserId();
    if (!uid) return;
    
    this.profileService.getAllUsersExceptCurrent(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          console.log('All users loaded:', users);
          this.allUsers.set(users ?? []);
        },
        error: (err) => console.error('Error loading users:', err)
      });
  }

  setupWsSubscriptions() {
    const uid = this.currentUserId();
    if (!uid) {
      console.log('No user ID for WebSocket subscriptions');
      return;
    }

    console.log('Setting up WebSocket subscriptions for user:', uid);

    // 1. Souscription aux messages privés entrants
    this.wsService.onPrivateMessages(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notif: PrivateChatNotification) => {
          console.log('📨 PRIVATE MESSAGE RECEIVED:', notif);
          
          // Si le message est pour la conversation active
          if (notif.senderId === this.activeUserId()) {
            console.log('Message for active conversation, adding to messages');
            
            // Créer un objet message à partir de la notification
            const newMessage: PrivateChatResponse = {
              id: notif.messageId,
              senderId1: notif.senderId,
              senderId2: uid,
              senderName1: notif.senderName,
              senderName2: this.activeUserEmail() || '',
              content: notif.content,
              timestamp: notif.timestamp,
              isRead: false
            };
            
            // Ajouter le message à la liste
            this.messages.update(msgs => [...msgs, newMessage]);
            this.shouldScroll = true;
            
            // Marquer comme lu immédiatement
            this.markMessagesAsRead([newMessage]);
          }
          
          // Mettre à jour les contacts pour le dernier message
          this.loadContacts();
        },
        error: (err) => console.error('Error in private messages subscription:', err)
      });

    // 2. Souscription aux notifications de typing
    this.wsService.onPrivateTyping(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notif: TypingNotification) => {
          console.log('✏️ TYPING NOTIFICATION:', notif);
          if (notif.userId === this.activeUserId()) {
            this.isTyping.set(notif.isTyping);
            if (notif.isTyping) {
              clearTimeout(this.typingHideTimer);
              this.typingHideTimer = setTimeout(() => this.isTyping.set(false), 3000);
            }
          }
        }
      });

    // 3. Souscription aux confirmations de lecture
    this.wsService.onMessagesRead(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notif: MessagesReadNotification) => {
          console.log('✓ READ RECEIPT:', notif);
          if (this.activeUserId() === notif.readerId) {
            this.messages.update(msgs => 
              msgs.map(msg => ({
                ...msg,
                isRead: notif.messageIds.includes(msg.id) ? true : msg.isRead
              }))
            );
          }
        }
      });

    // 4. Souscription aux notifications de fichiers
    this.wsService.onPrivateFiles(uid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notif) => {
          console.log('📎 FILE NOTIFICATION:', notif);
          if (notif.senderId === this.activeUserId()) {
            // Recharger les messages pour voir le fichier
            this.loadMessages(notif.senderId);
            // Recharger les fichiers partagés si le panneau est ouvert
            if (this.showFiles()) {
              this.loadSharedFiles();
            }
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
    console.log('Opening conversation with user:', userId);
    this.activeUserId.set(userId);
    this.messages.set([]);
    this.showFiles.set(false);
    this.isTyping.set(false);
    this.loadMessages(userId);
  }

  loadMessages(userId: number) {
    const uid = this.currentUserId();
    if (!uid) return;

    console.log(`Loading messages between ${uid} and ${userId}`);
    this.loadingMessages.set(true);

    this.privateChatService.getConversation(uid, userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingMessages.set(false);
        })
      )
      .subscribe({
        next: (messages) => {
          console.log(`Loaded ${messages.length} messages`);
          
          if (messages && messages.length > 0) {
            const sortedMessages = messages.sort((a, b) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            
            this.messages.set(sortedMessages);
            this.shouldScroll = true;
            
            // Marquer comme lus
            this.markMessagesAsRead(sortedMessages);
          } else {
            this.messages.set([]);
          }
        },
        error: (err) => {
          console.error('Error loading messages:', err);
          this.messages.set([]);
        }
      });
  }

  markMessagesAsRead(messages: PrivateChatResponse[]) {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    if (!uid || !otherId) return;
    
    const unreadIds = messages
      .filter(m => !m.isRead && m.senderId1 === otherId)
      .map(m => m.id);
    
    if (unreadIds.length > 0) {
      console.log('Marking messages as read:', unreadIds);
      
      this.privateChatService.markAsRead(uid, { messageIds: unreadIds })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Messages marked as read');
            this.messages.update(msgs =>
              msgs.map(msg => 
                unreadIds.includes(msg.id) ? { ...msg, isRead: true } : msg
              )
            );
            this.loadContacts();
          },
          error: (err) => console.error('Error marking messages as read:', err)
        });
    }
  }

  sendMessage() {
    const text = this.messageText.trim();
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    
    if (!text || !uid || !otherId) return;

    console.log(`Sending message to ${otherId}: ${text}`);
    
    // Créer un message temporaire pour un affichage immédiat
    const tempMessage: PrivateChatResponse = {
      id: Date.now(), // ID temporaire
      senderId1: uid,
      senderId2: otherId,
      senderName1: this.activeUserEmail() || '',
      senderName2: this.activeUserEmail() || '',
      content: text,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    // Afficher immédiatement le message
    this.messages.update(msgs => [...msgs, tempMessage]);
    this.shouldScroll = true;
    this.messageText = '';
    
    // Arrêter l'indicateur de typing
    this.wsService.sendPrivateTyping(uid, otherId, false);
    if (this.typingTimer) clearTimeout(this.typingTimer);
    
    // Envoyer via WebSocket
    this.wsService.sendPrivateMessage(uid, otherId, text);
    
    // Recharger pour avoir le vrai ID (optionnel)
    setTimeout(() => {
      if (this.activeUserId() === otherId) {
        this.loadMessages(otherId);
      }
    }, 1000);
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
    
    this.privateChatService.getFilesBetween(uid, otherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (files) => {
          console.log('Shared files loaded:', files);
          this.sharedFiles.set(files);
          this.showFiles.set(true);
        },
        error: (err) => console.error('Error loading shared files:', err)
      });
  }

  // ========== GESTION DES FICHIERS AMÉLIORÉE ==========

  toggleFileUpload() {
    this.showSendFile.update(val => !val);
    if (!this.showSendFile()) {
      this.clearFileSelection();
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive.set(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileSelection(input.files[0]);
    }
  }

  handleFileSelection(file: File) {
    console.log('File selected:', file.name, file.type, file.size);
    
    // Réinitialiser les erreurs
    this.fileError.set(null);
    
    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      this.fileError.set(`Fichier trop volumineux (max ${this.formatFileSize(this.maxFileSize)})`);
      return;
    }
    
    // Vérifier le type (optionnel - à adapter selon vos besoins)
    // if (!this.isValidFileType(file)) {
    //   this.fileError.set('Type de fichier non supporté');
    //   return;
    // }
    
    this.pendingFile = file;
    
    // Créer un aperçu pour les images
    if (this.isImageFile(file)) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreviewUrl = this.sanitizer.bypassSecurityTrustUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreviewUrl = null;
    }
  }

  isValidFileType(file: File): boolean {
    return this.acceptedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return file.type.startsWith(category);
      }
      return type === file.type;
    });
  }

  clearFileSelection() {
    this.pendingFile = null;
    this.fileDesc = '';
    this.fileError.set(null);
    this.filePreviewUrl = null;
    this.uploadProgress = 0;
    
    // Réinitialiser l'input file
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearFilePreview() {
    if (this.filePreviewUrl) {
      this.filePreviewUrl = null;
    }
  }

  cancelUpload() {
    this.clearFileSelection();
  }

  sendFile() {
    const uid = this.currentUserId();
    const otherId = this.activeUserId();
    
    if (!this.pendingFile || !uid || !otherId) {
      console.log('Cannot send file: missing data');
      return;
    }
    
    if (!this.isFileValid()) {
      console.log('File validation failed');
      return;
    }
    
    console.log('Sending file:', this.pendingFile.name);
    this.uploading = true;
    this.uploadProgress = 0;
    this.fileError.set(null);

    // Simuler la progression pour une meilleure UX
    const interval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress = Math.min(this.uploadProgress + 5, 90);
      }
    }, 200);

    this.privateChatService.sendFile(uid, otherId, this.pendingFile, this.fileDesc)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          clearInterval(interval);
        })
      )
      .subscribe({
        next: (result) => {
          console.log('File sent successfully:', result);
          clearInterval(interval);
          this.uploadProgress = 100;
          
          // Ajouter le fichier à la liste des fichiers partagés
          this.sharedFiles.update(files => [result, ...files]);
          
          // Créer un message temporaire pour le fichier
          const fileMessage: PrivateChatResponse = {
            id: result.messageId,
            senderId1: uid,
            senderId2: otherId,
            senderName1: this.activeUserEmail() || '',
            senderName2: this.activeUserEmail() || '',
            content: `📎 ${result.originalFileName}`,
            timestamp: new Date().toISOString(),
            isRead: false
          };
          
          // Ajouter le message à la conversation
          this.messages.update(msgs => [...msgs, fileMessage]);
          this.shouldScroll = true;
          
          // Réinitialiser l'état
          setTimeout(() => {
            this.clearFileSelection();
            this.uploading = false;
            this.uploadProgress = 0;
            this.showSendFile.set(false);
          }, 1000);
          
          // Recharger les messages pour être sûr
          setTimeout(() => {
            if (this.activeUserId() === otherId) {
              this.loadMessages(otherId);
            }
          }, 2000);
        },
        error: (err) => {
          console.error('Error sending file:', err);
          clearInterval(interval);
          this.uploading = false;
          this.uploadProgress = 0;
          this.fileError.set('Erreur lors de l\'envoi du fichier');
        }
      });
  }

  // Télécharger un fichier
  downloadFile(file: PrivateFileResponse) {
    console.log('Downloading file:', file.originalFileName);
    
    // Utiliser l'URL de téléchargement fournie par le service
    if (file.downloadUrl) {
      window.open(file.downloadUrl, '_blank');
    } else {
      // Fallback: utiliser le service de fichiers
      this.fileService.downloadById(file.fileId || 0)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.originalFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          },
          error: (err) => console.error('Error downloading file:', err)
        });
    }
  }

  // Afficher un fichier (pour les images)
  viewFile(file: PrivateFileResponse) {
    if (this.isImageFile(file as any)) {
      window.open(file.downloadUrl, '_blank');
    } else {
      this.downloadFile(file);
    }
  }

  goToRooms() {
    this.router.navigate(['/chat/room']);
  }

  formatTime(timestamp: string): string {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Aujourd'hui : afficher l'heure
        return date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (diffDays === 1) {
        return 'Hier';
      } else if (diffDays < 7) {
        return date.toLocaleDateString('fr-FR', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        });
      }
    } catch (e) {
      return timestamp;
    }
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer?.nativeElement) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}