import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, map, filter } from 'rxjs'; 
import { environment } from '../../../environments/environment';
import { FileUploadResponse, FileListResponse, FileSingleResponse, FileSearchResponse, FileStatsResponse, FileDeleteResponse } from '../../models/file/file.model';

@Injectable({ providedIn: 'root' })
export class FileManagerService {

  /** File manager runs on default Spring Boot port (8080). No server.port in application.yaml. */
  private readonly base = `${environment.fileApiUrl}/api/files`;

  constructor(private http: HttpClient) {}

  // ─── Upload ────────────────────────────────────────────────────────────────

  /**
   * POST /api/files/upload  (multipart/form-data)
   * @param file        the File object from an <input type="file">
   * @param description optional description text
   */
  upload(file: File, description = ''): Observable<FileUploadResponse> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('description', description);
    return this.http.post<FileUploadResponse>(`${this.base}/upload`, form);
  }

  /**
   * Same as upload() but reports upload progress (0-100).
   * Useful for progress bars.
   */
  uploadWithProgress(file: File, description = ''): Observable<{ progress: number; result?: FileUploadResponse }> {
    const form = new FormData();
    form.append('file', file, file.name);
    form.append('description', description);

    const req = new HttpRequest('POST', `${this.base}/upload`, form, { reportProgress: true });

    return this.http.request<FileUploadResponse>(req).pipe(
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
          return { progress };
        }
        if (event.type === HttpEventType.Response) {
          return { progress: 100, result: event.body ?? undefined };
        }
        return { progress: 0 };
      })
    );
  }

  // ─── Read ──────────────────────────────────────────────────────────────────

  /** GET /api/files → { success, data: FileEntity[], count } */
  getAll(): Observable<FileListResponse> {
    return this.http.get<FileListResponse>(this.base);
  }

  /** GET /api/files/{id} → { success, data: FileEntity } */
  getById(id: number): Observable<FileSingleResponse> {
    return this.http.get<FileSingleResponse>(`${this.base}/${id}`);
  }

  /** GET /api/files/search?fileName=xxx → { success, data: FileEntity[], count } */
  search(fileName: string): Observable<FileSearchResponse> {
    return this.http.get<FileSearchResponse>(`${this.base}/search`, { params: { fileName } });
  }

  /** GET /api/files/stats → { success, data: { totalFiles, totalSizeBytes, ... } } */
  getStats(): Observable<FileStatsResponse> {
    return this.http.get<FileStatsResponse>(`${this.base}/stats`);
  }

  // ─── Download ──────────────────────────────────────────────────────────────

  /**
   * GET /api/files/download/{fileName}
   * Returns a Blob — trigger browser download.
   *
   * Usage:
   *   this.fileService.download(fileName).subscribe(blob => {
   *     const url = URL.createObjectURL(blob);
   *     const a = document.createElement('a');
   *     a.href = url; a.download = fileName; a.click();
   *     URL.revokeObjectURL(url);
   *   });
   */
  download(fileName: string): Observable<Blob> {
    return this.http.get(`${this.base}/download/${encodeURIComponent(fileName)}`, {
      responseType: 'blob'
    });
  }

  /** GET /api/files/download-by-id/{id} → Blob */
  downloadById(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/download-by-id/${id}`, { responseType: 'blob' });
  }

  /** Returns a direct URL for linking/embedding (no Angular Observable). */
  getDownloadUrl(fileName: string): string {
    return `${this.base}/download/${encodeURIComponent(fileName)}`;
  }

  getDownloadUrlById(id: number): string {
    return `${this.base}/download-by-id/${id}`;
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  /**
   * PUT /api/files/{id}/description?description=xxx
   * Note: description is a query param, not a request body.
   */
  updateDescription(id: number, description: string): Observable<FileSingleResponse> {
    return this.http.put<FileSingleResponse>(`${this.base}/${id}/description`, null, {
      params: { description }
    });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  /** DELETE /api/files/{id} — hard delete from DB + filesystem */
  delete(id: number): Observable<FileDeleteResponse> {
    return this.http.delete<FileDeleteResponse>(`${this.base}/${id}`);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Format file size from String (backend stores as string) */
  formatSize(fileSizeStr: string): string {
    const bytes = parseInt(fileSizeStr, 10);
    if (isNaN(bytes)) return fileSizeStr;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Derive an icon from MIME type */
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
}