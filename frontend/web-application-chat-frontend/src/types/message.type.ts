import type { UserSimpleResponse } from "./user.types";

export interface MessageResponse {
  id: number;
  content: string;
  sender: UserSimpleResponse;
  chatRoomId: number;
  timestamp: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  isDeleted: boolean;
}

export interface MessageCreateRequest {
  content: string;
  chatRoomId: number;
  messageType?: 'TEXT' | 'IMAGE' | 'FILE';
}