// admin-messages.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageResponse } from '../../../core/models/chat/message.model';
import { MessageService } from '../../../core/services/chat/message.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-messages.html',
  styleUrls: ['./admin-messages.component.scss']
})
export class AdminMessagesComponent implements OnInit {
  messages: MessageResponse[] = [];
  filteredMessages: MessageResponse[] = [];
  paginatedMessages: MessageResponse[] = [];
  
  searchTerm = '';
  roomFilter = '';
  
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  
  loading = false;
  error = '';
  
  messageToDelete: MessageResponse | null = null;
  permanentDelete = false;

  Math = Math;

  get uniqueRoomIds(): number[] {
    return [...new Set(this.messages.map(m => m.roomId))];
  }

  get messagesWithFiles(): number {
    return this.messages.filter(m => !!m.fileUrl).length;
  }

  get deletedMessages(): number {
    return this.messages.filter(m => m.isDeleted).length;
  }

  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.error = '';

    // Since we need messages from all rooms, we'll load from participants or use a different approach
    // For now, we'll show a message
    this.error = 'Message history loading from all rooms not implemented yet';
    this.loading = false;
    
    // TODO: Implement loading messages from all rooms
    // This would require a backend endpoint to get all messages or aggregating from multiple rooms
  }

  filterMessages(): void {
    this.filteredMessages = this.messages.filter(message => {
      const matchesSearch = !this.searchTerm || 
        message.content?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        message.sender.toString().includes(this.searchTerm);
      
      const matchesRoom = !this.roomFilter || message.roomId === Number(this.roomFilter);
      
      return matchesSearch && matchesRoom;
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

  confirmDeleteMessage(message: MessageResponse): void {
    this.messageToDelete = message;
    this.permanentDelete = false;
  }

  confirmPermanentDelete(message: MessageResponse): void {
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

  restoreMessage(message: MessageResponse): void {
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
}