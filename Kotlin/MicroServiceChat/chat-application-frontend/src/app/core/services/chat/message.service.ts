import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { environment } from '../../../environments/environment';
import { MessageCreateRequest, MessageResponse, MessageUpdateRequest, FileMessageResponse } from '../../models/chat/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly base = `${environment.chatApiUrl}/api/message`;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/message/messages
   * Requires X-User-Id header — added by caller via options or a dedicated interceptor.
   */
  create(userId: number, request: MessageCreateRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/messages`, request, {
      headers: { 'X-User-Id': userId.toString() }
    });
  }

  /** PUT /api/message/messages/{messageId} */
  update(messageId: number, request: MessageUpdateRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.base}/messages/${messageId}`, request);
  }

  /** DELETE /api/message/messages/{messageId} — soft delete */
  delete(messageId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/messages/${messageId}`);
  }

  /** DELETE /api/message/messages/{messageId}/permanent */
  deletePermanent(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${messageId}/permanent`);
  }

  /** POST /api/message/messages/{messageId}/restore */
  restore(messageId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/messages/${messageId}/restore`, {});
  }

  /** GET /api/message/rooms/{roomId}/messages?ordered=true */
  getByRoom(roomId: number, ordered = true): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.base}/rooms/${roomId}/messages`, {
      params: { ordered: ordered.toString() }
    });
  }

  /** GET /api/message/rooms/{roomId}/files */
  getFilesByRoom(roomId: number): Observable<FileMessageResponse[]> {
    return this.http.get<FileMessageResponse[]>(`${this.base}/rooms/${roomId}/files`);
  }

  /** GET /api/message/users/{senderId}/messages */
  getBySender(senderId: number, ordered = false): Observable<MessageResponse[]> {
    return this.http.get<MessageResponse[]>(`${this.base}/users/${senderId}/messages`, {
      params: { ordered: ordered.toString() }
    });
  }

  /**
   * POST /api/message/rooms/{roomId}/typing
   * Also available via WebSocket: /app/chat.typing/{roomId}
   */
  notifyTyping(roomId: number, userId: number, isTyping: boolean): Observable<{ userId: number; isTyping: boolean }> {
    return this.http.post<{ userId: number; isTyping: boolean }>(
      `${this.base}/rooms/${roomId}/typing`,
      { userId, isTyping }
    );
  }
}