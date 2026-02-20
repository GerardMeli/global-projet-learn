// ─── ChatRoom ────────────────────────────────────────────────────────────────

import { ChatParticipantResponse } from "./chat-participant.model";
import { ChatRoomType } from "./chat.mdel";
import { MessageResponse } from "./message.model";

export interface ChatRoomCreateRequest {
  name: string;
  type: ChatRoomType;
  userIds: number[];
}

export interface ChatRoomUpdateRequest {
  name: string;
  type: ChatRoomType;
}

export interface ChatRoomResponse {
  id: number;
  name: string;
  type: ChatRoomType;
  participantCount: number;
}

export interface ChatRoomDetailResponse {
  id: number;
  name: string;
  type: ChatRoomType;
  participants: ChatParticipantResponse[];
  messages: MessageResponse[];
}