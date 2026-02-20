import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { ChatRoomDetailResponse } from '../../core/models/chat/chat-room.model';
import { TypingNotification } from '../../core/models/chat/chat.mdel';
import { MessageResponse } from '../../core/models/chat/message.model';
import { ChatRoomService } from '../../core/services/chat/chat-room.service';
import { ChatWebSocketService } from '../../core/services/chat/chat.websocket.service';
import { MessageService } from '../../core/services/chat/message.service';
import { TokenService } from '../../core/services/users/token.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
<div class="room-shell">
  <!-- Header -->
  <header class="room-header">
    <a routerLink="/chat" class="back-btn">←</a>
    <div class="room-title">
      <span class="room-type-icon">{{ room?.type === 'PUBLIC' ? '🌐' : '🔒' }}</span>
      <div>
        <div class="room-name">{{ room?.name || 'Loading…' }}</div>
        <div class="room-meta">{{ room?.participants?.length || 0 }} members
          <span class="typing-indicator" *ngIf="typingUsers.size > 0">
            · {{ typingLabel }} typing…
          </span>
        </div>
      </div>
    </div>
    <div class="header-actions">
      <button class="icon-action" title="Room info" (click)="showInfo = !showInfo">ℹ️</button>
    </div>
  </header>

  <!-- Room info panel -->
  <div class="info-panel card" *ngIf="showInfo && room">
    <h4>Members ({{ room.participants.length }})</h4>
    <div class="member-list">
      <div class="member-item" *ngFor="let p of room.participants">
        <div class="member-avatar">{{ p.user.email.charAt(0).toUpperCase() }}</div>
        <span>{{ p.user.email }}</span>
        <span class="role-badge">{{ p.role }}</span>
      </div>
    </div>
    <button class="btn btn--ghost leave-btn" (click)="leaveRoom()">Leave room</button>
  </div>

  <!-- Messages -->
  <div class="messages-area" #messagesArea>
    <div class="loading-msg" *ngIf="loading">Loading messages…</div>

    <div *ngFor="let msg of messages; trackBy: trackById"
         class="message" [class.message--own]="msg.sender.id === currentUserId"
         [class.message--deleted]="msg.isDeleted">

      <div class="msg-avatar" *ngIf="msg.sender.id !== currentUserId">
        {{ msg.sender.email.charAt(0).toUpperCase() }}
      </div>

      <div class="msg-body">
        <div class="msg-sender" *ngIf="msg.sender.id !== currentUserId">{{ msg.sender.email }}</div>
        <div class="msg-bubble" [class.msg-bubble--file]="msg.messageType !== 'TEXT'">
          <span *ngIf="msg.isDeleted" class="deleted-label">Message deleted</span>
          <span *ngIf="!msg.isDeleted && msg.messageType === 'TEXT'">{{ msg.content }}</span>
          <span *ngIf="!msg.isDeleted && msg.messageType !== 'TEXT'" class="file-msg">
            📎 {{ msg.content }}
          </span>
        </div>
        <div class="msg-time">{{ msg.timestamp | date:'HH:mm' }}</div>
      </div>
    </div>

    <div class="empty-chat" *ngIf="messages.length === 0 && !loading">
      No messages yet. Say hello! 👋
    </div>
  </div>

  <!-- Input -->
  <footer class="chat-footer">
    <div class="input-row">
      <div class="input-wrap">
        <input class="chat-input"
               type="text"
               placeholder="Type a message…"
               [formControl]="messageControl"
               (keydown.enter)="sendMessage()"
               (input)="onTyping()" />
      </div>
      <button class="send-btn" [disabled]="!messageControl.value?.trim()" (click)="sendMessage()">
        ➤
      </button>
    </div>
    <div class="char-count" *ngIf="messageControl.value?.length > 0">
      {{ messageControl.value?.length }}/2000
    </div>
  </footer>
