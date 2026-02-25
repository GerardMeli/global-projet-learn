import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatParticipantService } from '../../../core/services/chat/chat-participant.service';
import { ChatRoomService } from '../../../core/services/chat/chat-room.service';
import { MessageService } from '../../../core/services/chat/message.service';
import { FileManagerService } from '../../../core/services/file/file.service';
import { StatisticsService } from '../../../core/services/users/statistics.service';
import { TokenService } from '../../../core/services/users/token.service';

interface SystemStats {
  // User stats
  users: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    blocked: number;
    deleted: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  // Chat stats
  chat: {
    totalRooms: number;
    publicRooms: number;
    privateRooms: number;
    totalParticipants: number;
    totalMessages: number;
    totalFiles: number;
    totalConversations: number;
  };
  // Activity stats
  activity: {
    messagesLast24h: number;
    filesUploadedLast24h: number;
    newUsersLast24h: number;
    activeChatsLast24h: number;
  };
  // File stats
  files: {
    totalSize: string;
    byType: { type: string; count: number; size: string }[];
  };
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.scss']
})
export class StatisticsComponent implements OnInit {
  stats: SystemStats | null = null;
  loading = true;
  error = '';

  constructor(
    private statisticsService: StatisticsService,
    private chatRoomService: ChatRoomService,
    private chatParticipantService: ChatParticipantService,
    private messageService: MessageService,
    private fileService: FileManagerService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadAllStatistics();
  }

  loadAllStatistics(): void {
    this.loading = true;
    this.error = '';

    // Load all statistics in parallel
    forkJoin({
      userStats: this.statisticsService.getUserStatistics().pipe(
        catchError(err => {
          console.error('Error loading user stats:', err);
          return of(null);
        })
      ),
      userActivity: this.statisticsService.getUserActivity().pipe(
        catchError(err => {
          console.error('Error loading user activity:', err);
          return of([]);
        })
      ),
      publicRooms: this.chatRoomService.getPublic().pipe(
        catchError(err => {
          console.error('Error loading public rooms:', err);
          return of([]);
        })
      ),
      privateRooms: this.chatRoomService.getPrivate().pipe(
        catchError(err => {
          console.error('Error loading private rooms:', err);
          return of([]);
        })
      ),
      participants: this.chatParticipantService.getAll().pipe(
        catchError(err => {
          console.error('Error loading participants:', err);
          return of([]);
        })
      ),
      fileStats: this.fileService.getStats().pipe(
        catchError(err => {
          console.error('Error loading file stats:', err);
          return of(null);
        })
      ),
      allRooms: this.chatRoomService.getAll().pipe(
        catchError(err => {
          console.error('Error loading all rooms:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        this.processStatistics(results);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.error = 'Failed to load system statistics';
        this.loading = false;
      }
    });
  }

  private processStatistics(results: any): void {
    const userStats = results.userStats;
    const userActivity = results.userActivity;
    const publicRooms = results.publicRooms || [];
    const privateRooms = results.privateRooms || [];
    const participants = results.participants || [];
    const fileStats = results.fileStats;
    const allRooms = results.allRooms || [];

    // Calculate message counts (estimated from participants or use 0 if not available)
    const totalMessages = participants.reduce((sum: number, p: any) => 
      sum + (p.messageCount || 0), 0);

    // Calculate files in chat
    const totalChatFiles = participants.reduce((sum: number, p: any) => 
      sum + (p.fileCount || 0), 0);

    // Process file stats
    let fileTypeBreakdown: { type: string; count: number; size: string }[] = [];
    let totalFileSize = 0;

    if (fileStats && fileStats.files) {
      // Group files by type
      const typeMap = new Map<string, { count: number; size: number }>();
      
      fileStats.files.forEach((file: any) => {
        const type = file.fileType || 'application/octet-stream';
        const size = parseInt(file.fileSize || '0', 10);
        
        if (!typeMap.has(type)) {
          typeMap.set(type, { count: 0, size: 0 });
        }
        
        const current = typeMap.get(type)!;
        current.count++;
        current.size += size;
        totalFileSize += size;
      });

      // Convert to array and format sizes
      fileTypeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        count: data.count,
        size: this.formatBytes(data.size)
      }));
    }

    // Build comprehensive stats object
    this.stats = {
      users: {
        total: userStats?.totalUsers || 0,
        active: userStats?.activeUsers || 0,
        pending: userStats?.pendingVerification || 0,
        suspended: userStats?.suspendedUsers || 0,
        blocked: userStats?.blockedUsers || 0,
        deleted: userStats?.deletedUsers || 0,
        newLast7Days: userStats?.newUsersLast7Days || 0,
        newLast30Days: userStats?.newUsersLast30Days || 0
      },
      chat: {
        totalRooms: allRooms.length,
        publicRooms: publicRooms.length,
        privateRooms: privateRooms.length,
        totalParticipants: participants.length,
        totalMessages: totalMessages,
        totalFiles: totalChatFiles,
        totalConversations: privateRooms.length // Using private rooms as conversations
      },
      activity: {
        messagesLast24h: this.calculateLast24hMessages(userActivity, participants),
        filesUploadedLast24h: this.calculateLast24hFiles(fileStats),
        newUsersLast24h: this.calculateNewUsersLast24h(userActivity),
        activeChatsLast24h: this.calculateActiveChatsLast24h(userActivity)
      },
      files: {
        totalSize: this.formatBytes(totalFileSize),
        byType: fileTypeBreakdown
      }
    };
  }

  private calculateLast24hMessages(activity: any[], participants: any[]): number {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    // This is an estimate - in real implementation, you'd have message timestamps
    return Math.floor(participants.length * 0.3); // Placeholder
  }

  private calculateLast24hFiles(fileStats: any): number {
    if (!fileStats || !fileStats.files) return 0;
    
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    return fileStats.files.filter((file: any) => {
      const uploadDate = new Date(file.uploadDate || file.createdAt || 0);
      return uploadDate > oneDayAgo;
    }).length;
  }

  private calculateNewUsersLast24h(activity: any[]): number {
    if (!activity) return 0;
    
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    return activity.filter((user: any) => {
      const createdDate = new Date(user.createdAt || user.joinedDate || 0);
      return createdDate > oneDayAgo;
    }).length;
  }

  private calculateActiveChatsLast24h(activity: any[]): number {
    // This would need actual last activity timestamps
    return Math.floor((this.stats?.chat.totalRooms || 0) * 0.2); // Estimate: 20% of rooms active
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileTypeName(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image',
      'image/webp': 'WebP Image',
      'application/pdf': 'PDF Document',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'application/zip': 'ZIP Archive',
      'text/plain': 'Text File',
      'video/mp4': 'MP4 Video',
      'audio/mpeg': 'MP3 Audio',
      'audio/wav': 'WAV Audio'
    };

    return typeMap[mimeType] || mimeType.split('/').pop()?.toUpperCase() || 'File';
  }
}