
// ─── Message ─────────────────────────────────────────────────────────────────

import { MessageType, UserSimpleResponse } from "./chat.mdel";

export interface MessageCreateRequest {
  content: string;
  chatRoomId: number;
  messageType: MessageType;
}

export interface MessageUpdateRequest {
  content?: string;
}

export interface MessageResponse {
  id: number;
  content: string;
  sender: UserSimpleResponse;
  chatRoomId: number;
  timestamp: string;
  messageType: MessageType;
  isDeleted: boolean;
}

export interface FileMessageResponse {
  messageId: number;
  fileId: number | null;
  fileName: string | null;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  description: string;
  uploaderId: number;
  uploaderName: string;
  chatRoomId: number;
  chatRoomName: string;
  timestamp: string;
  uploadStatus: string;
}