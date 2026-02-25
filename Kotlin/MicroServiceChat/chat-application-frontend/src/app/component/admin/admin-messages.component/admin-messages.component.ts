// admin-messages.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MessageResponse } from '../../../core/models/chat/message.model';
import { PrivateChatResponse } from '../../../core/models/chat/private-chat.model';
import { MessageService } from '../../../core/services/chat/message.service';
import { ChatRoomService } from '../../../core/services/chat/chat-room.service';
import { PrivateChatService } from '../../../core/services/chat/private-chat.service';
import { TokenService } from '../../../core/services/users/token.service';

// Extended message model to include room name and receiver info for private messages
interface ExtendedMessage extends MessageResponse {
  roomName?: string;
  receiverId?: number;
  receiverName?: string;
  senderName?: string;
  isPrivate?: boolean;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-messages.html',
  styleUrls: ['./admin-messages.component.scss']
})
export class AdminMessagesComponent implements OnInit {
  messages: ExtendedMessage[] = [];
  filteredMessages: ExtendedMessage[] = [];
  paginatedMessages: ExtendedMessage[] = [];
  
  searchTerm = '';
  roomFilter = '';
  messageTypeFilter = 'all'; // 'all', 'group', 'private'
  
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  
  loading = false;
  error = '';
  
  messageToDelete: ExtendedMessage | null = null;
  permanentDelete = false;

  Math = Math;

  get uniqueRoomIds(): (number | string)[] {
    const roomIds = new Set<number | string>();
    this.messages.forEach(m => {
      if (m.isPrivate) {
        roomIds.add(`private-${m.id}`);
      } else {
        roomIds.add(m.roomId);
      }
    });
    return Array.from(roomIds);
  }

  get messagesWithFiles(): number {
    return this.messages.filter(m => !!m.fileUrl).length;
  }

  get deletedMessages(): number {
    return this.messages.filter(m => m.isDeleted === true).length;
  }

  get groupMessages(): number {
    return this.messages.filter(m => !m.isPrivate).length;
  }

  get privateMessages(): number {
    return this.messages.filter(m => m.isPrivate).length;
  }

  constructor(
    private messageService: MessageService,
    private chatRoomService: ChatRoomService,
    private privateChatService: PrivateChatService,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.error = '';

    // Load both group messages and private messages
    forkJoin([
      this.loadGroupMessages(),
      this.loadPrivateMessages()
    ]).subscribe({
      next: (results) => {
        const groupMessages = results[0];
        const privateMessages = results[1];
        
        this.messages = [...groupMessages, ...privateMessages];
        this.filterMessages();
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load messages', error);
        this.error = 'Failed to load messages';
        this.loading = false;
      }
    });
  }

  private loadGroupMessages(): Observable<ExtendedMessage[]> {
    return this.chatRoomService.getAll().pipe(
      switchMap(rooms => {
        if (rooms.length === 0) {
          return of([]);
        }

        // Load messages from all rooms with room names
        const messageRequests = rooms.map(room =>
          this.messageService.getByRoom(room.id).pipe(
            map(messages =>
              messages.map(msg => ({
                ...msg,
                roomName: room.name,
                senderName: msg.sender?.email || `User #${msg.sender?.id}`,
                isPrivate: false
              } as ExtendedMessage))
            )
          )
        );

        return messageRequests.length > 0
          ? forkJoin(messageRequests).pipe(map(results => results.flat()))
          : of([]);
      })
    );
  }