</div>
  `,
  styles: [`
    .room-shell { display: flex; flex-direction: column; height: 100vh; background: var(--color-bg); }

    .room-header { display: flex; align-items: center; gap: 12px; padding: 14px 20px;
                   background: white; border-bottom: 1px solid var(--color-border); z-index: 10; }
    .back-btn { text-decoration: none; color: var(--color-text-muted); font-size: 18px;
                padding: 4px 8px; border-radius: 6px; &:hover { background: var(--color-surface-alt); } }
    .room-type-icon { font-size: 22px; }
    .room-title { display: flex; align-items: center; gap: 10px; flex: 1; }
    .room-name { font-weight: 600; font-size: 16px; }
    .room-meta { font-size: 12px; color: var(--color-text-muted); }
    .typing-indicator { color: var(--color-primary); font-style: italic; }
    .header-actions { display: flex; gap: 6px; }
    .icon-action { background: none; border: none; cursor: pointer; font-size: 18px;
                   padding: 6px; border-radius: 6px; &:hover { background: var(--color-surface-alt); } }

    .info-panel { position: absolute; top: 64px; right: 16px; width: 280px; padding: 16px;
                  z-index: 100; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                  h4 { margin-bottom: 12px; font-size: 14px; } }
    .member-list { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }
    .member-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
    .member-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--color-primary-light);
                     color: var(--color-primary-dark); display: flex; align-items: center; justify-content: center;
                     font-size: 12px; font-weight: 600; }
    .role-badge { margin-left: auto; font-size: 11px; color: var(--color-text-muted); text-transform: uppercase; }
    .leave-btn { width: 100%; margin-top: 14px; color: var(--color-danger); }

    .messages-area { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 8px; }
    .loading-msg { text-align: center; color: var(--color-text-muted); padding: 20px; }
    .empty-chat { text-align: center; color: var(--color-text-muted); margin: auto; }

    .message { display: flex; align-items: flex-end; gap: 8px;
               &--own { flex-direction: row-reverse; }
               &--deleted { opacity: 0.5; }
    }
    .msg-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--color-accent-light);
                  color: var(--color-accent); display: flex; align-items: center; justify-content: center;
                  font-size: 13px; font-weight: 600; flex-shrink: 0; }
    .msg-body { max-width: 70%; display: flex; flex-direction: column; }
    .msg-sender { font-size: 11px; color: var(--color-text-muted); margin-bottom: 2px; }
    .message--own .msg-body { align-items: flex-end; }
    .msg-bubble { padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5;
                  background: white; border: 1px solid var(--color-border); word-break: break-word;
                  .message--own & { background: var(--color-primary); color: white; border-color: var(--color-primary); }
                  &--file { background: var(--color-info-light); border-color: var(--color-info); }
    }
    .deleted-label { font-style: italic; color: var(--color-text-muted); }
    .file-msg { display: flex; align-items: center; gap: 6px; }
    .msg-time { font-size: 10px; color: var(--color-text-muted); margin-top: 3px; }

    .chat-footer { background: white; border-top: 1px solid var(--color-border); padding: 12px 16px; }
    .input-row { display: flex; gap: 8px; align-items: center; }
    .input-wrap { flex: 1; }
    .chat-input { width: 100%; padding: 12px 16px; border: 1.5px solid var(--color-border);
                  border-radius: 24px; font-size: 15px; transition: var(--transition);
                  &:focus { outline: none; border-color: var(--color-primary); }
    }
    .send-btn { width: 44px; height: 44px; border-radius: 50%; border: none;
                background: var(--color-primary); color: white; font-size: 18px;
                cursor: pointer; transition: var(--transition);
                &:hover:not(:disabled) { background: var(--color-primary-dark); transform: scale(1.05); }
                &:disabled { background: var(--color-border); cursor: not-allowed; } }
    .char-count { font-size: 11px; color: var(--color-text-muted); text-align: right; margin-top: 4px; }
  `]
})
export class ChatRoomComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesArea') private messagesArea!: ElementRef<HTMLDivElement>;

  room: ChatRoomDetailResponse | null = null;
  messages: MessageResponse[] = [];
  loading = true;
  showInfo = false;
  typingUsers = new Map<number, ReturnType<typeof setTimeout>>();

  messageControl = new FormControl('', [Validators.maxLength(2000)]);
  currentUserId = 0;
  private roomId = 0;
  private subs: Subscription[] = [];
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private chatRoomService: ChatRoomService,
    private messageService: MessageService,
    private wsService: ChatWebSocketService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.tokenService.getCurrentUserId() ?? 0;
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));

    this.loadRoom();
    this.wsService.connect();

    // Subscribe to live messages
    this.subs.push(
      this.wsService.onRoomMessages(this.roomId).subscribe(event => {
        if (event.type === 'NEW_MESSAGE') {
          this.messages = [...this.messages, event.message];
          this.shouldScroll = true;
        }
      })
    );

    // Subscribe to typing
    this.subs.push(
      this.wsService.onRoomTyping(this.roomId).subscribe(n => this.handleTyping(n))
    );

    // Notify server we joined
    this.wsService.joinRoom(this.roomId);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadRoom(): void {
    this.chatRoomService.getById(this.roomId).subscribe({
      next: (room) => {
        this.room = room;
        this.messages = room.messages;
        this.loading = false;
        this.shouldScroll = true;
      },
      error: () => this.loading = false
    });
  }

  sendMessage(): void {
    const content = this.messageControl.value?.trim();
    if (!content || !this.currentUserId) return;

    // Optimistic: send via WebSocket for real-time broadcast
    this.wsService.sendMessage(this.roomId, content);
    this.messageControl.reset();

    // Also stop typing
    this.wsService.sendTyping(this.roomId, this.currentUserId, false);
  }

  onTyping(): void {
    this.wsService.sendTyping(this.roomId, this.currentUserId, true);
  }

  private handleTyping(n: TypingNotification): void {
    if (n.userId === this.currentUserId) return;

    if (n.isTyping) {
      // Clear any existing timeout for this user
      const existing = this.typingUsers.get(n.userId);
      if (existing) clearTimeout(existing);

      // Auto-clear typing after 3s
      const timeout = setTimeout(() => { this.typingUsers.delete(n.userId); }, 3000);
      this.typingUsers.set(n.userId, timeout);
    } else {
      const existing = this.typingUsers.get(n.userId);
      if (existing) clearTimeout(existing);
      this.typingUsers.delete(n.userId);
    }
  }

  get typingLabel(): string {
    const count = this.typingUsers.size;
    return count === 1 ? 'Someone is' : `${count} people are`;
  }

  leaveRoom(): void {
    if (!this.currentUserId || !this.roomId) return;
    this.wsService.leaveRoom(this.roomId);
    // Optionally call HTTP to remove participant
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesArea.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }

  trackById(_: number, msg: MessageResponse) { return msg.id; }

  ngOnDestroy(): void {
    this.wsService.leaveRoom(this.roomId);
    this.subs.forEach(s => s.unsubscribe());
    // Unsubscribe room topics
    this.wsService.disconnect();
  }
}