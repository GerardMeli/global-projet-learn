// admin-files.component.ts
import {
  Component, OnInit, OnDestroy, HostListener,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize, forkJoin } from 'rxjs';

import { FileEntity, FileStatsResponse } from '../../../core/models/file/file.model';
import { FileManagerService }            from '../../../core/services/file/file.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number; type: ToastType; title: string; text?: string; leaving?: boolean;
}

@Component({
  selector: 'app-admin-files',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './files-management.html',
  styleUrls: ['./files-management.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFilesComponent implements OnInit, OnDestroy {

  // ── Données ────────────────────────────────────────────────────────────
  stats:          FileStatsResponse | null = null;
  files:          FileEntity[] = [];
  filteredFiles:  FileEntity[] = [];
  paginatedFiles: FileEntity[] = [];

  // ── Filtres ────────────────────────────────────────────────────────────
  searchTerm  = '';
  typeFilter  = '';
  private readonly search$ = new Subject<string>();

  // ── Pagination ─────────────────────────────────────────────────────────
  currentPage = 1;
  pageSize    = 12;
  totalPages  = 1;
  readonly pageSizeOptions = [12, 24, 48];

  // ── États ──────────────────────────────────────────────────────────────
  loading  = false;
  deleting = false;

  // ── Modal ──────────────────────────────────────────────────────────────
  showDeleteModal = false;
  fileToDelete:   FileEntity | null = null;

  // ── Stats getters ──────────────────────────────────────────────────────
  get totalCount():   number { return this.stats?.data?.totalFiles || 0; }
  get totalSize():    string { return this.stats?.data?.totalSizeMB ? `${this.stats.data.totalSizeMB} MB` : '0 MB'; }
  get imageCount():   number { return this.files.filter(f => f.fileType.startsWith('image/')).length; }
  get docCount():     number {
    return this.files.filter(f =>
      f.fileType.includes('pdf') || f.fileType.includes('word') ||
      f.fileType.includes('excel') || f.fileType.startsWith('text/')
    ).length;
  }
  get hasActiveFilters(): boolean { return !!(this.searchTerm || this.typeFilter); }
  readonly Math = Math;

  // ── Toasts ─────────────────────────────────────────────────────────────
  toasts: Toast[] = [];
  private tid = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public  readonly fileService: FileManagerService,
    private readonly cdr:         ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.search$.pipe(debounceTime(250), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
    this.loadData();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.closeModal(); }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  loadData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    forkJoin({
      stats: this.fileService.getStats(),
      files: this.fileService.getAll(),
    })
    .pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
    .subscribe({
      next: ({ stats, files }) => {
        this.stats = stats;
        this.files = files.data || [];
        this.applyFilters();
        this.pushToast('success', 'Chargé', `${this.files.length} fichier(s) chargé(s).`);
      },
      error: () => this.pushToast('error', 'Erreur', 'Impossible de charger les fichiers.'),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRES — réactifs
  // ═══════════════════════════════════════════════════════════════════════════

  onSearchInput(): void { this.search$.next(this.searchTerm); }
  onFilterChange():void { this.applyFilters(); }

  applyFilters(): void {
    const q = this.searchTerm.toLowerCase();
    this.filteredFiles = this.files.filter(f => {
      const name  = (f.originalFileName || f.fileName).toLowerCase();
      const desc  = (f.description || '').toLowerCase();
      const matchSearch = !q || name.includes(q) || desc.includes(q);
      const matchType   = !this.typeFilter ||
        f.fileType.startsWith(this.typeFilter) || f.fileType === this.typeFilter;
      return matchSearch && matchType;
    });
    // Trier du plus récent au plus ancien
    this.filteredFiles.sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime());
    this.totalPages  = Math.max(1, Math.ceil(this.filteredFiles.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  updatePage(): void {
    const s = (this.currentPage - 1) * this.pageSize;
    this.paginatedFiles = this.filteredFiles.slice(s, s + this.pageSize);
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
    this.cdr.markForCheck();
  }

  onPageSizeChange(): void {
    this.totalPages  = Math.max(1, Math.ceil(this.filteredFiles.length / this.pageSize));
    this.currentPage = 1;
    this.updatePage();
    this.cdr.markForCheck();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  MODAL & SUPPRESSION
  // ═══════════════════════════════════════════════════════════════════════════

  openDelete(f: FileEntity): void { this.fileToDelete = f; this.showDeleteModal = true; this.cdr.markForCheck(); }
  closeModal(): void { this.showDeleteModal = false; this.fileToDelete = null; this.cdr.markForCheck(); }

  confirmDelete(): void {
    if (!this.fileToDelete) return;
    this.deleting = true;
    this.cdr.markForCheck();

    const name = this.fileToDelete.originalFileName || this.fileToDelete.fileName;
    this.fileService.delete(this.fileToDelete.id)
      .pipe(takeUntil(this.destroy$), finalize(() => { this.deleting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          this.files = this.files.filter(f => f.id !== this.fileToDelete!.id);
          this.applyFilters(); this.closeModal();
          this.pushToast('success', 'Supprimé', `« ${name} » supprimé.`);
        },
        error: () => { this.closeModal(); this.pushToast('error', 'Erreur', 'Impossible de supprimer le fichier.'); },
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  TÉLÉCHARGEMENT
  // ═══════════════════════════════════════════════════════════════════════════

  downloadFile(f: FileEntity): void {
    this.fileService.download(f.fileName).pipe(takeUntil(this.destroy$)).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href = url; a.download = f.originalFileName || f.fileName;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
        this.pushToast('success', 'Téléchargement', `« ${f.originalFileName || f.fileName} » téléchargé.`);
      },
      error: () => this.pushToast('error', 'Erreur', 'Impossible de télécharger ce fichier.'),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS VISUELS
  // ═══════════════════════════════════════════════════════════════════════════

  getFileTypeLabel(mime: string): string {
    if (mime.startsWith('image/'))  return 'Image';
    if (mime.startsWith('video/'))  return 'Vidéo';
    if (mime.startsWith('audio/'))  return 'Audio';
    if (mime.includes('pdf'))       return 'PDF';
    if (mime.includes('word') || mime.includes('document')) return 'Word';
    if (mime.includes('excel') || mime.includes('spreadsheet')) return 'Excel';
    if (mime.includes('zip') || mime.includes('compressed')) return 'Archive';
    if (mime.startsWith('text/'))   return 'Texte';
    return 'Document';
  }

  getFileBg(f: FileEntity): string {
    const t = f.fileType;
    if (this.fileService.isImage(t)) return 'linear-gradient(135deg,#d97706,#fbbf24)';
    if (this.fileService.isVideo(t)) return 'linear-gradient(135deg,#dc2626,#f87171)';
    if (this.fileService.isAudio(t)) return 'linear-gradient(135deg,#7c3aed,#a78bfa)';
    if (t.includes('pdf'))   return 'linear-gradient(135deg,#dc2626,#f87171)';
    if (t.includes('word'))  return 'linear-gradient(135deg,#2563eb,#60a5fa)';
    if (t.includes('excel')) return 'linear-gradient(135deg,#16a34a,#4ade80)';
    if (t.includes('zip'))   return 'linear-gradient(135deg,#475569,#94a3b8)';
    return 'linear-gradient(135deg,#334155,#64748b)';
  }

  formatSize(s: string): string { return this.fileService.formatSize(s); }

  // ── Toasts ─────────────────────────────────────────────────────────────────
  pushToast(type: ToastType, title: string, text?: string, dur = 4500): void {
    const id = ++this.tid;
    this.toasts = [...this.toasts, { id, type, title, text }];
    this.cdr.markForCheck();
    setTimeout(() => this.dismissToast(id), dur);
  }
  dismissToast(id: number): void {
    this.toasts = this.toasts.map(t => t.id === id ? { ...t, leaving: true } : t);
    this.cdr.markForCheck();
    setTimeout(() => { this.toasts = this.toasts.filter(t => t.id !== id); this.cdr.markForCheck(); }, 360);
  }
  toastIcon(t: ToastType): string { return { success:'✅',error:'❌',warning:'⚠️',info:'ℹ️' }[t]; }
  trackByToast(_: number, t: Toast): number { return t.id; }
  trackByFile(_: number, f: FileEntity): number { return f.id; }
}