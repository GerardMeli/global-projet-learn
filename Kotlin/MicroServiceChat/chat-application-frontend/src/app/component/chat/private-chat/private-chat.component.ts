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
  notificationMessage = signal<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  // Download state: fileId → progress (0-100) | 'done'
  fileDownloadProgress = new Map<number, number | 'done'>();
  // Download state for inline messages: messageId → progress | 'done'
  msgDownloadProgress = new Map<number, number | 'done'>();
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
  acceptedFileTypes = signal(['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']);
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
    if (!mimeType) return '📁';
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
    const file = this.pendingFile;
    if (!file) return false;

    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      return false;
    }

    // Vérifier le type (simplifié)
    const fileType = file.type || '';
    const isValidType = this.acceptedFileTypes().some((type: string) => {
      if (type.endsWith('/*')) {
        const category = type.replace('/*', '');
        return fileType.startsWith(category);
      }
      return type === fileType;
    });

    return !!isValidType;
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

  // ========== GESTION DES FICHIERS ==========

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
    
    this.pendingFile = file;
    this.validatePendingFile();
    
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

  // Validate pendingFile and set fileError signal accordingly
  private validatePendingFile() {
    if (!this.pendingFile) {
      this.fileError.set(null);
      return;
    }

    if (this.pendingFile.size > this.maxFileSize) {
      this.fileError.set(`Fichier trop volumineux (max ${this.formatFileSize(this.maxFileSize)})`);
      return;
    }

    if (!this.isValidFileType(this.pendingFile)) {
      this.fileError.set('Type de fichier non supporté');
      return;
    }

    this.fileError.set(null);
  }

  isValidFileType(file: File): boolean {
    return this.acceptedFileTypes().some((type: string) => {
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
      this.fileError.set('Données manquantes pour l\'envoi du fichier');
      return;
    }
    
    if (!this.isFileValid()) {
      this.fileError.set('Fichier non valide (taille ou type non supporté)');
      return;
    }
    
    const fileToSend = this.pendingFile;
    console.log('Sending file:', fileToSend.name);
    this.uploading = true;
    this.uploadProgress = 0;
    this.fileError.set(null);

    // Use real XHR-based progress via privateChatService.sendFile wrapped with XHR
    // Since privateChatService.sendFile returns an Observable<PrivateFileResponse> without progress,
    // we use fileService.uploadWithProgress first then send the link, OR we manually track via XHR.
    // Strategy: use a fake-but-fast progress based on XHR, falling back to the service call.
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', fileToSend);
    formData.append('receiverId', otherId.toString());
    formData.append('description', this.fileDesc || ' ');

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        this.uploadProgress = Math.round((event.loaded / event.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        this.uploadProgress = 100;
        try {
          const result = JSON.parse(xhr.responseText);
          this.sharedFiles.update(files => [result, ...files]);

          const fileMessage: PrivateChatResponse = {
            id: result.messageId || Date.now(),
            senderId1: uid,
            senderId2: otherId,
            senderName1: this.activeUserEmail() || '',
            senderName2: this.activeUserEmail() || '',
            content: `📎 ${result.originalFileName || fileToSend.name}`,
            timestamp: new Date().toISOString(),
            isRead: false
          };
          this.messages.update(msgs => [...msgs, fileMessage]);
          this.shouldScroll = true;

          setTimeout(() => {
            this.clearFileSelection();
            this.uploading = false;
            this.uploadProgress = 0;
            this.showSendFile.set(false);
          }, 800);

          setTimeout(() => {
            if (this.activeUserId() === otherId) this.loadMessages(otherId);
          }, 2000);
        } catch {
          this.fileError.set('Erreur lors du traitement de la réponse serveur');
          this.uploading = false;
        }
      } else {
        this.fileError.set(`Erreur ${xhr.status}: ${xhr.responseText || 'Envoi échoué'}`);
        this.uploading = false;
        this.uploadProgress = 0;
      }
    });

    xhr.addEventListener('error', () => {
      this.fileError.set('Erreur réseau lors de l\'envoi');
      this.uploading = false;
      this.uploadProgress = 0;
    });

    const token = localStorage.getItem('access_token');
    const { chatApiUrl } = (window as any).__env__ ?? {};
    // Dynamically import environment at runtime via the service base URL
    const base = (this.privateChatService as any).base ?? '';
    xhr.open('POST', `${base}/send-file/${uid}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(formData);
  }

  // ========== TÉLÉCHARGEMENT DE FICHIERS ==========

  /** Helpers pour lire la progression depuis le template */
  getFileProgress(fileId: number): number | 'done' | null {
    return this.fileDownloadProgress.get(fileId) ?? null;
  }

  getMsgProgress(msgId: number): number | 'done' | null {
    return this.msgDownloadProgress.get(msgId) ?? null;
  }

  // Télécharger un fichier depuis la liste des fichiers partagés
  downloadFile(file: PrivateFileResponse) {
    const fileId = file.fileId || this.extractFileIdFromFile(file);
    if (!fileId) {
      this.showNotification('Impossible de télécharger le fichier : ID manquant', 'error');
      return;
    }
    if (this.fileDownloadProgress.has(fileId)) return; // déjà en cours

    this.fileDownloadProgress.set(fileId, 0);

    this.fileService.downloadByIdWithProgress(fileId, file.originalFileName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.progress !== undefined) {
            this.fileDownloadProgress.set(fileId, event.progress);
          }
          if (event.done) {
            this.fileDownloadProgress.set(fileId, 'done');
            this.showNotification(`Téléchargement terminé : ${file.originalFileName}`, 'success');
            setTimeout(() => this.fileDownloadProgress.delete(fileId), 2000);
          }
        },
        error: (err) => {
          console.error('Error downloading file:', err);
          this.showNotification('Erreur lors du téléchargement', 'error');
          this.fileDownloadProgress.delete(fileId);
        }
      });
  }

  // Télécharger un fichier directement depuis un message inline
  downloadFileFromMessage(message: PrivateChatResponse) {
    const msgId = message.id;
    if (this.msgDownloadProgress.has(msgId)) return; // déjà en cours

    // Chercher dans les fichiers partagés
    const fileId = this.extractFileIdFromMessage(message);
    const existingFile = fileId ? this.sharedFiles().find(f => f.fileId === fileId) : null;

    if (existingFile) {
      // Proxy vers downloadFile mais en trackant aussi msgId
      this.msgDownloadProgress.set(msgId, 0);
      const fid = existingFile.fileId!;
      this.fileService.downloadByIdWithProgress(fid, existingFile.originalFileName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (event) => {
            if (event.progress !== undefined) this.msgDownloadProgress.set(msgId, event.progress);
            if (event.done) {
              this.msgDownloadProgress.set(msgId, 'done');
              setTimeout(() => this.msgDownloadProgress.delete(msgId), 2000);
            }
          },
          error: () => {
            this.showNotification('Erreur lors du téléchargement', 'error');
            this.msgDownloadProgress.delete(msgId);
          }
        });
      return;
    }

    // Pas de fileId → essayer de charger les fichiers partagés d'abord
    if (!fileId) {
      // Fallback : télécharger par nom extrait du contenu
      const fileName = message.content.startsWith('📎')
        ? message.content.substring(2).trim()
        : 'fichier';
      this.showNotification(`Téléchargement de ${fileName}...`, 'info');
      this.msgDownloadProgress.set(msgId, 0);
      this.fileService.downloadWithProgress(fileName, fileName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (event) => {
            if (event.progress !== undefined) this.msgDownloadProgress.set(msgId, event.progress);
            if (event.done) {
              this.msgDownloadProgress.set(msgId, 'done');
              setTimeout(() => this.msgDownloadProgress.delete(msgId), 2000);
            }
          },
          error: () => {
            this.showNotification('Erreur lors du téléchargement', 'error');
            this.msgDownloadProgress.delete(msgId);
          }
        });
      return;
    }

    // fileId connu mais pas dans sharedFiles
    this.msgDownloadProgress.set(msgId, 0);
    const fileName = message.content.startsWith('📎') ? message.content.substring(2).trim() : `file-${fileId}`;
    this.fileService.downloadByIdWithProgress(fileId, fileName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.progress !== undefined) this.msgDownloadProgress.set(msgId, event.progress);
          if (event.done) {
            this.msgDownloadProgress.set(msgId, 'done');
            setTimeout(() => this.msgDownloadProgress.delete(msgId), 2000);
          }
        },
        error: () => {
          this.showNotification('Erreur lors du téléchargement', 'error');
          this.msgDownloadProgress.delete(msgId);
        }
      });
  }

  // Déclencher le téléchargement dans le navigateur (conservé pour compatibilité)
  triggerDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Méthodes legacy conservées pour compatibilité
  downloadFileById(fileId: number, fileName: string) {
    if (this.fileDownloadProgress.has(fileId)) return;
    this.fileDownloadProgress.set(fileId, 0);
    this.fileService.downloadByIdWithProgress(fileId, fileName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.progress !== undefined) this.fileDownloadProgress.set(fileId, event.progress);
          if (event.done) {
            this.fileDownloadProgress.set(fileId, 'done');
            this.showNotification('Téléchargement terminé', 'success');
            setTimeout(() => this.fileDownloadProgress.delete(fileId), 2000);
          }
        },
        error: () => {
          this.showNotification('Erreur lors du téléchargement', 'error');
          this.fileDownloadProgress.delete(fileId);
        }
      });
  }

  downloadSmallFile(fileId: number, fileName: string) {
    this.downloadFileById(fileId, fileName);
  }

  downloadLargeFile(fileId: number, fileName: string) {
    this.downloadFileById(fileId, fileName);
  }

  // Prévisualiser un fichier (ouvrir dans un nouvel onglet)
  previewFile(file: PrivateFileResponse) {
    console.log('Previewing file:', file.originalFileName);
    
    // Pour les images, on peut les prévisualiser directement
    if (this.isImageFile(file as any)) {
      if (file.downloadUrl) {
        window.open(file.downloadUrl, '_blank');
      } else {
        // Télécharger et ouvrir
        this.downloadAndPreview(file);
      }
    } 
    // Pour les PDF, on peut les ouvrir dans un nouvel onglet
    else if (file.fileType === 'application/pdf') {
      if (file.downloadUrl) {
        window.open(file.downloadUrl, '_blank');
      } else {
        this.downloadAndPreview(file);
      }
    }
    // Pour les autres fichiers, on télécharge
    else {
      this.downloadFile(file);
    }
  }

  // Télécharger et ouvrir un fichier
  downloadAndPreview(file: PrivateFileResponse) {
    const fileId = file.fileId || 0;
    if (!fileId) return;
    
    this.fileService.downloadById(fileId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
        },
        error: (err) => {
          console.error('Error previewing file:', err);
          this.showNotification('Erreur lors de la prévisualisation', 'error');
        }
      });
  }

  // Extraire l'ID du fichier depuis un message
  extractFileIdFromMessage(message: PrivateChatResponse): number | null {
    // Logique à adapter selon votre structure de données
    // Par exemple, si le message contient un champ fileId
    if ((message as any).fileId) {
      return (message as any).fileId;
    }
    
    // Ou si l'ID est dans le contenu du message
    const match = message.content.match(/\[fileId:(\d+)\]/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return null;
  }

  // Extraire l'ID du fichier depuis un objet file
  extractFileIdFromFile(file: PrivateFileResponse): number | null {
    if (file.fileId) return file.fileId;
    if ((file as any).id) return (file as any).id;
    return null;
  }

  // Deviner le type de fichier à partir du nom
  guessFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const typeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'mp4': 'video/mp4',
      'mp3': 'audio/mpeg',
      'zip': 'application/zip'
    };
    
    return extension && typeMap[extension] ? typeMap[extension] : 'application/octet-stream';
  }

  // Afficher une notification
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    console.log(`[${type}] ${message}`);
    this.notificationMessage.set({ text: message, type });
    setTimeout(() => this.notificationMessage.set(null), 3000);
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