
// ─── Private chat ────────────────────────────────────────────────────────────

export interface PrivateChatRequest {
  senderId2: number;
  content: string;
}

export interface PrivateChatResponse {
  id: number;
  senderId1: number;
  senderId2: number;
  senderName1: string;
  senderName2: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface MarkAsReadRequest {
  messageIds: number[];
}

export interface PrivateFileResponse {
  messageId: number;
  fileId: number | null;
  fileName: string | null;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  timestamp: string;
  uploadStatus: string;
  downloadUrl: string;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface UserContactDTO {
  userId: number;
  username: string;
  lastMessage: string;
  lastMessageTime: string | null;
  unreadCount: number;
}