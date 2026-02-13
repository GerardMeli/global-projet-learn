// src/store/chatStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ChatRoomResponse, MessageResponse } from '../types';

interface ChatState {
  // ==================== État ====================
  rooms: ChatRoomResponse[];
  selectedRoomId: number | null;
  messages: MessageResponse[];
  unreadCounts: Record<number, number>;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;

  // ==================== Actions: Rooms ====================
  setRooms: (rooms: ChatRoomResponse[]) => void;
  addRoom: (room: ChatRoomResponse) => void;
  updateRoom: (roomId: number, updates: Partial<ChatRoomResponse>) => void;
  deleteRoom: (roomId: number) => void;

  // ==================== Actions: Selected Room ====================
  selectRoom: (roomId: number | null) => void;
  getSelectedRoom: () => ChatRoomResponse | undefined;

  // ==================== Actions: Messages ====================
  setMessages: (messages: MessageResponse[]) => void;
  addMessage: (message: MessageResponse) => void;
  updateMessage: (messageId: number, updates: Partial<MessageResponse>) => void;
  deleteMessage: (messageId: number) => void;
  clearMessages: () => void;

  // ==================== Actions: Unread Counts ====================
  incrementUnreadCount: (roomId: number) => void;
  resetUnreadCount: (roomId: number) => void;
  getUnreadCount: (roomId: number) => number;
  getTotalUnreadCount: () => number;

  // ==================== Actions: Loading ====================
  setLoadingRooms: (loading: boolean) => void;
  setLoadingMessages: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // ==================== État Initial ====================
        rooms: [],
        selectedRoomId: null,
        messages: [],
        unreadCounts: {},
        isLoadingRooms: false,
        isLoadingMessages: false,

        // ==================== Rooms ====================
        setRooms: (rooms) => set({ rooms }),

        addRoom: (room) =>
          set((state) => ({
            rooms: [...state.rooms, room],
          })),

        updateRoom: (roomId, updates) =>
          set((state) => ({
            rooms: state.rooms.map((room) =>
              room.id === roomId ? { ...room, ...updates } : room
            ),
          })),

        deleteRoom: (roomId) =>
          set((state) => {
            const wasSelected = state.selectedRoomId === roomId;
            return {
              rooms: state.rooms.filter((room) => room.id !== roomId),
              selectedRoomId: wasSelected ? null : state.selectedRoomId,
              unreadCounts: {
                ...state.unreadCounts,
                [roomId]: 0,
              },
            };
          }),

        // ==================== Selected Room ====================
        selectRoom: (roomId) =>
          set((state) => {
            // Reset unread count when selecting a room
            if (roomId !== null) {
              return {
                selectedRoomId: roomId,
                unreadCounts: {
                  ...state.unreadCounts,
                  [roomId]: 0,
                },
              };
            }
            return { selectedRoomId: null };
          }),

        getSelectedRoom: () => {
          const state = get();
          if (!state.selectedRoomId) return undefined;
          return state.rooms.find((room) => room.id === state.selectedRoomId);
        },

        // ==================== Messages ====================
        setMessages: (messages) => set({ messages }),

        addMessage: (message) =>
          set((state) => {
            // Avoid duplicates
            if (state.messages.some((m) => m.id === message.id)) {
              return state;
            }

            // Increment unread count if message is not from current room
            const updates: Partial<ChatState> = {
              messages: [...state.messages, message],
            };

            if (state.selectedRoomId !== message.chatRoomId) {
              updates.unreadCounts = {
                ...state.unreadCounts,
                [message.chatRoomId]:
                  (state.unreadCounts[message.chatRoomId] || 0) + 1,
              };
            }

            return updates;
          }),

        updateMessage: (messageId, updates) =>
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === messageId
                ? { ...message, ...updates }
                : message
            ),
          })),

        deleteMessage: (messageId) =>
          set((state) => ({
            messages: state.messages.map((message) =>
              message.id === messageId
                ? { ...message, isDeleted: true }
                : message
            ),
          })),

        clearMessages: () => set({ messages: [] }),

        // ==================== Unread Counts ====================
        incrementUnreadCount: (roomId) =>
          set((state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [roomId]: (state.unreadCounts[roomId] || 0) + 1,
            },
          })),

        resetUnreadCount: (roomId) =>
          set((state) => ({
            unreadCounts: {
              ...state.unreadCounts,
              [roomId]: 0,
            },
          })),

        getUnreadCount: (roomId) => {
          return get().unreadCounts[roomId] || 0;
        },

        getTotalUnreadCount: () => {
          const counts = Object.values(get().unreadCounts);
          return counts.reduce((sum, count) => sum + count, 0);
        },

        // ==================== Loading ====================
        setLoadingRooms: (loading) => set({ isLoadingRooms: loading }),

        setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
      }),
      {
        name: 'chat-store',
        // Persist only these fields
        partialize: (state) => ({
          rooms: state.rooms,
          unreadCounts: state.unreadCounts,
        }),
      }
    )
  )
);