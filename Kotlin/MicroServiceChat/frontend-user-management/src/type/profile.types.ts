import { Language, Theme, UserRole, UserStatus } from './user.types';

export interface UserProfileResponse {
  id: number;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  emailVerified: boolean;
  language: Language;
  theme: Theme;
  emailNotifications: boolean;
  createdAt: string;
  failedLoginAttempts: number;
}

export interface UserProfileUpdateRequest {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
}

export interface UserPreferencesUpdateRequest {
  language?: Language | null;
  theme?: Theme | null;
  emailNotifications?: boolean | null;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailUpdateRequest {
  newEmail: string;
  password: string;
}