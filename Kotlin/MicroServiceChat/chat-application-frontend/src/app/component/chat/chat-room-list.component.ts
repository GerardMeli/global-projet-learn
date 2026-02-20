import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs'; 
import { ChatRoomResponse } from '../../core/models/chat/chat-room.model';
import { ChatRoomType } from '../../core/models/chat/chat.mdel';
import { ChatRoomService } from '../../core/services/chat/chat-room.service';
import { ChatWebSocketService } from '../../core/services/chat/chat.websocket.service';
import { TokenService } from '../../core/services/users/token.service';

@Component({
  selector: 'app-chat-room-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
<div class="chat-shell">
  <!-- Sidebar -->
  <aside class="chat-sidebar">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <span class="brand-icon">💬</span>
        <span>Chat</span>
      </div>
      <div class="ws-badge" [class.ws-badge--on]="wsConnected">
        {{ wsConnected ? 'Live' : 'Offline' }}
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-row">
      <button [class.active]="activeTab === 'rooms'" (click)="activeTab='rooms'">Rooms</button>
      <button [class.active]="activeTab === 'private'" (click)="activeTab='private'">Direct</button>
    </div>

    <!-- Search -->
    <div class="search-wrap" *ngIf="activeTab === 'rooms'">
      <input class="search-input" type="text" placeholder="Search rooms…"
             [value]="searchQuery" (input)="searchQuery = $any($event.target).value" />
    </div>

    <!-- Room list -->
    <nav class="room-list" *ngIf="activeTab === 'rooms'">
      <a *ngFor="let room of filteredRooms"
         [routerLink]="['/chat/rooms', room.id]"
         routerLinkActive="room-item--active"
         class="room-item">
        <div class="room-avatar" [class.room-avatar--public]="room.type === 'PUBLIC'">
          {{ room.type === 'PUBLIC' ? '🌐' : '🔒' }}
        </div>
        <div class="room-info">
          <div class="room-name">{{ room.name }}</div>
          <div class="room-meta">{{ room.participantCount }} member{{ room.participantCount !== 1 ? 's' : '' }}</div>
        </div>
      </a>
      <div class="empty-list" *ngIf="filteredRooms.length === 0 && !loadingRooms">
        No rooms found.
      </div>
    </nav>

    <!-- Private messages list -->
    <nav class="room-list" *ngIf="activeTab === 'private'">
      <a [routerLink]="['/chat/private']" class="room-item">
        <span class="room-avatar">👤</span>
        <div class="room-info"><div class="room-name">Open conversations</div></div>
      </a>
    </nav>

    <!-- Create room button -->
    <div class="sidebar-footer-actions">
      <button class="btn-create" (click)="showCreate = !showCreate">+ New room</button>
      <a routerLink="/profile" class="btn-back">← Dashboard</a>
    </div>
  </aside>

  <!-- Main -->
  <main class="chat-main">
    <!-- Create room form -->
    <div class="create-room-panel card" *ngIf="showCreate" [formGroup]="createForm">
      <h3>Create room</h3>
      <div class="form-group">
        <label>Room name</label>
        <input type="text" formControlName="name" placeholder="My room" />
      </div>
      <div class="form-group">
        <label>Type</label>
        <select formControlName="type">
          <option value="PUBLIC">🌐 Public — anyone can join</option>
          <option value="PRIVATE">🔒 Private — invite only</option>
        </select>
      </div>
      <div *ngIf="createError" class="alert alert--danger">{{ createError }}</div>
      <div class="form-actions">
        <button class="btn btn--ghost" (click)="showCreate = false">Cancel</button>
        <button class="btn btn--primary" [disabled]="creating" (click)="createRoom()">
          <span class="spinner" *ngIf="creating"></span>
          {{ creating ? 'Creating…' : 'Create' }}
        </button>
      </div>
    </div>

    <!-- Welcome state -->
    <div class="welcome-state" *ngIf="!showCreate">
      <div class="welcome-icon">💬</div>
      <h2>Select a room or start a conversation</h2>
      <p>You have access to {{ rooms.length }} room{{ rooms.length !== 1 ? 's' : '' }}.</p>
      <div class="quick-rooms">
        <a *ngFor="let room of rooms.slice(0, 4)"
           [routerLink]="['/chat/rooms', room.id]" class="quick-room-card">
          <span>{{ room.type === 'PUBLIC' ? '🌐' : '🔒' }}</span>
          <span>{{ room.name }}</span>
          <span class="qr-count">{{ room.participantCount }}</span>
        </a>
      </div>
    </div>
  </main>
</div>
  `,
  styles: [`
    .chat-shell { display: flex; height: 100vh; background: var(--color-bg); overflow: hidden; }

    .chat-sidebar { width: 280px; min-width: 280px; background: #0f172a; display: flex;
                    flex-direction: column; height: 100vh; }
    .sidebar-header { display: flex; align-items: center; justify-content: space-between;
                      padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .sidebar-brand { display: flex; align-items: center; gap: 8px; color: white; font-weight: 600; }
    .brand-icon { font-size: 20px; }
    .ws-badge { font-size: 11px; padding: 3px 8px; border-radius: 12px; font-weight: 600;
                background: rgba(220,53,69,0.3); color: #f87171;
                &--on { background: rgba(76,175,80,0.25); color: #4ade80; } }

    .tab-row { display: flex; margin: 12px; border-radius: 8px; overflow: hidden;
               background: rgba(255,255,255,0.06);
      button { flex: 1; padding: 8px; border: none; background: none; color: rgba(255,255,255,0.5);
               font-size: 13px; cursor: pointer; transition: var(--transition);
               &.active { background: var(--color-primary); color: white; }
      }
    }

    .search-wrap { padding: 0 12px 8px; }
    .search-input { width: 100%; padding: 8px 12px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.08); color: white; font-size: 13px;
                    &::placeholder { color: rgba(255,255,255,0.35); }
                    &:focus { outline: 1px solid var(--color-primary); }
    }

    .room-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
                 padding: 0 8px; }
    .room-item { display: flex; align-items: center; gap: 10px; padding: 10px 10px;
                 border-radius: 8px; text-decoration: none; color: rgba(255,255,255,0.6);
                 transition: var(--transition);
                 &:hover { background: rgba(255,255,255,0.06); color: white; }
                 &.room-item--active { background: rgba(76,175,80,0.15); color: var(--color-primary); }
    }
    .room-avatar { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1);
                   display: flex; align-items: center; justify-content: center; font-size: 18px;
                   flex-shrink: 0;
                   &--public { background: rgba(33,150,243,0.2); }
    }
    .room-name { font-size: 14px; font-weight: 500; }
    .room-meta { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }
    .empty-list { text-align: center; padding: 32px 16px; color: rgba(255,255,255,0.3); font-size: 13px; }

    .sidebar-footer-actions { padding: 12px; display: flex; flex-direction: column; gap: 6px;
                               margin-top: auto; border-top: 1px solid rgba(255,255,255,0.08); }
    .btn-create { width: 100%; padding: 10px; border-radius: 8px; border: none;
                  background: var(--color-primary); color: white; font-weight: 500;
                  cursor: pointer; font-size: 13px; transition: var(--transition);
                  &:hover { background: var(--color-primary-dark); } }
    .btn-back { text-align: center; padding: 8px; font-size: 12px; color: rgba(255,255,255,0.4);
                text-decoration: none; &:hover { color: rgba(255,255,255,0.7); } }

    .chat-main { flex: 1; display: flex; flex-direction: column; padding: 32px; overflow-y: auto; }
    .create-room-panel { max-width: 420px; padding: 28px; h3 { margin-bottom: 20px; font-size: 18px; } }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

    .welcome-state { max-width: 500px; margin: auto; text-align: center;
      h2 { font-family: var(--font-display); font-size: 24px; margin-bottom: 8px; }
      p { color: var(--color-text-muted); margin-bottom: 28px; }
    }
    .welcome-icon { font-size: 56px; margin-bottom: 16px; }
    .quick-rooms { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .quick-room-card { display: flex; align-items: center; gap: 10px; padding: 14px 16px;
                       border-radius: var(--radius-md); background: white;
                       box-shadow: var(--shadow-card); text-decoration: none; color: var(--color-text);
                       font-size: 14px; transition: var(--transition);
                       &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); } }
    .qr-count { margin-left: auto; font-size: 12px; color: var(--color-text-muted); }

    @media (max-width: 768px) { .chat-sidebar { width: 100%; position: fixed; bottom: 0; z-index: 100; height: auto; } }
  `]
})
export class ChatRoomListComponent implements OnInit, OnDestroy {
  rooms: ChatRoomResponse[] = [];
  loadingRooms = true;
  searchQuery = '';
  activeTab: 'rooms' | 'private' = 'rooms';
  showCreate = false;
  creating = false;
  createError = '';
  wsConnected = false;

  createForm: FormGroup;
  private subs: Subscription[] = [];

  constructor(
    private chatRoomService: ChatRoomService,
    private wsService: ChatWebSocketService,
    private tokenService: TokenService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      type: [ChatRoomType.PUBLIC]
    });
  }

  ngOnInit(): void {
    this.loadRooms();
    this.wsService.connect();
    this.subs.push(
      this.wsService.state$.subscribe(s => this.wsConnected = s === 'CONNECTED')
    );
  }

  loadRooms(): void {
    this.chatRoomService.getAll().subscribe({
      next: (rooms) => { this.rooms = rooms; this.loadingRooms = false; },
      error: () => this.loadingRooms = false
    });
  }

  get filteredRooms(): ChatRoomResponse[] {
    const q = this.searchQuery.toLowerCase();
    return q ? this.rooms.filter(r => r.name.toLowerCase().includes(q)) : this.rooms;
  }

  createRoom(): void {
    if (this.createForm.invalid) return;
    this.creating = true;
    this.createError = '';
    this.chatRoomService.create({ ...this.createForm.value, userIds: [] }).subscribe({
      next: (room) => {
        this.rooms = [room, ...this.rooms];
        this.creating = false;
        this.showCreate = false;
        this.createForm.reset({ name: '', type: ChatRoomType.PUBLIC });
      },
      error: () => { this.createError = 'Failed to create room.'; this.creating = false; }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}