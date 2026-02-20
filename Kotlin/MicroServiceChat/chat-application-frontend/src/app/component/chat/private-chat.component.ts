import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs'; 
import { PrivateChatNotification, PrivateFileNotification } from '../../core/models/chat/chat.mdel';
import { UserContactDTO, PrivateChatResponse } from '../../core/models/chat/private-chat.model';
import { ChatWebSocketService } from '../../core/services/chat/chat.websocket.service';
import { PrivateChatService } from '../../core/services/chat/private-chat.service';
import { TokenService } from '../../core/services/users/token.service';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
<div class="chat-shell">
  <!-- Contacts sidebar -->
  <aside class="chat-sidebar">
    <div class="sidebar-header">
      <a routerLink="/chat" class="back-link">← Rooms</a>
      <div class="sidebar-title">Direct Messages</div>
    </div>

    <div class="search-wrap">
      <input class="search-input" type="text" placeholder="Find contact…"
             [value]="contactSearch" (input)="contactSearch = $any($event.target).value" />
    </div>

    <nav class="contact-list">
      <div class="loading-contacts" *ngIf="loadingContacts">Loading…</div>
      <button *ngFor="let c of filteredContacts"
              class="contact-item" [class.contact-item--active]="activeContact?.userId === c.userId"
              (click)="openConversation(c)">
        <div class="contact-avatar">{{ c.username.charAt(0).toUpperCase() }}</div>
        <div class="contact-info">
          <div class="contact-name">{{ c.username }}</div>
          <div class="contact-last">{{ c.lastMessage || 'No messages yet' }}</div>
        </div>
        <div class="unread-badge" *ngIf="c.unreadCount > 0">{{ c.unreadCount }}</div>
      </button>
      <div class="empty-contacts" *ngIf="filteredContacts.length === 0 && !loadingContacts">
        No conversations yet.
      </div>
    </nav>
  </aside>

  <!-- Conversation -->
  <main class="chat-main">
    <!-- No conversation selected -->
    <div class="no-conversation" *ngIf="!activeContact">
      <div class="no-conv-icon">💬</div>
      <h3>Select a conversation</h3>
      <p>Choose a contact on the left to start messaging.</p>
    </div>

    <!-- Active conversation -->
    <ng-container *ngIf="activeContact">
      <!-- Header -->
      <header class="conv-header">
        <div class="conv-avatar">{{ activeContact.username.charAt(0).toUpperCase() }}</div>
        <div class="conv-info">
          <div class="conv-name">{{ activeContact.username }}</div>
          <div class="conv-status">
            <span *ngIf="activeContact.unreadCount > 0" class="unread-label">
              {{ activeContact.unreadCount }} unread
            </span>
          </div>
        </div>
        <button class="icon-action" title="View shared files" (click)="showFiles = !showFiles">📎</button>
      </header>

      <!-- Shared files panel -->
      <div class="files-panel card" *ngIf="showFiles">
        <h4>Shared files</h4>
        <div class="files-list" *ngIf="sharedFiles.length > 0">
          <div class="file-item" *ngFor="let f of sharedFiles">
            <span class="file-icon">📄</span>
            <div class="file-meta">
              <div class="file-name">{{ f.fileName }}</div>
              <div class="file-size">{{ (f.fileSize / 1024).toFixed(1) }} KB</div>
            </div>
            <a class="file-dl" [href]="f.downloadUrl" target="_blank">⬇</a>
          </div>
        </div>
        <div *ngIf="sharedFiles.length === 0" class="files-empty">No shared files yet.</div>
      </div>

      <!-- Messages -->
      <div class="messages-area" #messagesArea>
        <div *ngFor="let msg of messages; trackBy: trackById"
             class="message" [class.message--own]="msg.senderId1 === currentUserId">
          <div class="msg-body">
            <div class="msg-bubble">{{ msg.content }}</div>
            <div class="msg-time">{{ msg.timestamp | date:'HH:mm' }}
              <span class="read-indicator" *ngIf="msg.senderId1 === currentUserId">
                {{ msg.isRead ? '✓✓' : '✓' }}
              </span>
            </div>
          </div>
        </div>
        <div class="empty-conv" *ngIf="messages.length === 0">Say hello! 👋</div>
      </div>

      <!-- Input -->
      <footer class="conv-footer">
        <!-- File upload -->
        <input type="file" #fileInput style="display:none" (change)="onFileSelected($event)" />
        <button class="attach-btn" title="Send file" (click)="fileInput.click()">📎</button>

        <div class="input-wrap">
          <input class="chat-input" type="text" placeholder="Type a message…"
                 [formControl]="messageControl"
                 (keydown.enter)="sendMessage()" />
        </div>

        <button class="send-btn" [disabled]="!messageControl.value?.trim()" (click)="sendMessage()">➤</button>
      </footer>

      <!-- File send progress -->
      <div class="file-progress" *ngIf="sendingFile">
        Uploading file… please wait.
      </div>
    </ng-container>
  </main>
