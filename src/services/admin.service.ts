import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { DashboardStats, AdminUser, AdminUserUpdateInput, Notification } from '@/types/admin.types';

export const getDashboard = async (): Promise<DashboardStats> =>
  (await api.get<ApiResponse<DashboardStats>>('/admin/dashboard')).data.data;

export const listUsers = async (params: any = {}): Promise<PaginatedResponse<AdminUser>> =>
  (await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params })).data;

export const getUser = async (id: string): Promise<AdminUser> =>
  (await api.get<ApiResponse<AdminUser>>(`/admin/users/${id}`)).data.data;

export const updateUser = async (id: string, payload: AdminUserUpdateInput): Promise<AdminUser> =>
  (await api.patch<ApiResponse<AdminUser>>(`/admin/users/${id}`, payload)).data.data;

export const listNotifications = async (params: any = {}): Promise<PaginatedResponse<Notification>> =>
  (await api.get<PaginatedResponse<Notification>>('/admin/notifications', { params })).data;

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/admin/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/admin/notifications/read-all');
};

export default {
  getDashboard, listUsers, getUser, updateUser,
  listNotifications, markNotificationRead, markAllNotificationsRead,
};
