// ─── FileEntity shape (mirrored from FileEntity.kt) ──────────────────────────
// Note: fileSize is a STRING in the backend ("123456"), not a number.

export interface FileEntity {
  id: number;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: string;         // stored as String in DB — parse with parseInt() when needed
  filePath: string;
  uploadTime: string;       // LocalDateTime serialised as ISO string
  description: string;
}

// ─── Wrapper shapes returned by WebController ─────────────────────────────────
// All endpoints return Map<String,Any> → typed here for safety

export interface FileListResponse {
  success: boolean;
  message: string;
  data: FileEntity[];
  count: number;
}

export interface FileSingleResponse {
  success: boolean;
  message: string;
  data: FileEntity;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: FileEntity;
}

export interface FileDeleteResponse {
  success: boolean;
  message: string;
  deletedFile: FileEntity;
}

export interface FileSearchResponse {
  success: boolean;
  message: string;
  query: string;
  data: FileEntity[];
  count: number;
}

export interface FileStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeMB: string;       // formatted as "12.34"
    fileTypeDistribution: Record<string, number>;
  };
}

// ─── Upload state ─────────────────────────────────────────────────────────────

export interface UploadProgress {
  file: File;
  progress: number;          // 0-100
  status: 'pending' | 'uploading' | 'done' | 'error';
  result?: FileEntity;
  error?: string;
}