import type { User } from './auth.types';

export interface DashboardStats {
  vehicles: {
    total: number;
    totalViews: number;
    avgPrice: number;
    active: number;
    sold: number;
    draft: number;
    byStatus?: Record<string, number>;
    byCategory?: Record<string, number>;
  };
  requests: {
    buyNew: number;
    sellPending: number;
    buyThisWeek: number;
    sellThisWeek: number;
  };
  users: { total: number; thisWeek: number };
  chats: { open: number };
  growth?: {
    vehiclesThisWeek: number;
    buyThisWeek: number;
    sellThisWeek: number;
    usersThisWeek: number;
  };
  activity?: {
    type: string;
    id: string;
    title: string;
    subtitle?: string;
    at: string;
    link?: string;
  }[];
}

export interface AdminUser extends User {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserUpdateInput {
  role?: 'USER' | 'EMPLOYEE' | 'ADMIN';
  isActive?: boolean;
  isVendor?: boolean;
  companyName?: string | null;
}

export interface Notification {
  _id: string;
  id?: string;
  type: string;
  title: string;
  body?: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}
