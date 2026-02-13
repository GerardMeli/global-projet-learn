// src/services/api/oneToOneApi.ts
import type { MessageRequest, PrivateChatMessage, Contact, MarkAsReadRequest } from '../../types/oneToOne.type';
import api from './api';

// Les endpoints commencent déjà par /api, donc pas besoin de l'ajouter ici
export const oneToOneApi = {
  // Envoyer un message
  sendMessage: (senderId: number, request: MessageRequest) => 
    api.post<PrivateChatMessage>(`/api/private-chat/send/${senderId}`, request),

  // Récupérer la conversation entre deux utilisateurs
  getChatBetweenUsers: (userId1: number, userId2: number) => 
    api.get<PrivateChatMessage[]>(`/api/private-chat/chat/${userId1}/${userId2}`),

  // Récupérer tous les chats d'un utilisateur
  getUserChats: (userId: number) => 
    api.get<PrivateChatMessage[]>(`/api/private-chat/user/${userId}`),

  // Récupérer les contacts d'un utilisateur
  getUserContacts: (userId: number) => 
    api.get<Contact[]>(`/api/private-chat/contacts/${userId}`),

  // Marquer les messages comme lus
  markMessagesAsRead: (userId: number, request: MarkAsReadRequest) => 
    api.post<void>(`/api/private-chat/mark-read/${userId}`, request),

  // Récupérer le nombre de messages non lus
  getUnreadCount: (userId: number) => 
    api.get<{ unreadCount: number }>(`/api/private-chat/unread-count/${userId}`),
}; 