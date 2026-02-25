import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; 
import { ChatParticipantService } from '../../../core/services/chat/chat-participant.service';
import { ChatRoomResponse, ChatRoomCreateRequest } from '../../../core/models/chat/chat-room.model';
import { ChatRoomService } from '../../../core/services/chat/chat-room.service';
import { MessageService } from '../../../core/services/chat/message.service';
import { UserProfileResponse } from '../../../core/models/users/profile.model';
import { AdminService } from '../../../core/services/users/admin.service';
import { ParticipantRole } from '../../../core/models/chat/chat.mdel';

@Component({
  selector: 'app-admin-chat-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-chat-rooms.html',
  styleUrls: ['./admin-chat-rooms.scss']
})
export class AdminChatRoomsComponent implements OnInit {
  rooms: ChatRoomResponse[] = [];
  filteredRooms: ChatRoomResponse[] = [];
  paginatedRooms: ChatRoomResponse[] = [];
  
  selectedRoom: ChatRoomResponse | null = null;
  roomParticipants: any[] = [];
  roomToDelete: ChatRoomResponse | null = null;
  
  // Create Room Modal
  showCreateRoomModal = false;
  newRoom = {
    name: '',
    type: 'PUBLIC',
    description: ''
  };
  selectedUserIds: Set<number> = new Set();
  allUsers: UserProfileResponse[] = [];
  filteredUsers: UserProfileResponse[] = [];
  userSearchTerm = '';
  creatingRoom = false;
  
  // Add Participants Modal
  showAddParticipantsModal = false;
  roomForAddingParticipants: ChatRoomResponse | null = null;
  
  searchTerm = '';
  typeFilter = '';
  
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  loading = false;
  error = '';
  
  stats = {
    totalRooms: 0,
    publicRooms: 0,
    privateRooms: 0,
    totalParticipants: 0,
    totalMessages: 0
  };

  Math = Math;

