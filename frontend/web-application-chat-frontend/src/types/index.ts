// Ré-exporter tous les types
export * from './auth.types';
export * from './user.types';
export * from './chat.types';
// export * from './message.types';
// export * from './websocket.types';

// Types communs
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
  timestamp: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// src/types/index.ts - Types consolidés pour le chat

// ==================== USER TYPES ====================

export interface UserSimpleResponse {
  id: number;
  email: string;
}

export interface UserResponse extends UserSimpleResponse {
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ==================== MESSAGE TYPES ====================

export const MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
} as const;

export type MessageType =
  typeof MessageType[keyof typeof MessageType];


export interface MessageResponse {
  id: number;
  content: string;
  sender: UserSimpleResponse;
  chatRoomId: number;
  timestamp: string;
  messageType: MessageType | string;
  isDeleted: boolean;
}

export interface MessageCreateRequest {
  content: string;
  chatRoomId: number;
  messageType?: MessageType | string;
}

// ==================== CHAT ROOM TYPES ====================

export const ChatRoomType = {
  PRIVATE: 'PRIVATE',
  GROUP: 'GROUP',
  PUBLIC: 'PUBLIC',
} as const;

export type ChatRoomType =
  typeof ChatRoomType[keyof typeof ChatRoomType];


export interface ChatRoomResponse {
  id: number;
  name: string;
  description?: string;
  type: ChatRoomType | string;
  participantCount: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: number;
}

export interface ChatRoomDetailResponse extends ChatRoomResponse {
  participants: ChatParticipantResponse[];
  messages: MessageResponse[];
}

// ==================== PARTICIPANT TYPES ====================

export const ParticipantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  MODERATOR: 'MODERATOR',
} as const;

export type ParticipantRole =
  typeof ParticipantRole[keyof typeof ParticipantRole];


export interface ChatParticipantResponse {
  id: number;
  user: UserSimpleResponse;
  chatRoomId: number;
  joinedAt: string;
  role: ParticipantRole | string;
}

// ==================== WEBSOCKET TYPES ====================

export const WebSocketEventType = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  MESSAGE_CONFIRMATION: 'MESSAGE_CONFIRMATION',
  MESSAGE_ERROR: 'MESSAGE_ERROR',
  TYPING: 'TYPING',
  USER_JOINED: 'USER_JOINED',
  USER_LEFT: 'USER_LEFT',
  MESSAGE_READ: 'MESSAGE_READ',
  SYSTEM: 'SYSTEM',
} as const;

export type WebSocketEventType =
  typeof WebSocketEventType[keyof typeof WebSocketEventType];

export interface WebSocketMessage {
  type: WebSocketEventType | string;
  roomId?: number;
  message?: MessageResponse;
  messageId?: number;
  userId?: number;
  username?: string;
  isTyping?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'error';
  timestamp?: number;
  data?: any;
}

export interface MessageEvent {
  type: 'NEW_MESSAGE';
  message: MessageResponse;
  timestamp: number;
}

export interface MessageConfirmation {
  messageId: number;
  status: 'SENT' | 'DELIVERED' | 'ERROR';
  content: string;
}

export interface MessageError {
  code: string;
  message: string;
  timestamp: number;
}

export interface TypingNotification {
  userId: number;
  isTyping: boolean;
  timestamp: number;
}

export interface UserEvent {
  type: 'USER_JOINED' | 'USER_LEFT';
  userId: number;
  username: string;
  action: string;
  timestamp: number;
}

// ==================== LOCAL STATE TYPES ====================

export const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  ERROR: 'error',
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];


export interface LocalMessage extends MessageResponse {
  status?: MessageStatus;
  optimisticId?: string;
}