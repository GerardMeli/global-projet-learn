// src/types/chat.ts
export interface User {
  id: number;
  email: string;
  isActive?: boolean;
  role?: string;
}

export interface PrivateChatMessage {
  id: number;
  senderId1: number;
  senderId2: number;
  senderName1: string;
  senderName2: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface Contact {
  userId: number;
  username: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
  online?: boolean; // Ajoutez cette ligne

}

export interface MessageRequest {
  senderId2: number;
  content: string;
}

export interface MarkAsReadRequest {
  messageIds: number[];
}

export interface TypingStatus {
  isTyping: boolean;
  senderId: number;
  conversationId?: string;
}