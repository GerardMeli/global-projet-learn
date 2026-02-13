export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:8081/ws-chat',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  ADMIN: '/admin',
  SETTINGS: '/settings',
};

export const MESSAGE_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  FILE: 'FILE',
  SYSTEM: 'SYSTEM',
} as const;

export const CHAT_ROOM_TYPES = {
  PRIVATE: 'PRIVATE',
  GROUP: 'GROUP',
  CHANNEL: 'CHANNEL',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
} as const;

export const PARTICIPANT_ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  ES: 'es',
} as const;