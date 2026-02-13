// src/services/api/chat.ts
import api from './api';

// src/services/api/chat.ts
export interface ChatRoom {
  id: number;
  name: string;
  description?: string;
  type: 'PRIVATE' | 'GROUP' | 'PUBLIC' | string; // Ajoutez 'type'
  isPrivate?: boolean; // Optionnel, au cas où
  maxParticipants?: number;
  participantCount?: number; // Ajoutez 'participantCount'
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
}

export interface ChatRoomResponse extends ChatRoom {
  participantCount: number; // Assurez-vous que c'est présent dans la réponse
}

export interface ChatParticipant {
  id: number;
  userId: number;
  chatRoomId: number;
  role: 'MEMBER' | 'ADMIN' | 'OWNER' | 'MODERATOR';
  joinedAt: string;
  user?: {
    id: number;
    email: string;
    username?: string;
  };
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  chatRoomId: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  sender?: {
    id: number;
    email: string;
    username?: string;
  };
}

// src/services/api/chat.ts
export const chatApi = {

  // Chat Rooms
  getAllChatRooms: () => api.get<ChatRoomResponse[]>('/api/chat/rooms'),
  
  getChatRoomById: (id: number) => api.get<ChatRoomResponse>(`/api/chat/rooms/${id}`),
  
  createChatRoom: (data: { 
    name: string; 
    description?: string; 
    type?: 'PRIVATE' | 'GROUP' | 'PUBLIC' | string;
    isPrivate?: boolean;
    maxParticipants?: number;
  }) => api.post<ChatRoomResponse>('/api/chat/rooms', data),
  
  updateChatRoom: (id: number, data: { 
    name?: string; 
    description?: string;
    type?: 'PRIVATE' | 'GROUP' | 'PUBLIC' | string;
    isPrivate?: boolean;
    maxParticipants?: number;
  }) => api.put<ChatRoomResponse>(`/api/chat/rooms/${id}`, data),
  
  deleteChatRoom: (id: number) => api.delete(`/api/chat/rooms/${id}`),
  
  searchChatRooms: (name: string) => api.get<ChatRoomResponse[]>(`/api/chat/rooms/search?name=${name}`),

  getUserChatRooms: async (userId: number) => {
    return api.get(`/chat/users/${userId}/rooms`);
  },
  
  // Participants
  getParticipantsByRoom: (roomId: number) =>
    api.get<ChatParticipant[]>(`/api/chat/rooms/${roomId}/participants`),
  
  addParticipant: (data: { 
    userId: number; 
    chatRoomId: number; 
    role?: string;
  }) => api.post<ChatParticipant>('/api/chat/participants', data),
  
  removeParticipant: (participantId: number) =>
    api.delete(`/api/chat/participants/${participantId}`),
  
  updateParticipantRole: (participantId: number, role: string) =>
    api.put<ChatParticipant>(`/api/chat/participants/${participantId}/role`, { role }),
  
  getRoomsForUser: (userId: number) =>
    api.get<ChatParticipant[]>(`/api/chat/users/${userId}/rooms`),
  
  // Messages
  getMessagesByRoom: (roomId: number) =>
    api.get<Message[]>(`/api/chat/rooms/${roomId}/messages`),
  
  getMessagesByRoomOrdered: (roomId: number) =>
    api.get<Message[]>(`/api/chat/rooms/${roomId}/messages/ordered`),
  
  createMessage: (data: { 
    chatRoomId: number; 
    content: string;
  }) => api.post<Message>('/api/chat/messages', data, {
    headers: { 'X-User-Id': localStorage.getItem('userId') || '' }
  }),
  
  updateMessage: (messageId: number, data: { content: string }) =>
    api.put<Message>(`/api/chat/messages/${messageId}`, data),
  
  deleteMessage: (messageId: number) =>
    api.delete<Message>(`/api/chat/messages/${messageId}`),
  
  restoreMessage: (messageId: number) =>
    api.post<Message>(`/api/chat/messages/${messageId}/restore`),
  
  // Utility
  countParticipants: (roomId: number) =>
    api.get<number>(`/api/chat/rooms/${roomId}/participants/count`),
  
  isUserParticipant: (userId: number, roomId: number) =>
    api.get<boolean>(`/api/chat/users/${userId}/is-participant/${roomId}`),
  
  isUserAdmin: (userId: number, roomId: number) =>
    api.get<boolean>(`/api/chat/users/${userId}/is-admin/${roomId}`),

  getOrderedMessages: (roomId: number) => api.get(`/api/chat/rooms/${roomId}/messages/ordered`),

  getMessageById: (id: number) => api.get(`/api/chat/messages/${id}`),
};