</div>
  `,
  styles: [`
    .chat-shell { display: flex; height: 100vh; background: var(--color-bg); }

    .chat-sidebar { width: 280px; min-width: 280px; background: #0f172a;
                    display: flex; flex-direction: column; }
    .sidebar-header { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
                      display: flex; flex-direction: column; gap: 4px; }
    .back-link { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none;
                 &:hover { color: rgba(255,255,255,0.7); } }
    .sidebar-title { font-weight: 600; color: white; font-size: 15px; }
    .search-wrap { padding: 10px 12px; }
    .search-input { width: 100%; padding: 8px 12px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.08); color: white; font-size: 13px;
                    &::placeholder { color: rgba(255,255,255,0.35); } }

    .contact-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
    .loading-contacts { padding: 16px; text-align: center; color: rgba(255,255,255,0.3); font-size: 13px; }
    .contact-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px;
                    border: none; background: none; cursor: pointer; width: 100%; text-align: left;
                    color: rgba(255,255,255,0.6); transition: var(--transition);
                    &:hover { background: rgba(255,255,255,0.06); }
                    &--active { background: rgba(76,175,80,0.15) !important; color: white; } }
    .contact-avatar { width: 38px; height: 38px; border-radius: 50%;
                      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
                      color: white; display: flex; align-items: center; justify-content: center;
                      font-weight: 600; font-size: 16px; flex-shrink: 0; }
    .contact-name { font-size: 14px; font-weight: 500; }
    .contact-last { font-size: 11px; color: rgba(255,255,255,0.35);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
    .unread-badge { background: var(--color-primary); color: white; border-radius: 10px;
                    padding: 2px 7px; font-size: 11px; font-weight: 600; margin-left: auto; }
    .empty-contacts { padding: 32px 16px; text-align: center;
                      color: rgba(255,255,255,0.3); font-size: 13px; }

    .chat-main { flex: 1; display: flex; flex-direction: column; position: relative; }
    .no-conversation { margin: auto; text-align: center; color: var(--color-text-muted);
                       h3 { margin-bottom: 8px; } }
    .no-conv-icon { font-size: 56px; margin-bottom: 12px; }

    .conv-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px;
                   background: white; border-bottom: 1px solid var(--color-border); }
    .conv-avatar { width: 40px; height: 40px; border-radius: 50%;
                   background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
                   color: white; display: flex; align-items: center; justify-content: center;
                   font-weight: 600; font-size: 17px; }
    .conv-name { font-weight: 600; }
    .conv-status { font-size: 12px; color: var(--color-text-muted); }
    .unread-label { color: var(--color-primary); }
    .icon-action { margin-left: auto; background: none; border: none; cursor: pointer;
                   font-size: 18px; padding: 6px; border-radius: 6px;
                   &:hover { background: var(--color-surface-alt); } }

    .files-panel { position: absolute; top: 64px; right: 16px; width: 280px; padding: 16px;
                   z-index: 100; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                   h4 { margin-bottom: 12px; font-size: 14px; } }
    .files-list { display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; }
    .file-item { display: flex; align-items: center; gap: 8px; }
    .file-icon { font-size: 20px; }
    .file-name { font-size: 13px; font-weight: 500; }
    .file-size { font-size: 11px; color: var(--color-text-muted); }
    .file-dl { margin-left: auto; font-size: 16px; text-decoration: none; }
    .files-empty { color: var(--color-text-muted); font-size: 13px; }

    .messages-area { flex: 1; overflow-y: auto; padding: 20px;
                     display: flex; flex-direction: column; gap: 6px; }
    .empty-conv { text-align: center; color: var(--color-text-muted); margin: auto; }

    .message { display: flex;
               &--own { justify-content: flex-end;
                        .msg-bubble { background: var(--color-primary); color: white; } } }
    .msg-body { max-width: 65%; }
    .msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
                  background: white; border: 1px solid var(--color-border); word-break: break-word; }
    .msg-time { font-size: 10px; color: var(--color-text-muted); margin-top: 3px; text-align: right; }
    .read-indicator { margin-left: 4px; color: var(--color-primary); }

    .conv-footer { display: flex; align-items: center; gap: 8px; padding: 12px 16px;
                   background: white; border-top: 1px solid var(--color-border); }
    .attach-btn { background: none; border: none; cursor: pointer; font-size: 20px;
                  padding: 6px; border-radius: 6px; &:hover { background: var(--color-surface-alt); } }
    .input-wrap { flex: 1; }
    .chat-input { width: 100%; padding: 12px 16px; border: 1.5px solid var(--color-border);
                  border-radius: 24px; font-size: 15px;
                  &:focus { outline: none; border-color: var(--color-primary); } }
    .send-btn { width: 44px; height: 44px; border-radius: 50%; border: none;
                background: var(--color-primary); color: white; font-size: 18px; cursor: pointer;
                &:disabled { background: var(--color-border); cursor: not-allowed; } }
    .file-progress { background: var(--color-info-light); color: var(--color-info-dark);
                     padding: 8px 16px; font-size: 13px; text-align: center; }
  `]
})
export class PrivateChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesArea') private messagesArea!: ElementRef<HTMLDivElement>;

  contacts: UserContactDTO[] = [];
  activeContact: UserContactDTO | null = null;
  messages: PrivateChatResponse[] = [];
  sharedFiles: any[] = [];
  loadingContacts = true;
  contactSearch = '';
  showFiles = false;
  sendingFile = false;
  currentUserId = 0;
  private shouldScroll = false;

  messageControl = new FormControl('', [Validators.maxLength(2000)]);
  private subs: Subscription[] = [];

  constructor(
    private privateChatService: PrivateChatService,
    private wsService: ChatWebSocketService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getCurrentUserId() ?? 0;
    this.loadContacts();
    this.wsService.connect();

    // Subscribe to incoming private messages
    this.subs.push(
      this.wsService.onPrivateMessages(this.currentUserId).subscribe(n => this.handleIncoming(n))
    );

    // Subscribe to file notifications
    this.subs.push(
      this.wsService.onPrivateFiles(this.currentUserId).subscribe(n => this.handleFileNotification(n))
    );

    // Read receipts
    this.subs.push(
      this.wsService.onMessagesRead(this.currentUserId).subscribe(n => {
        n.messageIds.forEach(id => {
          const msg = this.messages.find(m => m.id === id);
          if (msg) (msg as any).isRead = true;
        });
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
  }

  loadContacts(): void {
    this.privateChatService.getContacts(this.currentUserId).subscribe({
      next: (c) => { this.contacts = c; this.loadingContacts = false; },
      error: () => this.loadingContacts = false
    });
  }

  get filteredContacts(): UserContactDTO[] {
    const q = this.contactSearch.toLowerCase();
    return q ? this.contacts.filter(c => c.username.toLowerCase().includes(q)) : this.contacts;
  }

  openConversation(contact: UserContactDTO): void {
    this.activeContact = contact;
    this.showFiles = false;
    this.loadConversation(contact.userId);

    // Mark as read
    if (contact.unreadCount > 0) {
      // We'll mark when we load messages
      contact.unreadCount = 0;
    }
  }

  loadConversation(otherUserId: number): void {
    this.privateChatService.getConversation(this.currentUserId, otherUserId).subscribe({
      next: (msgs) => { this.messages = msgs; this.shouldScroll = true; }
    });
    this.privateChatService.getFilesBetween(this.currentUserId, otherUserId).subscribe({
      next: (files) => this.sharedFiles = files
    });
  }

  sendMessage(): void {
    const content = this.messageControl.value?.trim();
    if (!content || !this.activeContact) return;

    // Send via WebSocket for real-time
    this.wsService.sendPrivateMessage(this.currentUserId, this.activeContact.userId, content);

    // Also call HTTP to persist
    this.privateChatService.send(this.currentUserId, {
      senderId2: this.activeContact.userId,
      content
    }).subscribe({
      next: (msg) => {
        this.messages = [...this.messages, msg];
        this.shouldScroll = true;
      }
    });

    this.messageControl.reset();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.activeContact) return;

    this.sendingFile = true;
    this.privateChatService.sendFile(this.currentUserId, this.activeContact.userId, file).subscribe({
      next: (f) => {
        this.sharedFiles = [...this.sharedFiles, f];
        this.sendingFile = false;
      },
      error: () => this.sendingFile = false
    });
  }

  private handleIncoming(n: PrivateChatNotification): void {
    if (n.isOwnMessage) return;
    if (this.activeContact?.userId === n.senderId) {
      // Add to current conversation as a mock PrivateChatResponse
      this.messages = [...this.messages, {
        id: n.messageId, senderId1: n.senderId,
        senderId2: this.currentUserId,
        senderName1: n.senderName, senderName2: '',
        content: n.content, timestamp: n.timestamp as any, isRead: false
      }];
      this.shouldScroll = true;
      // Mark as read
      this.wsService.markPrivateRead(this.currentUserId, [n.messageId]);
    } else {
      // Bump unread count for that contact
      const contact = this.contacts.find(c => c.userId === n.senderId);
      if (contact) contact.unreadCount++;
    }
  }

  private handleFileNotification(n: PrivateFileNotification): void {
    if (!n.isOwnMessage && this.activeContact?.userId === n.senderId) {
      this.sharedFiles = [...this.sharedFiles, n];
    }
  }

  scrollToBottom(): void {
    try { const el = this.messagesArea.nativeElement; el.scrollTop = el.scrollHeight; } catch {}
  }

  trackById(_: number, msg: PrivateChatResponse) { return msg.id; }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}