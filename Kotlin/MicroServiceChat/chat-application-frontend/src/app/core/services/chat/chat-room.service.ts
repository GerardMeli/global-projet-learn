import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatRoomCreateRequest, ChatRoomResponse, ChatRoomDetailResponse, ChatRoomUpdateRequest } from '../../models/chat/chat-room.model';

@Injectable({ providedIn: 'root' })
export class ChatRoomService {
  private readonly base = `${environment.chatApiUrl}/api/chat-rooms`;

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

  /** POST /api/chat-rooms */
  create(request: ChatRoomCreateRequest): Observable<ChatRoomResponse> {
    return this.http.post<ChatRoomResponse>(this.base, request, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms */
  getAll(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(this.base, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms/public */
  getPublic(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(`${this.base}/public`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms/private */
  getPrivate(): Observable<ChatRoomResponse[]> {
    return this.http.get<ChatRoomResponse[]>(`${this.base}/private`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms/{id} */
  getById(id: number): Observable<ChatRoomDetailResponse> {
    return this.http.get<ChatRoomDetailResponse>(`${this.base}/${id}`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms/search?name= */
  search(name: string): Observable<ChatRoomResponse[]> {
    const token = localStorage.getItem('access_token');
    return this.http.get<ChatRoomResponse[]>(`${this.base}/search`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }),
      params: { name },
      // withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /** PUT /api/chat-rooms/{id} */
  update(id: number, request: ChatRoomUpdateRequest): Observable<ChatRoomResponse> {
    return this.http.put<ChatRoomResponse>(`${this.base}/${id}`, request, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** DELETE /api/chat-rooms/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** GET /api/chat-rooms/{roomId}/messages/count */
  getMessageCount(roomId: number): Observable<{ messageCount: number }> {
    return this.http.get<{ messageCount: number }>(`${this.base}/${roomId}/messages/count`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  /** DELETE /api/chat-rooms/{roomId}/participants/{userId} */
  removeParticipant(roomId: number, userId: number): Observable<ChatRoomDetailResponse> {
    return this.http.delete<ChatRoomDetailResponse>(`${this.base}/${roomId}/participants/${userId}`, this.getOptions())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('[ChatRoomService] Error:', error);
    const msg = error.status === 403 ? 'Accès non autorisé' :
                error.status === 404 ? 'Ressource non trouvée' :
                error.status === 500 ? 'Erreur serveur' :
                `Erreur ${error.status}: ${error.message}`;
    return throwError(() => new Error(msg));
  }
}