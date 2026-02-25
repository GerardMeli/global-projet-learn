// ─── Enums ───────────────────────────────────────────────────────────────────

import { MessageResponse } from "./message.model";

export enum ChatRoomType    { PRIVATE = 'PRIVATE', PUBLIC = 'PUBLIC' }
export enum ParticipantRole { ADMIN = 'ADMIN', MODERATOR = 'MODERATOR', MEMBER = 'MEMBER' }
export enum MessageType     { TEXT = 'TEXT', FILE = 'FILE', IMAGE = 'IMAGE' }

// ─── Shared sub-shapes ───────────────────────────────────────────────────────

export interface UserSimpleResponse {
  id: number;
  email: string;
}

// ─── WebSocket event shapes (from WebChatController / PrivateChatService) ─────

/** Broadcast to /topic/room/{roomId} */
export interface ChatMessageEvent {
  type: 'NEW_MESSAGE';
  message: MessageResponse;
  timestamp: number;
}

/** Broadcast to /topic/room/{roomId}/typing */
export interface TypingNotification {
  userId: number;
  isTyping: boolean;
  timestamp?: number;
}

/** Broadcast to /topic/room/{roomId}/activity */
export interface UserActivityEvent {
  type: 'USER_JOINED' | 'USER_LEFT';
  userId: number;
  username: string | null;
  roomId: number;
}

/** Private message to /queue/private/confirmation (sender) */
export interface PrivateChatNotification {
  messageId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
  unreadCount: number;
  isOwnMessage: boolean;
  isFile: boolean;
}

/** Broadcast to /topic/private/{userId} (receiver) */
export type PrivateMessageTopic = PrivateChatNotification;

/** Broadcast to /topic/private/file/{userId} */
export interface PrivateFileNotification {
  messageId: number;
  senderId: number;
  senderName: string;
  fileName: string | null;
  fileType: string;
  fileSize: number;
  description: string;
  timestamp: string;
  downloadUrl: string;
  isOwnMessage: boolean;
}

/** Broadcast to /topic/private/read/{senderId} */
export interface MessagesReadNotification {
  messageIds: number[];
  readerId: number;
}

/** User-specific confirmation /queue/messages/confirmation */
export interface MessageConfirmation {
  messageId: number;
  status: string;
  content: string;
}

/** Error pushed to /queue/errors */
export interface WsError {
  code: string;
  message: string;
  timestamp: number;
}