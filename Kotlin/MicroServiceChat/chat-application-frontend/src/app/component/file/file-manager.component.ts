import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs'; 
import { FileEntity, FileStatsResponse, UploadProgress } from '../../core/models/file/file.model';
import { FileManagerService } from '../../core/services/file/file.model';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
<div class="fm-shell">
  <!-- Sidebar -->
  <aside class="fm-sidebar">
    <div class="sidebar-header">
      <a routerLink="/profile" class="back-link">← Back</a>
      <div class="sidebar-brand">
        <span>📁</span>
        <span>Files</span>
      </div>
    </div>

    <!-- Stats card -->
    <div class="stats-card" *ngIf="stats">
      <div class="stat-row">
        <span>Total files</span>
        <strong>{{ stats.data.totalFiles }}</strong>
      </div>
      <div class="stat-row">
        <span>Storage used</span>
        <strong>{{ stats.data.totalSizeMB }} MB</strong>
      </div>
      <div class="storage-bar">
        <div class="storage-fill" [style.width]="storagePercent + '%'"></div>
      </div>
    </div>

    <!-- Type filter -->
    <div class="filter-section" *ngIf="typeDistribution.length > 0">
      <div class="filter-label">File types</div>
      <button class="type-filter-btn" [class.active]="activeType === ''"
              (click)="activeType = ''; applyFilters()">
        All
      </button>
      <button *ngFor="let t of typeDistribution"
              class="type-filter-btn" [class.active]="activeType === t.type"
              (click)="activeType = t.type; applyFilters()">
        {{ getIcon(t.type) }} {{ shortType(t.type) }}
        <span class="type-count">{{ t.count }}</span>
      </button>
    </div>
  </aside>

  <!-- Main -->
  <main class="fm-main">
    <!-- Top bar -->
    <div class="fm-topbar">
      <div class="search-group">
        <input class="search-input" type="text" placeholder="Search files…"
               [formControl]="searchControl" />
        <span class="search-icon">🔍</span>
      </div>

      <div class="topbar-actions">
        <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode='grid'">⊞</button>
        <button class="view-btn" [class.active]="viewMode === 'list'" (click)="viewMode='list'">☰</button>
        <label class="btn btn--primary upload-label">
          <input type="file" multiple style="display:none" (change)="onFilesSelected($event)" />
          ⬆ Upload
        </label>
      </div>
    </div>

    <!-- Upload queue -->
    <div class="upload-queue" *ngIf="uploadQueue.length > 0">
      <div class="queue-item" *ngFor="let u of uploadQueue">
        <span class="queue-icon">{{ getIcon(u.file.type) }}</span>
        <div class="queue-info">
          <div class="queue-name">{{ u.file.name }}</div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width]="u.progress + '%'"
                 [class.done]="u.status === 'done'"
                 [class.error]="u.status === 'error'"></div>
          </div>
        </div>
        <span class="queue-status">
          {{ u.status === 'done' ? '✓' : u.status === 'error' ? '✗' : u.progress + '%' }}
        </span>
      </div>
    </div>

    <!-- Edit description modal -->
    <div class="modal-backdrop" *ngIf="editingFile" (click)="editingFile = null">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3>Edit description</h3>
        <p class="modal-filename">{{ editingFile.fileName }}</p>
        <textarea class="desc-textarea" [formControl]="editDescControl"
                  placeholder="Add a description…" rows="3"></textarea>
        <div class="modal-actions">
          <button class="btn btn--ghost" (click)="editingFile = null">Cancel</button>
          <button class="btn btn--primary" [disabled]="savingDesc" (click)="saveDescription()">
            {{ savingDesc ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div class="modal-backdrop" *ngIf="deletingFile" (click)="deletingFile = null">
      <div class="modal-box modal-box--danger" (click)="$event.stopPropagation()">
        <h3>Delete file?</h3>
        <p>This will permanently delete <strong>{{ deletingFile.fileName }}</strong> from the server.</p>
        <div class="modal-actions">
          <button class="btn btn--ghost" (click)="deletingFile = null">Cancel</button>
          <button class="btn btn--danger" [disabled]="deleting" (click)="confirmDelete()">
            {{ deleting ? 'Deleting…' : 'Delete permanently' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="loading">
      <div class="spinner-lg"></div>
      <span>Loading files…</span>
    </div>

    <!-- Empty state -->
    <div class="empty-state" *ngIf="!loading && filtered.length === 0">
      <div class="empty-icon">📂</div>
      <h3>No files found</h3>
      <p>{{ searchControl.value ? 'Try a different search.' : 'Upload your first file to get started.' }}</p>
    </div>

    <!-- Grid view -->
    <div class="file-grid" *ngIf="!loading && filtered.length > 0 && viewMode === 'grid'">
      <div class="file-card" *ngFor="let f of filtered">
        <div class="file-card-icon">{{ getIcon(f.fileType) }}</div>
        <div class="file-card-name" title="{{ f.originalFileName }}">{{ f.originalFileName }}</div>
        <div class="file-card-meta">
          <span>{{ formatSize(f.fileSize) }}</span>
          <span>{{ f.uploadTime | date:'dd/MM/yy' }}</span>
        </div>
        <div class="file-card-desc" *ngIf="f.description">{{ f.description }}</div>
        <div class="file-card-actions">
          <button class="action-btn" title="Download" (click)="downloadFile(f)">⬇</button>
          <button class="action-btn" title="Edit description" (click)="startEdit(f)">✏️</button>
          <button class="action-btn action-btn--danger" title="Delete" (click)="startDelete(f)">🗑</button>
        </div>
      </div>
    </div>

    <!-- List view -->
    <div class="file-list" *ngIf="!loading && filtered.length > 0 && viewMode === 'list'">
      <div class="list-header">
        <span>File</span><span>Type</span><span>Size</span><span>Uploaded</span><span>Actions</span>
      </div>
      <div class="list-row" *ngFor="let f of filtered">
        <span class="list-name">
          <span class="list-icon">{{ getIcon(f.fileType) }}</span>
          {{ f.originalFileName }}
        </span>
        <span class="list-type">{{ shortType(f.fileType) }}</span>
        <span class="list-size">{{ formatSize(f.fileSize) }}</span>
        <span class="list-date">{{ f.uploadTime | date:'dd/MM/yyyy HH:mm' }}</span>
        <span class="list-actions">
          <button class="action-btn" title="Download" (click)="downloadFile(f)">⬇</button>
          <button class="action-btn" title="Edit description" (click)="startEdit(f)">✏️</button>
          <button class="action-btn action-btn--danger" title="Delete" (click)="startDelete(f)">🗑</button>
        </span>
      </div>
    </div>
  </main>
</div>
  `,
  styles: [`
    .fm-shell { display: flex; height: 100vh; background: var(--color-bg); overflow: hidden; }

    /* ── Sidebar ── */
    .fm-sidebar { width: 240px; min-width: 240px; background: #0f172a;
                  display: flex; flex-direction: column; padding: 0; overflow-y: auto; }
    .sidebar-header { padding: 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .back-link { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; display: block;
                 margin-bottom: 10px; &:hover { color: rgba(255,255,255,0.7); } }
    .sidebar-brand { display: flex; align-items: center; gap: 8px; color: white;
                     font-weight: 600; font-size: 17px; }

    .stats-card { margin: 12px; padding: 14px; background: rgba(255,255,255,0.06);
                  border-radius: 10px; }
    .stat-row { display: flex; justify-content: space-between; font-size: 13px;
                color: rgba(255,255,255,0.6); margin-bottom: 6px;
                strong { color: white; } }
    .storage-bar { height: 4px; background: rgba(255,255,255,0.12); border-radius: 2px; margin-top: 6px; }
    .storage-fill { height: 100%; background: var(--color-primary); border-radius: 2px;
                    transition: width 0.5s ease; }

    .filter-section { padding: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
    .filter-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
                    color: rgba(255,255,255,0.3); margin-bottom: 8px; }
    .type-filter-btn { width: 100%; text-align: left; padding: 7px 10px; border: none;
                       background: none; color: rgba(255,255,255,0.55); font-size: 13px;
                       border-radius: 7px; cursor: pointer; display: flex; align-items: center;
                       gap: 6px; transition: var(--transition);
                       &:hover { background: rgba(255,255,255,0.06); color: white; }
                       &.active { background: rgba(76,175,80,0.2); color: #4ade80; }
    }
    .type-count { margin-left: auto; font-size: 11px; background: rgba(255,255,255,0.1);
                  padding: 1px 6px; border-radius: 8px; }

    /* ── Main ── */
    .fm-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .fm-topbar { display: flex; align-items: center; gap: 12px; padding: 16px 20px;
                 background: white; border-bottom: 1px solid var(--color-border); }
    .search-group { flex: 1; position: relative;
      .search-input { width: 100%; padding: 10px 36px 10px 14px; border: 1.5px solid var(--color-border);
                      border-radius: 10px; font-size: 14px;
                      &:focus { outline: none; border-color: var(--color-primary); } }
      .search-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                     font-size: 16px; }
    }
    .topbar-actions { display: flex; align-items: center; gap: 8px; }
    .view-btn { background: none; border: 1px solid var(--color-border); border-radius: 7px;
                padding: 7px 10px; cursor: pointer; font-size: 16px; transition: var(--transition);
                &.active { background: var(--color-primary); color: white; border-color: var(--color-primary); } }
    .upload-label { cursor: pointer; padding: 10px 18px; font-size: 13px; white-space: nowrap; }

    /* ── Upload queue ── */
    .upload-queue { padding: 10px 20px; background: var(--color-surface-alt);
                    border-bottom: 1px solid var(--color-border); display: flex; flex-direction: column; gap: 6px; }
    .queue-item { display: flex; align-items: center; gap: 10px; }
    .queue-icon { font-size: 20px; }
    .queue-info { flex: 1; }
    .queue-name { font-size: 13px; font-weight: 500; margin-bottom: 3px; }
    .progress-bar { height: 4px; background: var(--color-border); border-radius: 2px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--color-primary); border-radius: 2px; transition: width 0.2s;
                     &.done { background: var(--color-success); }
                     &.error { background: var(--color-danger); } }
    .queue-status { font-size: 13px; font-weight: 600; min-width: 32px; text-align: center; }

    /* ── Modals ── */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5);
                      display: flex; align-items: center; justify-content: center; z-index: 200; }
    .modal-box { background: white; border-radius: var(--radius-lg); padding: 28px;
                 width: 400px; max-width: 90vw;
                 h3 { margin-bottom: 12px; font-size: 18px; }
                 &--danger h3 { color: var(--color-danger); } }
    .modal-filename { font-size: 13px; color: var(--color-text-muted); margin-bottom: 14px;
                      word-break: break-all; }
    .desc-textarea { width: 100%; padding: 10px; border: 1.5px solid var(--color-border);
                     border-radius: 8px; font-size: 14px; resize: vertical;
                     &:focus { outline: none; border-color: var(--color-primary); } }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

    /* ── States ── */
    .loading-state { display: flex; flex-direction: column; align-items: center;
                     gap: 12px; margin: auto; color: var(--color-text-muted); padding: 60px; }
    .spinner-lg { width: 36px; height: 36px; border: 3px solid var(--color-border);
                  border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { display: flex; flex-direction: column; align-items: center; margin: auto;
                   text-align: center; padding: 60px; color: var(--color-text-muted);
                   h3 { margin-bottom: 6px; color: var(--color-text); } }
    .empty-icon { font-size: 56px; margin-bottom: 12px; }

    /* ── Grid view ── */
    .file-grid { flex: 1; overflow-y: auto; display: grid; padding: 20px;
                 grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px;
                 align-content: start; }
    .file-card { background: white; border-radius: var(--radius-md); padding: 16px;
                 box-shadow: var(--shadow-card); display: flex; flex-direction: column;
                 gap: 6px; transition: var(--transition);
                 &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); } }
    .file-card-icon { font-size: 36px; }
    .file-card-name { font-size: 13px; font-weight: 500; word-break: break-word; line-height: 1.3; }
    .file-card-meta { display: flex; justify-content: space-between; font-size: 11px;
                      color: var(--color-text-muted); }
    .file-card-desc { font-size: 11px; color: var(--color-text-muted); font-style: italic;
                      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-card-actions { display: flex; gap: 4px; margin-top: 6px; }

    /* ── List view ── */
    .file-list { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 0; }
    .list-header { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr;
                   padding: 8px 12px; font-size: 11px; text-transform: uppercase;
                   letter-spacing: 0.06em; color: var(--color-text-muted); font-weight: 600;
                   border-bottom: 1px solid var(--color-border); }
    .list-row { display: grid; grid-template-columns: 3fr 1fr 1fr 2fr 1fr;
                padding: 12px 12px; font-size: 14px; border-bottom: 1px solid var(--color-border);
                align-items: center; transition: var(--transition);
                &:hover { background: var(--color-surface-alt); } }
    .list-name { display: flex; align-items: center; gap: 8px; font-weight: 500;
                 overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .list-icon { font-size: 18px; flex-shrink: 0; }
    .list-type,.list-size,.list-date { font-size: 13px; color: var(--color-text-muted); }
    .list-actions { display: flex; gap: 4px; }

    /* ── Action buttons ── */
    .action-btn { background: none; border: 1px solid var(--color-border); border-radius: 6px;
                  padding: 4px 8px; font-size: 14px; cursor: pointer; transition: var(--transition);
                  &:hover { background: var(--color-surface-alt); border-color: var(--color-text-muted); }
                  &--danger:hover { background: #fef2f2; border-color: var(--color-danger);
                                    color: var(--color-danger); } }
  `]
})
export class FileManagerComponent implements OnInit {
  files: FileEntity[] = [];
  filtered: FileEntity[] = [];
  stats: FileStatsResponse | null = null;
  loading = true;
  viewMode: 'grid' | 'list' = 'grid';
  activeType = '';
  storagePercent = 0;

  uploadQueue: UploadProgress[] = [];
  editingFile: FileEntity | null = null;
  deletingFile: FileEntity | null = null;
  savingDesc = false;
  deleting = false;

  searchControl = new FormControl('');
  editDescControl = new FormControl('');

  typeDistribution: { type: string; count: number }[] = [];

  constructor(private fileService: FileManagerService) {}

  ngOnInit(): void {
    this.loadFiles();
    this.loadStats();
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
  }

  loadFiles(): void {
    this.fileService.getAll().subscribe({
      next: (r) => {
        this.files = r.data;
        this.applyFilters();
        this.buildTypeDistribution();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadStats(): void {
    this.fileService.getStats().subscribe({
      next: (s) => {
        this.stats = s;
        // Show bar as % of 500 MB cap (arbitrary visual reference)
        const mb = parseFloat(s.data.totalSizeMB);
        this.storagePercent = Math.min(100, Math.round((mb / 500) * 100));
      }
    });
  }

  applyFilters(): void {
    const q = (this.searchControl.value ?? '').toLowerCase();
    this.filtered = this.files.filter(f => {
      const matchesSearch = !q || f.originalFileName.toLowerCase().includes(q)
                            || f.description.toLowerCase().includes(q);
      const matchesType = !this.activeType || f.fileType === this.activeType;
      return matchesSearch && matchesType;
    });
  }

  buildTypeDistribution(): void {
    const map = new Map<string, number>();
    this.files.forEach(f => map.set(f.fileType, (map.get(f.fileType) ?? 0) + 1));
    this.typeDistribution = Array.from(map.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    files.forEach(file => {
      const progress: UploadProgress = { file, progress: 0, status: 'pending' };
      this.uploadQueue = [...this.uploadQueue, progress];

      this.fileService.uploadWithProgress(file).subscribe({
        next: (e) => {
          progress.progress = e.progress;
          if (e.result?.data) {
            progress.status = 'done';
            progress.result = e.result.data;
            this.files = [e.result.data, ...this.files];
            this.applyFilters();
            this.buildTypeDistribution();
            this.loadStats();
            // Clear queue item after 3s
            setTimeout(() => {
              this.uploadQueue = this.uploadQueue.filter(u => u !== progress);
            }, 3000);
          }
        },
        error: () => { progress.status = 'error'; }
      });
    });

    input.value = '';
  }

  downloadFile(f: FileEntity): void {
    this.fileService.download(f.fileName).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.originalFileName;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  startEdit(f: FileEntity): void {
    this.editingFile = f;
    this.editDescControl.setValue(f.description);
  }

  saveDescription(): void {
    if (!this.editingFile) return;
    this.savingDesc = true;
    this.fileService.updateDescription(this.editingFile.id, this.editDescControl.value ?? '').subscribe({
      next: (r) => {
        const idx = this.files.findIndex(f => f.id === this.editingFile!.id);
        if (idx >= 0) { this.files[idx] = r.data; this.applyFilters(); }
        this.savingDesc = false;
        this.editingFile = null;
      },
      error: () => this.savingDesc = false
    });
  }

  startDelete(f: FileEntity): void {
    this.deletingFile = f;
  }

  confirmDelete(): void {
    if (!this.deletingFile) return;
    this.deleting = true;
    this.fileService.delete(this.deletingFile.id).subscribe({
      next: () => {
        this.files = this.files.filter(f => f.id !== this.deletingFile!.id);
        this.applyFilters();
        this.buildTypeDistribution();
        this.loadStats();
        this.deleting = false;
        this.deletingFile = null;
      },
      error: () => this.deleting = false
    });
  }

  getIcon(type: string): string { return this.fileService.getFileIcon(type); }
  formatSize(s: string): string { return this.fileService.formatSize(s); }
  shortType(t: string): string { return t.split('/').pop() ?? t; }
}