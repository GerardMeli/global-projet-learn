import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageCreateRequest, MessageResponse, MessageUpdateRequest, FileMessageResponse } from '../../models/chat/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly base = `${environment.chatApiUrl}/api/message`;

  constructor(private http: HttpClient) {}

  private getHeaders(extra?: Record<string, string>): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extra
    });
  }

  private getOptions(extra?: Record<string, string>) {
    return { headers: this.getHeaders(extra) };
  }

  /**
   * POST /api/message/messages
   * X-User-Id is required by the backend to identify the sender.
   */
  create(userId: number, request: MessageCreateRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.base}/messages`,
      request,
      this.getOptions({ 'X-User-Id': userId.toString() })
    );
  }

  /** PUT /api/message/messages/{messageId} */
  update(messageId: number, request: MessageUpdateRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.base}/messages/${messageId}`, request, this.getOptions());
  }

  /** DELETE /api/message/messages/{messageId} — soft delete */
  delete(messageId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.base}/messages/${messageId}`, this.getOptions());
  }

  /** DELETE /api/message/messages/{messageId}/permanent */
  deletePermanent(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/messages/${messageId}/permanent`, this.getOptions());
  }

  /** POST /api/message/messages/{messageId}/restore */
  restore(messageId: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/messages/${messageId}/restore`, {}, this.getOptions());
  }

  /** GET /api/message/rooms/{roomId}/messages?ordered=true */
  getByRoom(roomId: number, ordered = true): Observable<MessageResponse[]> {
    const token = localStorage.getItem('access_token');
    return this.http.get<MessageResponse[]>(`${this.base}/rooms/${roomId}/messages`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }),
      params: { ordered: ordered.toString() },
      withCredentials: true
    });
  }

  /** GET /api/message/rooms/{roomId}/files */
  getFilesByRoom(roomId: number): Observable<FileMessageResponse[]> {
    return this.http.get<FileMessageResponse[]>(`${this.base}/rooms/${roomId}/files`, this.getOptions());
  }

  /** GET /api/message/users/{senderId}/messages */
  getBySender(senderId: number, ordered = false): Observable<MessageResponse[]> {
    const token = localStorage.getItem('access_token');
    return this.http.get<MessageResponse[]>(`${this.base}/users/${senderId}/messages`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }),
      params: { ordered: ordered.toString() },
      withCredentials: true
    });
  }

  /** POST /api/message/rooms/{roomId}/typing */
  notifyTyping(roomId: number, userId: number, isTyping: boolean): Observable<{ userId: number; isTyping: boolean }> {
    return this.http.post<{ userId: number; isTyping: boolean }>(
      `${this.base}/rooms/${roomId}/typing`,
      { userId, isTyping },
      this.getOptions()
    );
  }
}