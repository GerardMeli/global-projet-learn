// admin-files.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  FileEntity, 
  FileStatsResponse, 
  FileListResponse 
} from '../../../core/models/file/file.model';
import { FileManagerService } from '../../../core/services/file/file.service';

@Component({
  selector: 'app-admin-files',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: './admin-files.html',
  styles: ['./admin-files.scss']
})
export class AdminFilesComponent implements OnInit {
  stats: FileStatsResponse | null = null;
  files: FileEntity[] = [];
  filteredFiles: FileEntity[] = [];
  paginatedFiles: FileEntity[] = [];
  
  searchTerm = '';
  typeFilter = '';
  
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  
  loading = false;
  error = '';
  
  fileToDelete: FileEntity | null = null;

  Math = Math;

  constructor(public fileService: FileManagerService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.fileService.getStats().subscribe({
      next: (response) => {
        this.stats = response;
        // Extract files from the response data structure
        // Note: The stats response might have a different structure than a direct file list
        // We need to get the actual files list separately
        this.loadFiles();
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
        this.error = 'Failed to load file statistics';
        this.loading = false;
      }
    });
  }

  loadFiles(): void {
    this.fileService.getAll().subscribe({
      next: (response) => {
        this.files = response.data || [];
        this.filterFiles();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load files:', error);
        this.error = 'Failed to load files';
        this.loading = false;
      }
    });
  }

  filterFiles(): void {
    this.filteredFiles = this.files.filter(file => {
      const searchableText = (file.originalFileName || file.fileName).toLowerCase();
      const description = file.description?.toLowerCase() || '';
      const searchLower = this.searchTerm.toLowerCase();
      
      const matchesSearch = !this.searchTerm || 
        searchableText.includes(searchLower) ||
        description.includes(searchLower);
      
      const matchesType = !this.typeFilter || 
        file.fileType.startsWith(this.typeFilter) ||
        file.fileType === this.typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort by upload time descending (newest first)
    this.filteredFiles.sort((a, b) => 
      new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );

    this.totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedFiles();
  }

  searchFiles(): void {
    this.filterFiles();
  }

  filterByType(): void {
    this.filterFiles();
  }

  updatePaginatedFiles(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedFiles = this.filteredFiles.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedFiles();
  }

  changePageSize(): void {
    this.totalPages = Math.ceil(this.filteredFiles.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedFiles();
  }

  downloadFile(file: FileEntity): void {
    this.fileService.download(file.fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalFileName || file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Failed to download file:', error);
        this.error = 'Failed to download file';
        
        // Auto-hide error after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  confirmDeleteFile(file: FileEntity): void {
    this.fileToDelete = file;
  }

  cancelDelete(): void {
    this.fileToDelete = null;
  }

  deleteFile(): void {
    if (!this.fileToDelete) return;

    this.fileService.delete(this.fileToDelete.id).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== this.fileToDelete!.id);
        this.filterFiles();
        this.fileToDelete = null;
      },
      error: (error) => {
        console.error('Failed to delete file:', error);
        this.error = 'Failed to delete file';
        this.fileToDelete = null;
        
        // Auto-hide error after 3 seconds
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  formatFileSize(fileSize: string): string {
    return this.fileService.formatSize(fileSize);
  }

  getFileTypeLabel(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'Archive';
    if (mimeType.includes('text/')) return 'Text';
    return 'Document';
  }

  getTypeCount(typePrefix: string): number {
    return this.files.filter(f => f.fileType.startsWith(typePrefix)).length;
  }

  getDocumentCount(): number {
    return this.files.filter(f => 
      f.fileType.includes('pdf') || 
      f.fileType.includes('word') || 
      f.fileType.includes('excel') ||
      f.fileType.includes('text/')
    ).length;
  }

  getFileBackground(file: FileEntity): string {
    if (this.fileService.isImage(file.fileType)) {
      return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    }
    if (this.fileService.isVideo(file.fileType)) {
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
    }
    if (this.fileService.isAudio(file.fileType)) {
      return 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)';
    }
    if (file.fileType.includes('pdf')) {
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
    }
    if (file.fileType.includes('word')) {
      return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
    }
    if (file.fileType.includes('excel')) {
      return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    }
    if (file.fileType.includes('zip')) {
      return 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
    }
    return 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)';
  }

  extractUploaderId(file: FileEntity): string {
    // Extract user ID from file path or metadata
    // This is a placeholder - you might need to get this from the actual file data
    return file.id.toString().substring(0, 4);
  }

  getImageDimensions(file: FileEntity): string {
    // Placeholder for image dimensions
    // You might want to store these in the backend
    return 'JPEG';
  }
}