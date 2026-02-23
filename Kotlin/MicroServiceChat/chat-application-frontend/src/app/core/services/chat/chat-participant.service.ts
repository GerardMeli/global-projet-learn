import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatParticipantCreateRequest, ChatParticipantResponse, ChatParticipantDetailResponse, ChatParticipantUpdateRequest } from '../../models/chat/chat-participant.model';
import { ParticipantRole } from '../../models/chat/chat.mdel';

@Injectable({ providedIn: 'root' })
export class ChatParticipantService {
  private readonly base = `${environment.chatApiUrl}/api/chat-participant`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private getOptions() {
    return { headers: this.getHeaders() };
  }

  /** POST /api/chat-participant/participants */
  add(request: ChatParticipantCreateRequest): Observable<ChatParticipantResponse> {
    return this.http.post<ChatParticipantResponse>(`${this.base}/participants`, request, this.getOptions());
  }

  /** GET /api/chat-participant/participants */
  getAll(): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/participants`, this.getOptions());
  }

  /** GET /api/chat-participant/participants/{id} */
  getById(id: number): Observable<ChatParticipantDetailResponse> {
    return this.http.get<ChatParticipantDetailResponse>(`${this.base}/participants/${id}`, this.getOptions());
  }

  /** GET /api/chat-participant/rooms/{roomId}/participants */
  getByRoom(roomId: number): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/rooms/${roomId}/participants`, this.getOptions());
  }

  /** GET /api/chat-participant/rooms/{roomId}/participants/members */
  getMembersInRoom(roomId: number): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/rooms/${roomId}/participants/members`, this.getOptions());
  }

  /** GET /api/chat-participant/rooms/{roomId}/participants/role/{role} */
  getByRoleInRoom(roomId: number, role: ParticipantRole): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/rooms/${roomId}/participants/role/${role}`, this.getOptions());
  }

  /** GET /api/chat-participant/participants/role/{role} */
  getByRole(role: ParticipantRole): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/participants/role/${role}`, this.getOptions());
  }

  /** GET /api/chat-participant/users/{userId}/rooms */
  getRoomsForUser(userId: number): Observable<ChatParticipantResponse[]> {
    return this.http.get<ChatParticipantResponse[]>(`${this.base}/users/${userId}/rooms`, this.getOptions());
  }

  /** GET /api/chat-participant/users/{userId}/rooms/count */
  countRoomsForUser(userId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.base}/users/${userId}/rooms/count`, this.getOptions());
  }

  /** GET /api/chat-participant/rooms/{roomId}/participants/count */
  countInRoom(roomId: number): Observable<number> {
    return this.http.get<number>(`${this.base}/rooms/${roomId}/participants/count`, this.getOptions());
  }

  /** GET /api/chat-participant/rooms/{roomId}/participants/user/{userId} */
  getParticipant(roomId: number, userId: number): Observable<ChatParticipantResponse> {
    return this.http.get<ChatParticipantResponse>(`${this.base}/rooms/${roomId}/participants/user/${userId}`, this.getOptions());
  }

  /** GET /api/chat-participant/users/{userId}/is-participant/{roomId} */
  isParticipant(userId: number, roomId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/users/${userId}/is-participant/${roomId}`, this.getOptions());
  }

  /** GET /api/chat-participant/users/{userId}/is-admin/{roomId} */
  isAdmin(userId: number, roomId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/users/${userId}/is-admin/${roomId}`, this.getOptions());
  }

  /** GET /api/chat-participant/users/{userId}/is-moderator/{roomId} */
  isModerator(userId: number, roomId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/users/${userId}/is-moderator/${roomId}`, this.getOptions());
  }

  /** PUT /api/chat-participant/participants/{participantId}/role */
  updateRole(participantId: number, request: ChatParticipantUpdateRequest): Observable<ChatParticipantResponse> {
    return this.http.put<ChatParticipantResponse>(`${this.base}/participants/${participantId}/role`, request, this.getOptions());
  }

  /** PUT /api/chat-participant/rooms/{roomId}/participants/user/{userId}/role */
  updateRoleByUser(roomId: number, userId: number, request: ChatParticipantUpdateRequest): Observable<ChatParticipantResponse> {
    return this.http.put<ChatParticipantResponse>(
      `${this.base}/rooms/${roomId}/participants/user/${userId}/role`, request, this.getOptions()
    );
  }

  /** DELETE /api/chat-participant/participants/{participantId} */
  remove(participantId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/participants/${participantId}`, this.getOptions());
  }

  /** DELETE /api/chat-participant/rooms/{roomId}/participants/user/{userId} */
  removeByUser(roomId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/rooms/${roomId}/participants/user/${userId}`, this.getOptions());
  }
}