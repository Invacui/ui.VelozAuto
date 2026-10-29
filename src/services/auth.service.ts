import { api } from '@/lib/axios';
import type {
  AuthResult,
  User,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ChangePasswordDto,
  SendPhoneOtpResult,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/api.types';

export const register = async (payload: RegisterDto): Promise<AuthResult> =>
  (await api.post<ApiResponse<AuthResult>>('/auth/register', payload)).data.data;

export const login = async (payload: LoginDto): Promise<AuthResult> =>
  (await api.post<ApiResponse<AuthResult>>('/auth/login', payload)).data.data;

export const googleLogin = async (credential: string): Promise<AuthResult> =>
  (await api.post<ApiResponse<AuthResult>>('/auth/google', { credential })).data.data;

export const sendPhoneOtp = async (phone?: string): Promise<SendPhoneOtpResult> =>
  (
    await api.post<ApiResponse<SendPhoneOtpResult>>(
      '/auth/phone/send-otp',
      phone ? { phone } : {},
    )
  ).data.data;

export const verifyPhoneOtp = async (code: string): Promise<User> =>
  (await api.post<ApiResponse<User>>('/auth/phone/verify-otp', { code })).data.data;

export const refresh = async (refreshToken?: string): Promise<AuthResult> =>
  (await api.post<ApiResponse<AuthResult>>('/auth/refresh', { refreshToken })).data.data;

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (email: string, token: string, password: string): Promise<void> => {
  await api.post('/auth/reset-password', { email, token, password });
};

export const verifyEmail = async (token: string): Promise<User> =>
  (await api.get<ApiResponse<User>>(`/auth/verify-email/${token}`)).data.data;

export const resendVerification = async (): Promise<void> => {
  await api.post('/auth/resend-verification');
};

export const getMe = async (): Promise<User> => (await api.get<ApiResponse<User>>('/auth/me')).data.data;

export const updateMe = async (payload: UpdateProfileDto): Promise<User> =>
  (await api.patch<ApiResponse<User>>('/auth/me', payload)).data.data;

export const changePassword = async (payload: ChangePasswordDto): Promise<void> => {
  await api.patch('/auth/me/password', payload);
};

export const uploadProfileImage = async (file: File): Promise<User> => {
  const form = new FormData();
  form.append('photo', file);
  return (await api.post<ApiResponse<User>>('/auth/me/profile-image', form)).data.data;
};

export default {
  register, login, googleLogin, sendPhoneOtp, verifyPhoneOtp, refresh, logout,
  forgotPassword, resetPassword, verifyEmail, resendVerification, getMe, updateMe,
  changePassword, uploadProfileImage,
};
