import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { environment } from '../../../environments/environment';
import { PrivateChatRequest, PrivateChatResponse, UserContactDTO, MarkAsReadRequest, PrivateFileResponse } from '../../models/chat/private-chat.model';

@Injectable({ providedIn: 'root' })
export class PrivateChatService {
  private readonly base = `${environment.chatApiUrl}/api/private-chat`;

  constructor(private http: HttpClient) {}

  /** POST /api/private-chat/send/{senderId} */
  send(senderId: number, request: PrivateChatRequest): Observable<PrivateChatResponse> {
    return this.http.post<PrivateChatResponse>(`${this.base}/send/${senderId}`, request);
  }

  /** GET /api/private-chat/chat/{userId1}/{userId2} */
  getConversation(userId1: number, userId2: number): Observable<PrivateChatResponse[]> {
    return this.http.get<PrivateChatResponse[]>(`${this.base}/chat/${userId1}/${userId2}`);
  }

  /** GET /api/private-chat/user/{userId} */
  getUserChats(userId: number): Observable<PrivateChatResponse[]> {
    return this.http.get<PrivateChatResponse[]>(`${this.base}/user/${userId}`);
  }

  /** GET /api/private-chat/contacts/{userId} */
  getContacts(userId: number): Observable<UserContactDTO[]> {
    return this.http.get<UserContactDTO[]>(`${this.base}/contacts/${userId}`);
  }

  /** GET /api/private-chat/unread-count/{userId} */
  getUnreadCount(userId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.base}/unread-count/${userId}`);
  }

  /** POST /api/private-chat/mark-read/{userId} */
  markAsRead(userId: number, request: MarkAsReadRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/mark-read/${userId}`, request);
  }

  /**
   * POST /api/private-chat/send-file/{senderId}
   * multipart/form-data: file + receiverId + description
   */
  sendFile(senderId: number, receiverId: number, file: File, description = ''): Observable<PrivateFileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('receiverId', receiverId.toString());
    formData.append('description', description);
    return this.http.post<PrivateFileResponse>(`${this.base}/send-file/${senderId}`, formData);
  }

  /** GET /api/private-chat/files/{userId1}/{userId2} */
  getFilesBetween(userId1: number, userId2: number): Observable<PrivateFileResponse[]> {
    return this.http.get<PrivateFileResponse[]>(`${this.base}/files/${userId1}/${userId2}`);
  }

  /** DELETE /api/private-chat/files/{messageId} */
  deleteFile(messageId: number): Observable<PrivateFileResponse> {
    return this.http.delete<PrivateFileResponse>(`${this.base}/files/${messageId}`);
  }
}