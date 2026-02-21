import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';
import { WsError, TypingNotification, UserActivityEvent, PrivateChatNotification, PrivateFileNotification, MessagesReadNotification, MessageConfirmation, ChatMessageEvent } from '../../models/chat/chat.mdel';
import { TokenService } from '../users/token.service';

export type WsConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

@Injectable({ providedIn: 'root' })
export class ChatWebSocketService implements OnDestroy {

  private client: Client | null = null;
  private subscriptions = new Map<string, StompSubscription>();

  private connectionState$ = new BehaviorSubject<WsConnectionState>('DISCONNECTED');
  private errors$ = new Subject<WsError>();

  readonly state$ = this.connectionState$.asObservable();

  constructor(private tokenService: TokenService) {}

  // ─── Connection ────────────────────────────────────────────────────────────

  /**
   * Connect to WebSocket.
   *
   * AuthInterceptor (STOMP) requires:
   *   CONNECT header  Authorization: Bearer <token>
   *   CONNECT header  X-User-Id: <userId>
   *
   * userId is stored in STOMP session by AuthInterceptor and used for
   * every subsequent SEND frame automatically.
   */
  connect(): void {
    if (this.client?.connected) return;

    const token  = this.tokenService.getAccessToken();
    const userId = this.tokenService.getCurrentUserId();

    if (!token || !userId) {
      console.error('[WS] Cannot connect: missing token or userId');
      this.connectionState$.next('ERROR');
      return;
    }

    this.connectionState$.next('CONNECTING');

    this.client = new Client({
      /**
       * webSocketFactory uses SockJS so the STOMP handshake works.
       * Chat runs on port 8081 (application.yaml), path /ws-chat.
       */
      webSocketFactory: () => new SockJS(`${environment.chatWsUrl}/ws-chat`),

      connectHeaders: {
        Authorization: `Bearer ${token}`,
        'X-User-Id': userId.toString()
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('[WS] Connected');
        this.connectionState$.next('CONNECTED');

        // Re-subscribe to /queue/errors on every (re)connect
        this.subscribeToErrors();
      },

      onDisconnect: () => {
        console.log('[WS] Disconnected');
        this.connectionState$.next('DISCONNECTED');
      },

      onStompError: (frame) => {
        console.error('[WS] STOMP error', frame);
        this.connectionState$.next('ERROR');
      },

      onWebSocketError: (evt) => {
        console.error('[WS] WebSocket error', evt);
        this.connectionState$.next('ERROR');
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.connectionState$.next('DISCONNECTED');
  }

  get isConnected(): boolean {
    return this.client?.connected === true;
  }

  // ─── Room subscriptions ────────────────────────────────────────────────────

  /**
   * Subscribe to new messages in a room.
   * Topic: /topic/room/{roomId}
   */
  onRoomMessages(roomId: number): Observable<ChatMessageEvent> {
    return this.subscribe<ChatMessageEvent>(`room-msg-${roomId}`, `/topic/room/${roomId}`);
  }

  /**
   * Subscribe to typing notifications in a room.
   * Topic: /topic/room/{roomId}/typing
   */
  onRoomTyping(roomId: number): Observable<TypingNotification> {
    return this.subscribe<TypingNotification>(`room-typing-${roomId}`, `/topic/room/${roomId}/typing`);
  }

  /**
   * Subscribe to join/leave events in a room.
   * Topic: /topic/room/{roomId}/activity
   */
  onRoomActivity(roomId: number): Observable<UserActivityEvent> {
    return this.subscribe<UserActivityEvent>(`room-activity-${roomId}`, `/topic/room/${roomId}/activity`);
  }

  // ─── Private message subscriptions ────────────────────────────────────────

  /**
   * Subscribe to incoming private messages for this user.
   * Topic: /topic/private/{userId}
   */
  onPrivateMessages(userId: number): Observable<PrivateChatNotification> {
    return this.subscribe<PrivateChatNotification>(`private-msg-${userId}`, `/topic/private/${userId}`);
  }

  /**
   * Subscribe to private file notifications.
   * Topic: /topic/private/file/{userId}
   */
  onPrivateFiles(userId: number): Observable<PrivateFileNotification> {
    return this.subscribe<PrivateFileNotification>(`private-file-${userId}`, `/topic/private/file/${userId}`);
  }

  /**
   * Subscribe to read receipts (when receiver reads our messages).
   * Topic: /topic/private/read/{senderId}
   */
  onMessagesRead(senderId: number): Observable<MessagesReadNotification> {
    return this.subscribe<MessagesReadNotification>(`private-read-${senderId}`, `/topic/private/read/${senderId}`);
  }

  /**
   * User-specific message confirmation from /queue/messages/confirmation.
   * NOTE: With STOMP, user-specific queues use /user prefix automatically.
   */
  onMessageConfirmation(): Observable<MessageConfirmation> {
    return this.subscribe<MessageConfirmation>('msg-confirm', '/user/queue/messages/confirmation');
  }

  // ─── Send frames ──────────────────────────────────────────────────────────

  /**
   * Send a message to a room via WebSocket.
   * Maps to @MessageMapping("/chat.sendMessage/{roomId}") in WebChatController.
   * userId is taken from STOMP session (set by AuthInterceptor on CONNECT).
   */
  sendMessage(roomId: number, content: string): void {
    this.send(`/app/chat.sendMessage/${roomId}`, { content, chatRoomId: roomId, messageType: 'TEXT' });
  }

  /**
   * Send typing notification.
   * Maps to @MessageMapping("/chat.typing/{roomId}").
   */
  // sendTyping(roomId: number, userId: number, isTyping: boolean): void {
  //   this.send(`/app/chat.typing/${roomId}`, { userId, isTyping, roomId });
  // }

  /**
   * Notify joining a room.
   * Maps to @MessageMapping("/chat.join/{roomId}").
   */
  joinRoom(roomId: number): void {
    this.send(`/app/chat.join/${roomId}`, {});
  }

  /**
   * Notify leaving a room.
   * Maps to @MessageMapping("/chat.leave/{roomId}").
   */
  leaveRoom(roomId: number): void {
    this.send(`/app/chat.leave/${roomId}`, {});
  }

  /**
   * Send a private message via WebSocket.
   * Maps to @MessageMapping("/private/send/{senderId}").
   * Response delivered to /user/queue/private/confirmation.
   */
  sendPrivateMessage(senderId: number, recipientId: number, content: string): void {
    this.send(`/app/private/send/${senderId}`, { senderId2: recipientId, content });
  }

  /**
   * Mark private messages as read via WebSocket.
   * Maps to @MessageMapping("/private/read/{userId}").
   */
  markPrivateRead(userId: number, messageIds: number[]): void {
    this.send(`/app/private/read/${userId}`, messageIds);
  }

  // Add these methods to the ChatWebSocketService class

/**
 * Subscribe to private typing notifications
 * Topic: /topic/private/typing/{userId}
 */
onPrivateTyping(userId: number): Observable<TypingNotification> {
  return this.subscribe<TypingNotification>(`private-typing-${userId}`, `/topic/private/typing/${userId}`);
}

/**
 * Send private typing notification
 * Maps to @MessageMapping("/private/typing/{userId}")
 */
sendPrivateTyping(userId: number, otherUserId: number, isTyping: boolean): void {
  this.send(`/app/private/typing/${userId}`, { userId: otherUserId, isTyping });
}

// Update the existing sendTyping method to handle both room and private typing
sendTyping(targetId: number, userId: number, isTyping: boolean, isPrivate: boolean = false): void {
  if (isPrivate) {
    this.sendPrivateTyping(targetId, userId, isTyping);
  } else {
    this.send(`/app/chat.typing/${targetId}`, { userId, isTyping, roomId: targetId });
  }
}

  // ─── Errors ───────────────────────────────────────────────────────────────

  get errors(): Observable<WsError> {
    return this.errors$.asObservable();
  }

  private subscribeToErrors(): void {
    const key = 'user-errors';
    if (this.subscriptions.has(key)) return;
    const sub = this.client!.subscribe('/user/queue/errors', (msg: IMessage) => {
      const err = JSON.parse(msg.body) as WsError;
      console.error('[WS] Server error:', err);
      this.errors$.next(err);
    });
    this.subscriptions.set(key, sub);
  }

  // ─── Internals ────────────────────────────────────────────────────────────

  private subscribe<T>(key: string, topic: string): Observable<T> {
    return new Observable<T>(observer => {
      const waitForConnection = setInterval(() => {
        if (!this.client?.connected) return;
        clearInterval(waitForConnection);

        if (this.subscriptions.has(key)) {
          // Already subscribed — caller will receive from the shared subscription
          return;
        }

        const sub = this.client!.subscribe(topic, (msg: IMessage) => {
          try {
            observer.next(JSON.parse(msg.body) as T);
          } catch (e) {
            observer.error(e);
          }
        });

        this.subscriptions.set(key, sub);
      }, 100);

      return () => {
        clearInterval(waitForConnection);
        const sub = this.subscriptions.get(key);
        if (sub) { sub.unsubscribe(); this.subscriptions.delete(key); }
      };
    });
  }

  private send(destination: string, body: unknown): void {
    if (!this.client?.connected) {
      console.warn('[WS] Not connected — message dropped:', destination);
      return;
    }
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}