  private loadPrivateMessages(): Observable<ExtendedMessage[]> {
    const currentUserId = this.tokenService.getCurrentUserId();
    
    if (!currentUserId) {
      return of([]);
    }

    // Get all private chats for current user
    return this.privateChatService.getUserChats(currentUserId).pipe(
      map(chats => {
        // Convert PrivateChatResponse to ExtendedMessage format
        // Note: Private messages don't have the same structure as group messages
        // We'll create a simplified representation
        
        return chats.map(chat => {
          // Determine sender and receiver
          const senderName = chat.senderId1 === currentUserId ? chat.senderName1 : chat.senderName2;
          const receiverName = chat.senderId1 === currentUserId ? chat.senderName2 : chat.senderName1;
          const receiverId = chat.senderId1 === currentUserId ? chat.senderId2 : chat.senderId1;
          const senderId = currentUserId;

          return {
            id: chat.id,
            content: chat.content,
            sender: { id: senderId, email: senderName },
            senderId: senderId,
            senderName: senderName,
            receiverId: receiverId,
            receiverName: receiverName,
            roomId: 0, // Not applicable for private messages
            timestamp: chat.timestamp,
            createdAt: chat.timestamp,
            chatRoomId: 0,
            messageType: 'TEXT' as any,
            isDeleted: false,
            fileUrl: null,
            fileName: null,
            isPrivate: true
          } as ExtendedMessage;
        });
      })
    );
  }

  filterMessages(): void {
    this.filteredMessages = this.messages.filter(message => {
      const matchesSearch = !this.searchTerm || 
        message.content?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        message.senderName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        message.receiverName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        message.roomName?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesRoom = !this.roomFilter || (
        (message.isPrivate && this.roomFilter === `private-${message.id}`) ||
        (!message.isPrivate && message.roomId === Number(this.roomFilter))
      );

      const matchesType = this.messageTypeFilter === 'all' ||
        (this.messageTypeFilter === 'group' && !message.isPrivate) ||
        (this.messageTypeFilter === 'private' && message.isPrivate);
      
      return matchesSearch && matchesRoom && matchesType;
    });

    this.totalPages = Math.ceil(this.filteredMessages.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedMessages();
  }

  updatePaginatedMessages(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedMessages = this.filteredMessages.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedMessages();
  }

  changePageSize(): void {
    this.totalPages = Math.ceil(this.filteredMessages.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedMessages();
  }

  confirmDeleteMessage(message: ExtendedMessage): void {
    this.messageToDelete = message;
    this.permanentDelete = false;
  }

  confirmPermanentDelete(message: ExtendedMessage): void {
    this.messageToDelete = message;
    this.permanentDelete = true;
  }

  cancelDelete(): void {
    this.messageToDelete = null;
    this.permanentDelete = false;
  }

  confirmDelete(): void {
    if (!this.messageToDelete) return;

    if (this.permanentDelete) {
      this.messageService.deletePermanent(this.messageToDelete.id).subscribe({
        next: () => {
          this.messages = this.messages.filter(m => m.id !== this.messageToDelete!.id);
          this.filterMessages();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Failed to delete message permanently', error);
          this.error = 'Failed to delete message';
          this.cancelDelete();
        }
      });
    } else {
      this.messageService.delete(this.messageToDelete.id).subscribe({
        next: (updated) => {
          const index = this.messages.findIndex(m => m.id === updated.id);
          if (index !== -1) {
            this.messages[index] = updated;
          }
          this.filterMessages();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Failed to delete message', error);
          this.error = 'Failed to delete message';
          this.cancelDelete();
        }
      });
    }
  }

  restoreMessage(message: ExtendedMessage): void {
    this.messageService.restore(message.id).subscribe({
      next: (updated) => {
        const index = this.messages.findIndex(m => m.id === updated.id);
        if (index !== -1) {
          this.messages[index] = updated;
        }
        this.filterMessages();
      },
      error: (error) => {
        console.error('Failed to restore message', error);
        this.error = 'Failed to restore message';
      }
    });
  }

  getRoomLabel(roomId: number | string): string {
    if (typeof roomId === 'number') {
      const message = this.messages.find(m => !m.isPrivate && m.roomId === roomId);
      return message?.roomName || `Room #${roomId}`;
    } else {
      // Private message
      const message = this.messages.find(m => m.isPrivate && `private-${m.id}` === roomId);
      return message ? `${message.senderName} ↔ ${message.receiverName}` : 'Private Chat';
    }
  }
}