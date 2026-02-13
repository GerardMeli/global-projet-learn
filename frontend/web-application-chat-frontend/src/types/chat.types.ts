import type { MessageResponse } from "./message.type";
import type { UserSimpleResponse } from "./user.types";

export interface ChatRoomResponse {
  id: number;
  name: string;
  type: 'PRIVATE' | 'GROUP';
  participantCount: number;
}

export interface ChatRoomDetailResponse {
  id: number;
  name: string;
  type: 'PRIVATE' | 'GROUP';
  participants: ChatParticipant[];
  messages: MessageResponse[];
}

export interface ChatParticipant {
  id: number;
  user: UserSimpleResponse;
  chatRoomId: number;
  joinedAt: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface ChatParticipantResponse {
  id: number;
  user: UserSimpleResponse;
  chatRoomId: number;
  joinedAt: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
}