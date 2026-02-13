import type { UserResponse } from "./user.types";

export interface LoginRequest {
  email: string;  // IMPORTANT: Votre backend attend "email" pas "username"
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: UserResponse;
    token: string;
    tokenType: string;
    expiresIn: number;
    sessionId: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp: number;
}

// src/types/index.ts
export interface UserType {
  id: number;
  email: string;
  username?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
}