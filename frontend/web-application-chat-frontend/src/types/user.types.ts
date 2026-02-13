export interface UserResponse {
  id: number;
  email: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: string;
}

export interface UserSimpleResponse {
  id: number;
  email: string;
}