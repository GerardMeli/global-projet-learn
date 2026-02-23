import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileUploadResponse, FileListResponse, FileSingleResponse, FileSearchResponse, FileStatsResponse, FileDeleteResponse } from '../../models/file/file.model';
import { TokenService } from '../users/token.service';

@Injectable({ providedIn: 'root' })
export class FileManagerService {
  private readonly base = `${environment.fileApiUrl}/api/files`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private getOptions() {
    return { headers: this.getHeaders(), withCredentials: true };
  }

  // ─── Upload ────────────────────────────────────────────────────────────────

  upload(file: File, description = ''): Observable<FileUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('description', description || ' '); // ← évite string vide (required côté Spring)
    return this.http.post<FileUploadResponse>(`${this.base}/upload`, form, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`,
        'Accept': 'application/json'
        // PAS de Content-Type → navigateur gère multipart/form-data + boundary
      }),
      withCredentials: true
    });
  }

  uploadWithProgress(file: File, description?: string): Observable<{ progress?: number; result?: any }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('description', description || ' '); // ← évite string vide

    const token = this.tokenService.getAccessToken();

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            observer.next({ result: JSON.parse(xhr.responseText) });
          } catch {
            observer.next({ result: xhr.responseText });
          }
          observer.complete();
        } else {
          observer.error({ status: xhr.status, message: xhr.responseText });
        }
      });

      xhr.addEventListener('error', () => {
        observer.error({ status: 0, message: 'Erreur réseau' });
      });

      xhr.open('POST', `${environment.fileApiUrl}/api/files/upload`);
      // NE PAS setRequestHeader Content-Type → navigateur gère multipart automatiquement
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send(formData);
    });
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  getAll(): Observable<FileListResponse> {
    return this.http.get<FileListResponse>(this.base, this.getOptions());
  }

  getById(id: number): Observable<FileSingleResponse> {
    return this.http.get<FileSingleResponse>(`${this.base}/${id}`, this.getOptions());
  }

  search(fileName: string): Observable<FileSearchResponse> {
    return this.http.get<FileSearchResponse>(`${this.base}/search`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`,
        'Accept': 'application/json'
      }),
      params: { fileName },
      withCredentials: true
    });
  }

  getStats(): Observable<FileStatsResponse> {
    return this.http.get<FileStatsResponse>(`${this.base}/stats`, this.getOptions());
  }

  // ─── Download ──────────────────────────────────────────────────────────────

  /**
   * Télécharge un fichier par nom et déclenche le téléchargement navigateur
   * Style Telegram/WhatsApp : progress bar + nom de fichier conservé
   */
  downloadWithProgress(fileName: string, displayName?: string): Observable<{ progress?: number; done?: boolean }> {
    const token = this.getToken();

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';

      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const blob = xhr.response as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = displayName || fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          observer.next({ progress: 100, done: true });
          observer.complete();
        } else {
          observer.error({ status: xhr.status, message: 'Téléchargement échoué' });
        }
      });

      xhr.addEventListener('error', () => {
        observer.error({ status: 0, message: 'Erreur réseau' });
      });

      xhr.open('GET', `${this.base}/download/${encodeURIComponent(fileName)}`);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      xhr.send();
    });
  }

  /**
   * Télécharge par ID avec progress
   */
  downloadByIdWithProgress(id: number, displayName?: string): Observable<{ progress?: number; done?: boolean }> {
    const token = this.getToken();

    return new Observable(observer => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';

      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          observer.next({ progress });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const blob = xhr.response as Blob;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = displayName || `file-${id}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          observer.next({ progress: 100, done: true });
          observer.complete();
        } else {
          observer.error({ status: xhr.status });
        }
      });

      xhr.addEventListener('error', () => observer.error({ status: 0 }));

      xhr.open('GET', `${this.base}/download-by-id/${id}`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send();
    });
  }

  /** Blob simple (sans progress) */
  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.base}/download/${encodeURIComponent(fileName)}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` }),
      responseType: 'blob',
      withCredentials: true
    });
  }

  downloadById(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/download-by-id/${id}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.getToken()}` }),
      responseType: 'blob',
      withCredentials: true
    });
  }

  getDownloadUrl(fileName: string): string {
    return `${this.base}/download/${encodeURIComponent(fileName)}`;
  }

  getDownloadUrlById(id: number): string {
    return `${this.base}/download-by-id/${id}`;
  }

  // ─── Update / Delete ───────────────────────────────────────────────────────

  updateDescription(id: number, description: string): Observable<FileSingleResponse> {
    return this.http.put<FileSingleResponse>(`${this.base}/${id}/description`, null, {
      headers: this.getHeaders(),
      params: { description },
      withCredentials: true
    });
  }

  delete(id: number): Observable<FileDeleteResponse> {
    return this.http.delete<FileDeleteResponse>(`${this.base}/${id}`, this.getOptions());
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  formatSize(fileSizeStr: string): string {
    const bytes = parseInt(fileSizeStr, 10);
    if (isNaN(bytes)) return fileSizeStr;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗜️';
    if (fileType.startsWith('video/')) return '🎬';
    if (fileType.startsWith('audio/')) return '🎵';
    return '📁';
  }

  isImage(fileType: string): boolean {
    return fileType.startsWith('image/');
  }

  isVideo(fileType: string): boolean {
    return fileType.startsWith('video/');
  }

  isAudio(fileType: string): boolean {
    return fileType.startsWith('audio/');
  }
}