  constructor(
    private chatRoomService: ChatRoomService,
    private participantService: ChatParticipantService,
    private messageService: MessageService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.loadAllUsers();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.loadRooms(),
      this.loadStats()
    ]).catch(error => {
      this.error = 'Failed to load chat rooms data';
      console.error(error);
    }).finally(() => {
      this.loading = false;
    });
  }

  loadRooms(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.chatRoomService.getAll().subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.filterRooms();
          resolve();
        },
        error: reject
      });
    });
  }

  async loadStats(): Promise<void> {
    try {
      const [publicRooms, privateRooms, participants] = await Promise.all([
        this.chatRoomService.getPublic().toPromise(),
        this.chatRoomService.getPrivate().toPromise(),
        this.participantService.getAll().toPromise()
      ]);

      this.stats = {
        totalRooms: this.rooms.length,
        publicRooms: publicRooms?.length || 0,
        privateRooms: privateRooms?.length || 0,
        totalParticipants: participants?.length || 0,
        totalMessages: 0
      };

      // Calculate total messages
      for (const room of this.rooms) {
        try {
          const count = await this.chatRoomService.getMessageCount(room.id).toPromise();
          this.stats.totalMessages += count?.messageCount || 0;
        } catch (error) {
          console.error(`Failed to load message count for room ${room.id}`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load stats', error);
    }
  }

  filterRooms(): void {
    this.filteredRooms = this.rooms.filter(room => {
      const matchesSearch = !this.searchTerm || 
        room.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesType = !this.typeFilter || room.type === this.typeFilter;
      
      return matchesSearch && matchesType;
    });

    this.totalPages = Math.ceil(this.filteredRooms.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedRooms();
  }

  updatePaginatedRooms(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedRooms = this.filteredRooms.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedRooms();
  }

  changePageSize(): void {
    this.totalPages = Math.ceil(this.filteredRooms.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedRooms();
  }

  async showParticipants(room: ChatRoomResponse): Promise<void> {
    this.selectedRoom = room;
    this.roomParticipants = [];
    
    try {
      const participants = await this.participantService.getByRoom(room.id).toPromise();
      this.roomParticipants = participants || [];
    } catch (error) {
      console.error('Failed to load participants', error);
    }
  }

  showMessages(room: ChatRoomResponse): void {
    console.log('Show messages for room:', room.id);
  }

  viewRoom(room: ChatRoomResponse): void {
    this.showParticipants(room);
  }

  editRoom(room: ChatRoomResponse): void {
    console.log('Edit room:', room.id);
  }

  confirmDeleteRoom(room: ChatRoomResponse): void {
    this.roomToDelete = room;
  }

  cancelDelete(): void {
    this.roomToDelete = null;
  }

  deleteRoom(): void {
    if (!this.roomToDelete) return;

    this.chatRoomService.delete(this.roomToDelete.id).subscribe({
      next: () => {
        this.rooms = this.rooms.filter(r => r.id !== this.roomToDelete!.id);
        this.filterRooms();
        this.roomToDelete = null;
      },
      error: (error) => {
        console.error('Failed to delete room', error);
        this.error = 'Failed to delete room';
        this.roomToDelete = null;
      }
    });
  }

  closeModal(): void {
    this.selectedRoom = null;
    this.roomParticipants = [];
  }

  // ==================== CREATE ROOM ====================

  openCreateRoomModal(): void {
    this.newRoom = { name: '', type: 'PUBLIC', description: '' };
    this.selectedUserIds.clear();
    this.userSearchTerm = '';
    this.filterUsers();
    this.showCreateRoomModal = true;
  }

  closeCreateRoomModal(): void {
    this.showCreateRoomModal = false;
    this.newRoom = { name: '', type: 'PUBLIC', description: '' };
    this.selectedUserIds.clear();
  }

  loadAllUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (response) => {
        // AdminService.getAllUsers() retourne ApiResponse<UserProfileResponse[]>
        if (response && response.data) {
          this.allUsers = response.data;
        } else {
          this.allUsers = [];
        }
        this.filterUsers();
      },
      error: (error: any) => {
        console.error('Failed to load users', error);
        this.allUsers = [];
      }
    });
  }

  filterUsers(): void {
    const searchTerm = this.userSearchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user => 
      user.email?.toLowerCase().includes(searchTerm) ||
      user.firstName?.toLowerCase().includes(searchTerm) ||
      user.lastName?.toLowerCase().includes(searchTerm)
    );
  }

  toggleUserSelection(userId: number): void {
    if (this.selectedUserIds.has(userId)) {
      this.selectedUserIds.delete(userId);
    } else {
      this.selectedUserIds.add(userId);
    }
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds.has(userId);
  }

  createRoom(): void {
    if (!this.newRoom.name.trim()) {
      this.error = 'Room name is required';
      return;
    }

    this.creatingRoom = true;
    const userIds = Array.from(this.selectedUserIds);

    const request: ChatRoomCreateRequest = {
      name: this.newRoom.name.trim(),
      type: this.newRoom.type as any,
      userIds: userIds.length > 0 ? userIds : []
    };

    this.chatRoomService.create(request).subscribe({
      next: (newRoom) => {
        this.rooms.push(newRoom);
        this.filterRooms();
        this.closeCreateRoomModal();
        this.loadData();
        this.error = '';
      },
      error: (error) => {
        console.error('Failed to create room', error);
        this.error = 'Failed to create room';
      },
      complete: () => {
        this.creatingRoom = false;
      }
    });
  }

  // ==================== ADD PARTICIPANTS ====================

  openAddParticipantsModal(room: ChatRoomResponse): void {
    this.roomForAddingParticipants = room;
    this.selectedUserIds.clear();
    this.userSearchTerm = '';
    this.filterUsers();
    this.showAddParticipantsModal = true;
  }

  closeAddParticipantsModal(): void {
    this.showAddParticipantsModal = false;
    this.roomForAddingParticipants = null;
    this.selectedUserIds.clear();
  }

  addParticipantsToRoom(): void {
    if (!this.roomForAddingParticipants || this.selectedUserIds.size === 0) {
      return;
    }

    const roomId = this.roomForAddingParticipants.id;
    const userIds = Array.from(this.selectedUserIds);
    let addedCount = 0;
    let hasError = false;

    userIds.forEach(userId => {
      this.participantService.add({
        userId,
        chatRoomId: roomId,
        role: ParticipantRole.MEMBER
      }).subscribe({
        next: () => {
          addedCount++;
          if (addedCount === userIds.length && !hasError) {
            this.closeAddParticipantsModal();
            this.showParticipants(this.roomForAddingParticipants!);
          }
        },
        error: (error) => {
          console.error('Failed to add participant', error);
          hasError = true;
          this.error = 'Failed to add some participants';
        }
      });
    });
  }

  getParticipantInitials(participant: any): string {
    if (participant.user?.firstName && participant.user?.lastName) {
      return (participant.user.firstName[0] + participant.user.lastName[0]).toUpperCase();
    }
    return `U${participant.userId}`.slice(0, 2).toUpperCase();
  }

  getAvatarColor(userId: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return colors[userId % colors.length];
  }

  getUserDisplayName(user: UserProfileResponse): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email;
  }
}