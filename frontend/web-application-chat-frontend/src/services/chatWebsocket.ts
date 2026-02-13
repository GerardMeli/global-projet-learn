// src/services/websocket/chatWebSocket.ts
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MessageResponse } from '../types';
import type { PrivateChatMessage } from '../types/oneToOne.type';

export interface WebSocketMessage {
  type:
    | 'NEW_MESSAGE'
    | 'MESSAGE_CONFIRMATION'
    | 'MESSAGE_ERROR'
    | 'TYPING'
    | 'USER_JOINED'
    | 'USER_LEFT'
    | 'SYSTEM'
    | 'PRIVATE_MESSAGE'
    | 'PRIVATE_TYPING';
  roomId?: number;
  message?: MessageResponse | PrivateChatMessage;
  messageId?: number;
  userId?: number;
  username?: string;
  isTyping?: boolean;
  timestamp?: number;
  data?: any;
}

interface CallbackMap<T> {
  [key: number]: Array<(data: T) => void>;
}

interface PrivateMessageCallback {
  [key: string]: Array<(message: PrivateChatMessage) => void>;
}

interface PrivateTypingCallback {
  [key: string]: Array<(data: { userId: number; isTyping: boolean; username: string }) => void>;
}

class ChatWebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  // Callbacks pour les salles de groupe
  private messageCallbacks: CallbackMap<MessageResponse> = {};
  private typingCallbacks: CallbackMap<{
    userId: number;
    isTyping: boolean;
  }> = {};

  // Callbacks pour les messages privés
  private privateMessageCallbacks: PrivateMessageCallback = {};
  private privateTypingCallbacks: PrivateTypingCallback = {};

  // Callbacks globaux
  private connectionChangeCallbacks: Array<(connected: boolean) => void> = [];
  private errorCallbacks: Array<(error: string) => void> = [];
  private messageConfirmationCallbacks: Array<
    (confirmation: any) => void
  > = [];

  // État
  private isConnected = false;
  private currentUserId: number | null = null;
  private currentToken: string | null = null;
  private connectedRooms: Set<number> = new Set();
  private privateSubscriptionsActive = false;

  constructor() {
    this.initializeClient();
  }

  // ==================== INITIALISATION ====================

  private initializeClient(): void {
    this.client = new Client({
      // ✅ FIX: Pointer vers le backend port 8081
      // WebSocket endpoint
      brokerURL: undefined, // Sera défini par webSocketFactory
      webSocketFactory: () => {
        // Déterminer l'host du backend
        const isProduction = window.location.hostname !== 'localhost';
        let backendHost = window.location.host;

        // En développement: localhost:5173 → localhost:8081
        if (!isProduction && window.location.hostname === 'localhost') {
          backendHost = 'localhost:8081'; // ✅ Port du backend
        }

        // ✅ IMPORTANT: Utiliser /ws-chat (l'endpoint du backend)
        const wsUrl = `http:${backendHost}/ws-chat`;
        
        console.log(`🌐 WebSocket URL: ${wsUrl}`);
        console.log(`📍 Backend Host: ${backendHost}`);
        console.log(`🔗 Endpoint: /ws-chat`);
        
        return new SockJS(wsUrl);
      },

      // Configuration STOMP
      debug: (str: string) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // ==================== EVENT HANDLERS ====================

      onConnect: (frame) => {
        this.isConnected = true;
        console.log('✅ WebSocket connected successfully');
        console.log('🔄 Rejoining', this.connectedRooms.size, 'rooms...');

        // Rajoindre les rooms après reconnexion
        this.connectedRooms.forEach((roomId) => {
          this.subscribeToRoom(roomId);
        });

        // Réactiver les abonnements privés si l'utilisateur est connecté
        if (this.currentUserId) {
          this.setupPrivateSubscriptions();
        }

        this.notifyConnectionChange(true);
      },

      onDisconnect: (frame) => {
        this.isConnected = false;
        this.privateSubscriptionsActive = false;
        console.log('❌ WebSocket disconnected');
        this.notifyConnectionChange(false);
      },

      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame);
        const errorMessage =
          frame.headers?.message || 'WebSocket connection error';
        this.notifyError(errorMessage);
      },

      onWebSocketError: (event) => {
        console.error('❌ WebSocket error:', event);
        this.notifyError('WebSocket connection failed');
      },

      onWebSocketClose: (event) => {
        console.log('🔒 WebSocket closed');
        this.isConnected = false;
        this.privateSubscriptionsActive = false;
        this.notifyConnectionChange(false);
      },
    });
  }

  // ==================== CONNEXION ====================

  connect(token: string, userId: number): void {
    this.currentToken = token;
    this.currentUserId = userId;

    if (!this.client) {
      console.error('❌ WebSocket client not initialized');
      return;
    }

    // ✅ Ajouter le token dans les headers de connexion
    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`,
      'X-User-Id': userId.toString(),
    };

    console.log(`🔗 Connecting WebSocket for user ${userId}...`);
    console.log(`🔑 Token: ${token.substring(0, 20)}...`);

    try {
      this.client.activate();
    } catch (error) {
      console.error('❌ Error activating WebSocket:', error);
      this.notifyError('Failed to activate WebSocket');
    }
  }

  disconnect(): void {
    if (this.client) {
      console.log('🛑 Disconnecting WebSocket...');
      this.unsubscribeAll();
      this.client.deactivate();
      this.isConnected = false;
      this.currentUserId = null;
      this.currentToken = null;
      this.connectedRooms.clear();
      this.privateSubscriptionsActive = false;
      this.notifyConnectionChange(false);
    }
  }

  // ==================== GESTION DES MESSAGES PRIVÉS ====================

  setupPrivateSubscriptions(): void {
    if (!this.client || !this.client.connected || !this.currentUserId) {
      console.warn('⚠️ Cannot setup private subscriptions: WebSocket not ready');
      return;
    }

    if (this.privateSubscriptionsActive) {
      console.log('✅ Private subscriptions already active');
      return;
    }

    console.log(`🔔 Setting up private subscriptions for user ${this.currentUserId}`);

    // S'abonner aux notifications de messages privés
    const privateMessageDestination = `/topic/private/${this.currentUserId}`;
    const privateMessageSubscription = this.client.subscribe(
      privateMessageDestination,
      (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log('📨 Private message received:', notification);
          
          this.handlePrivateMessage(notification);
        } catch (error) {
          console.error('❌ Error parsing private message:', error);
        }
      }
    );

    this.subscriptions.set(`private_${this.currentUserId}`, privateMessageSubscription);

    // S'abonner aux notifications de frappe privées
    const privateTypingDestination = `/topic/private/typing/${this.currentUserId}`;
    const privateTypingSubscription = this.client.subscribe(
      privateTypingDestination,
      (message) => {
        try {
          const typingNotification = JSON.parse(message.body);
          console.log('⌨️ Private typing notification:', typingNotification);
          
          this.handlePrivateTypingNotification(typingNotification);
        } catch (error) {
          console.error('❌ Error parsing private typing notification:', error);
        }
      }
    );

    this.subscriptions.set(`private_typing_${this.currentUserId}`, privateTypingSubscription);

    this.privateSubscriptionsActive = true;
    console.log('✅ Private subscriptions activated');
  }

  sendPrivateMessage(senderId: number, receiverId: number, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected || !this.client?.connected) {
        console.error('❌ Cannot send private message: WebSocket not connected');
        resolve(false);
        return;
      }

      console.log(`✉️ Sending private message to user ${receiverId}:`, content.substring(0, 50) + '...');

      const messageRequest = {
        senderId,
        receiverId,
        content,
        timestamp: new Date().toISOString(),
      };

      try {
        this.client.publish({
          destination: `/app/private/send`,
          body: JSON.stringify(messageRequest),
          headers: {
            'content-type': 'application/json',
          },
        });

        console.log('✅ Private message published to server');
        resolve(true);
      } catch (error) {
        console.error('❌ Error publishing private message:', error);
        resolve(false);
      }
    });
  }

  sendPrivateTypingNotification(senderId: number, receiverId: number, isTyping: boolean): void {
    if (!this.isConnected || !this.client?.connected) {
      console.warn('⚠️ Cannot send private typing notification: WebSocket not ready');
      return;
    }

    const typingRequest = {
      senderId,
      receiverId,
      isTyping,
      timestamp: new Date().toISOString(),
    };

    try {
      this.client.publish({
        destination: `/app/private/typing`,
        body: JSON.stringify(typingRequest),
        headers: { 'content-type': 'application/json' },
      });

      console.log(`⌨️ Private typing notification sent to user ${receiverId}: ${isTyping ? 'typing' : 'stopped'}`);
    } catch (error) {
      console.error('❌ Error sending private typing notification:', error);
    }
  }

  // ==================== ROOM MANAGEMENT ====================

  joinRoom(roomId: number): void {
    if (!this.client || !this.client.connected) {
        console.warn('⚠️ WebSocket not connected');
        return;
    }

    console.log(`🚪 Joining room ${roomId}...`);

    // 1️⃣ SE DÉSABONNER D'ABORD DES ABONNEMENTS EXISTANTS
    this.unsubscribeFromRoom(roomId);

    // 2️⃣ S'ABONNER AUX MESSAGES
    const messageDestination = `/topic/room/${roomId}`;
    const messageSubscription = this.client.subscribe(messageDestination, (message) => {
        console.log(`📩 Received message on ${messageDestination}:`, message.body);
        // Traiter le message
    });

    this.subscriptions.set(`room_${roomId}`, messageSubscription);

    // 3️⃣ S'ABONNER AUX NOTIFICATIONS DE FRAÎCHE
    const typingDestination = `/topic/room/${roomId}/typing`;
    const typingSubscription = this.client.subscribe(typingDestination, (message) => {
        // Traiter les notifications de frappe
    });

    this.subscriptions.set(`typing_${roomId}`, typingSubscription);

    console.log(`✅ Joined room ${roomId}`);
  }

  // Méthode pour se désabonner
  private unsubscribeFromRoom(roomId: number): void {
    const roomKey = `room_${roomId}`;
    const typingKey = `typing_${roomId}`;

    // Désabonner des messages
    if (this.subscriptions.has(roomKey)) {
        this.subscriptions.get(roomKey)?.unsubscribe();
        this.subscriptions.delete(roomKey);
        console.log(`🔕 Unsubscribed from room ${roomId} messages`);
    }

    // Désabonner des notifications de frappe
    if (this.subscriptions.has(typingKey)) {
        this.subscriptions.get(typingKey)?.unsubscribe();
        this.subscriptions.delete(typingKey);
        console.log(`🔕 Unsubscribed from room ${roomId} typing`);
    }
  }

  // Quand l'utilisateur quitte un salon
  leaveRoom(roomId: number): void {
    this.unsubscribeFromRoom(roomId);
    this.connectedRooms.delete(roomId);
    console.log(`👋 Left room ${roomId}`);
  }

  private subscribeToRoom(roomId: number): void {
    if (!this.client) return;

    // ==================== Messages ====================
    const messageDestination = `/topic/room/${roomId}`;
    console.log(`🔔 Subscribing to messages: ${messageDestination}`);

    const messageSubscription = this.client.subscribe(
      messageDestination,
      (frame) => {
        try {
          const data = JSON.parse(frame.body);
          console.log('📨 Message received:', data);

          // ✅ FIX: Le serveur envoie un MessageEvent avec le message dedans
          if (data.type === 'NEW_MESSAGE' && data.message) {
            this.handleRoomMessage(roomId, data.message);
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error, frame.body);
        }
      }
    );

    this.subscriptions.set(`room_${roomId}`, messageSubscription);

    // ==================== Typing Notifications ====================
    const typingDestination = `/topic/room/${roomId}/typing`;
    console.log(`🔔 Subscribing to typing: ${typingDestination}`);

    const typingSubscription = this.client.subscribe(
      typingDestination,
      (frame) => {
        try {
          const data = JSON.parse(frame.body);
          console.log('⌨️ Typing notification:', data);
          this.handleTypingNotification(roomId, data);
        } catch (error) {
          console.error('❌ Error parsing typing notification:', error);
        }
      }
    );

    this.subscriptions.set(`typing_${roomId}`, typingSubscription);

    // ==================== Confirmations ====================
    // S'abonner aux confirmations de message
    const confirmationDestination = `/user/${this.currentUserId}/queue/messages/confirmation`;
    console.log(`🔔 Subscribing to confirmations: ${confirmationDestination}`);

    const confirmationSubscription = this.client.subscribe(
      confirmationDestination,
      (frame) => {
        try {
          const data = JSON.parse(frame.body);
          console.log('✅ Message confirmation received:', data);
          this.handleMessageConfirmation(data);
        } catch (error) {
          console.error('❌ Error parsing confirmation:', error);
        }
      }
    );

    this.subscriptions.set(`confirmation_${roomId}`, confirmationSubscription);
  }

  // ==================== ENVOYER DES MESSAGES ====================

  async sendMessage(roomId: number, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.isConnected || !this.client?.connected) {
        console.error('❌ Cannot send message: WebSocket not connected');
        this.notifyError('WebSocket not connected');
        resolve(false);
        return;
      }

      if (!this.currentUserId) {
        console.error('❌ Cannot send message: User not authenticated');
        this.notifyError('User not authenticated');
        resolve(false);
        return;
      }

      console.log(
        `✉️ Sending message to room ${roomId}:`,
        content.substring(0, 50) + '...'
      );

      const messageRequest = {
        content: content,
        chatRoomId: roomId,
      };

      try {
        this.client.publish({
          destination: `/app/chat.sendMessage/${roomId}`,
          body: JSON.stringify(messageRequest),
          headers: {
            'content-type': 'application/json',
          },
        });

        console.log('✅ Message published to server');
        resolve(true);
      } catch (error) {
        console.error('❌ Error publishing message:', error);
        this.notifyError('Failed to send message');
        resolve(false);
      }
    });
  }

  sendTypingNotification(roomId: number, isTyping: boolean): void {
    if (!this.isConnected || !this.client?.connected || !this.currentUserId) {
      console.warn('⚠️ Cannot send typing notification: WebSocket not ready');
      return;
    }

    const typingRequest = {
      userId: this.currentUserId,
      isTyping,
    };

    try {
      this.client.publish({
        destination: `/app/chat.typing/${roomId}`,
        body: JSON.stringify(typingRequest),
        headers: { 'content-type': 'application/json' },
      });

      console.log(`⌨️ Typing notification sent: ${isTyping ? 'typing' : 'stopped'}`);
    } catch (error) {
      console.error('❌ Error sending typing notification:', error);
    }
  }

  // ==================== CALLBACKS PRIVÉS ====================

  /**
   * S'abonner aux messages privés d'un contact spécifique
   */
  onPrivateMessage(
    contactId: number,
    callback: (message: PrivateChatMessage) => void
  ): () => void {
    const key = `private_${contactId}`;
    
    if (!this.privateMessageCallbacks[key]) {
      this.privateMessageCallbacks[key] = [];
    }

    this.privateMessageCallbacks[key].push(callback);

    return () => {
      const index = this.privateMessageCallbacks[key].indexOf(callback);
      if (index > -1) {
        this.privateMessageCallbacks[key].splice(index, 1);
      }
    };
  }

  /**
   * S'abonner aux notifications de frappe d'un contact spécifique
   */
  onPrivateTyping(
    contactId: number,
    callback: (data: { userId: number; isTyping: boolean; username: string }) => void
  ): () => void {
    const key = `private_typing_${contactId}`;
    
    if (!this.privateTypingCallbacks[key]) {
      this.privateTypingCallbacks[key] = [];
    }

    this.privateTypingCallbacks[key].push(callback);

    return () => {
      const index = this.privateTypingCallbacks[key].indexOf(callback);
      if (index > -1) {
        this.privateTypingCallbacks[key].splice(index, 1);
      }
    };
  }

  /**
   * S'abonner aux changements de connexion
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionChangeCallbacks.push(callback);

    return () => {
      const index = this.connectionChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * S'abonner à la connexion
   */
  onConnect(callback: () => void): () => void {
    return this.onConnectionChange((connected) => {
      if (connected) callback();
    });
  }

  /**
   * S'abonner à la déconnexion
   */
  onDisconnect(callback: () => void): () => void {
    return this.onConnectionChange((connected) => {
      if (!connected) callback();
    });
  }

  /**
   * S'abonner aux erreurs
   */
  onError(callback: (error: string) => void): () => void {
    this.errorCallbacks.push(callback);

    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * S'abonner aux confirmations de message
   */
  onMessageConfirmation(
    callback: (confirmation: any) => void
  ): () => void {
    this.messageConfirmationCallbacks.push(callback);

    return () => {
      const index = this.messageConfirmationCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageConfirmationCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * S'abonner aux messages d'une room spécifique
   */
  onRoomMessage(
    roomId: number,
    callback: (message: MessageResponse) => void
  ): () => void {
    if (!this.messageCallbacks[roomId]) {
      this.messageCallbacks[roomId] = [];
    }

    this.messageCallbacks[roomId].push(callback);

    return () => {
      const index = this.messageCallbacks[roomId].indexOf(callback);
      if (index > -1) {
        this.messageCallbacks[roomId].splice(index, 1);
      }
    };
  }

  /**
   * S'abonner aux notifications de typing d'une room spécifique
   */
  onRoomTyping(
    roomId: number,
    callback: (data: { userId: number; isTyping: boolean }) => void
  ): () => void {
    if (!this.typingCallbacks[roomId]) {
      this.typingCallbacks[roomId] = [];
    }

    this.typingCallbacks[roomId].push(callback);

    return () => {
      const index = this.typingCallbacks[roomId].indexOf(callback);
      if (index > -1) {
        this.typingCallbacks[roomId].splice(index, 1);
      }
    };
  }

  // ==================== UTILITAIRES ====================

  isConnecting(): boolean {
    return this.client?.active === true && !this.isConnected;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.client?.connected === true;
  }

  getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  getConnectedRooms(): number[] {
    return Array.from(this.connectedRooms);
  }

  // ==================== HANDLERS PRIVÉS ====================

  private handlePrivateMessage(notification: any): void {
    const { senderId, receiverId, messageId, content, timestamp, senderName } = notification;
    
    // Créer un objet PrivateChatMessage
    const privateMessage: PrivateChatMessage = {
      id: messageId,
      senderId1: senderId,
      senderId2: receiverId,
      senderName1: senderName || `User ${senderId}`,
      senderName2: '', // Serà rempli par le frontend
      content,
      timestamp: timestamp || new Date().toISOString(),
      isRead: false,
    };

    // Notifier les callbacks pour ce contact
    const senderKey = `private_${senderId}`;
    if (this.privateMessageCallbacks[senderKey]) {
      this.privateMessageCallbacks[senderKey].forEach((callback) => {
        try {
          callback(privateMessage);
        } catch (error) {
          console.error('Error in private message callback:', error);
        }
      });
    }

    // Notifier aussi les callbacks généraux (pour les notifications)
    const generalKey = `private_all`;
    if (this.privateMessageCallbacks[generalKey]) {
      this.privateMessageCallbacks[generalKey].forEach((callback) => {
        try {
          callback(privateMessage);
        } catch (error) {
          console.error('Error in general private message callback:', error);
        }
      });
    }
  }

  private handlePrivateTypingNotification(notification: any): void {
    const { senderId, isTyping, senderName } = notification;
    
    // Notifier les callbacks pour ce contact
    const typingKey = `private_typing_${senderId}`;
    if (this.privateTypingCallbacks[typingKey]) {
      this.privateTypingCallbacks[typingKey].forEach((callback) => {
        try {
          callback({ userId: senderId, isTyping, username: senderName || `User ${senderId}` });
        } catch (error) {
          console.error('Error in private typing callback:', error);
        }
      });
    }
  }

  private handleRoomMessage(
    roomId: number,
    message: MessageResponse
  ): void {
    console.log(`📨 Handling message for room ${roomId}:`, message.id);

    // Notifier les callbacks de la room
    if (this.messageCallbacks[roomId]) {
      this.messageCallbacks[roomId].forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in message callback:', error);
        }
      });
    }
  }

  private handleTypingNotification(
    roomId: number,
    data: any
  ): void {
    if (
      !data.userId ||
      typeof data.isTyping !== 'boolean'
    ) {
      console.warn('Invalid typing notification data:', data);
      return;
    }

    console.log(
      `⌨️ Handling typing notification for room ${roomId}:`,
      data.userId,
      data.isTyping
    );

    // Notifier les callbacks de la room
    if (this.typingCallbacks[roomId]) {
      this.typingCallbacks[roomId].forEach((callback) => {
        try {
          callback({ userId: data.userId, isTyping: data.isTyping });
        } catch (error) {
          console.error('Error in typing callback:', error);
        }
      });
    }
  }

  private handleMessageConfirmation(confirmation: any): void {
    console.log('✅ Message confirmation:', confirmation);

    this.messageConfirmationCallbacks.forEach((callback) => {
      try {
        callback(confirmation);
      } catch (error) {
        console.error('Error in confirmation callback:', error);
      }
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    console.log(
      `🔄 Notifying connection change: ${connected ? 'connected' : 'disconnected'}`
    );

    this.connectionChangeCallbacks.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection change callback:', error);
      }
    });
  }

  private notifyError(error: string): void {
    console.error(`❌ Notifying error: ${error}`);

    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in error callback:', error);
      }
    });
  }

  private unsubscribeAll(): void {
    console.log('🧹 Unsubscribing from all topics...');

    this.subscriptions.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });

    this.subscriptions.clear();
    this.messageCallbacks = {};
    this.typingCallbacks = {};
    this.privateMessageCallbacks = {};
    this.privateTypingCallbacks = {};
  }
}

// Export singleton instance
export const chatWebSocket = new ChatWebSocketService();