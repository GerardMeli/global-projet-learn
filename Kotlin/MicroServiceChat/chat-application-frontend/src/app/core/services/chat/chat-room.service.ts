import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { environment } from '../../../environments/environment';
import { ChatRoomCreateRequest, ChatRoomResponse, ChatRoomDetailResponse, ChatRoomUpdateRequest } from '../../models/chat/chat-room.model';

@Injectable({ providedIn: 'root' })
export class ChatRoomService {
  private readonly base = `${environment.chatApiUrl}/api/chat-rooms`;

  constructor(private http: HttpClient) {}

  /** POST /api/chat-rooms */
  create(request: ChatRoomCreateRequest): Observable<ChatRoomResponse> {
    return this.http.post<ChatRoomResponse>(this.base, request);
  }

  /** GET /api/chat-rooms */
  getAll(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(this.base);
  }

  /** GET /api/chat-rooms/public */
  getPublic(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(`${this.base}/public`);
  }

  /** GET /api/chat-rooms/private */
  getPrivate(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(`${this.base}/private`);
  }

  /** GET /api/chat-rooms/{id} */
  getById(id: number): Observable<ChatRoomDetailResponse> {
    return this.http.get<ChatRoomDetailResponse>(`${this.base}/${id}`);
  }

  /** GET /api/chat-rooms/search?name= */
  search(name: string): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(`${this.base}/search`, { params: { name } });
  }

  /** PUT /api/chat-rooms/{id} */
  update(id: number, request: ChatRoomUpdateRequest): Observable<ChatRoomResponse> {
    return this.http.put<ChatRoomResponse>(`${this.base}/${id}`, request);
  }

  /** DELETE /api/chat-rooms/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** GET /api/chat-rooms/{roomId}/messages/count */
  getMessageCount(roomId: number): Observable<{ messageCount: number }> {
    return this.http.get<{ messageCount: number }>(`${this.base}/${roomId}/messages/count`);
  }

  /** DELETE /api/chat-rooms/{roomId}/participants/{userId} */
  removeParticipant(roomId: number, userId: number): Observable<ChatRoomDetailResponse> {
    return this.http.delete<ChatRoomDetailResponse>(`${this.base}/${roomId}/participants/${userId}`);
  }
}