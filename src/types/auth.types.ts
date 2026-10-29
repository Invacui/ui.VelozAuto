export type UserRole = 'USER' | 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileImage?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface SendPhoneOtpResult {
  phone: string;
  sent: boolean;
  alreadyVerified: boolean;
  devCode?: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
