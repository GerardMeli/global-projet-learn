export interface User {
  id: number;
  username: string;
  email: string;
  online?: boolean;
}

export interface Message {
  id: number;
  content: string;
  sender: User;
  timestamp: string;
  chatRoomId: number;
}

export interface ChatRoom {
  id: number;
  name: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
}