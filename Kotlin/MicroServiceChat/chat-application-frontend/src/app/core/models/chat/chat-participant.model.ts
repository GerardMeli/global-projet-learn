// ─── ChatParticipant ─────────────────────────────────────────────────────────

import { ChatRoomResponse } from "./chat-room.model";
import { ParticipantRole, UserSimpleResponse } from "./chat.mdel";

export interface ChatParticipantCreateRequest {
  userId: number;
  chatRoomId: number;
  role: ParticipantRole;
}

export interface ChatParticipantUpdateRequest {
  role: ParticipantRole;
}

export interface ChatParticipantResponse {
  id: number;
  user: UserSimpleResponse;
  chatRoomId: number;
  joinedAt: string;
  role: ParticipantRole;
}

export interface ChatParticipantDetailResponse {
  id: number;
  user: UserSimpleResponse;
  chatRoom: ChatRoomResponse;
  joinedAt: string;
  role: ParticipantRole;
}
