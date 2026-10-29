import type { PaginationParams } from '@/types/api.types';

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  vehicles: {
    list: (params?: any) => ['vehicles', 'list', params] as const,
    featured: (params?: any) => ['vehicles', 'featured', params] as const,
    filtersMeta: () => ['vehicles', 'filtersMeta'] as const,
    slug: (slug: string) => ['vehicles', 'slug', slug] as const,
    detail: (id: string) => ['vehicles', 'detail', id] as const,
    similar: (id: string) => ['vehicles', 'similar', id] as const,
    adminAll: (params?: any) => ['vehicles', 'admin', 'all', params] as const,
    adminDetail: (id: string) => ['vehicles', 'admin', 'detail', id] as const,
  },
  buyRequests: {
    mine: (params?: PaginationParams) => ['buyRequests', 'mine', params] as const,
    list: (params?: any) => ['buyRequests', 'list', params] as const,
    detail: (id: string) => ['buyRequests', 'detail', id] as const,
  },
  sellRequests: {
    mine: (params?: PaginationParams) => ['sellRequests', 'mine', params] as const,
    track: (phone: string, params?: PaginationParams) => ['sellRequests', 'track', phone, params] as const,
    list: (params?: any) => ['sellRequests', 'list', params] as const,
    detail: (id: string) => ['sellRequests', 'detail', id] as const,
  },
  wishlist: {
    list: (params?: PaginationParams) => ['wishlist', 'list', params] as const,
  },
  master: {
    brands: (params?: any) => ['master', 'brands', params] as const,
    models: (params?: any) => ['master', 'models', params] as const,
    locations: (params?: any) => ['master', 'locations', params] as const,
    features: (params?: any) => ['master', 'features', params] as const,
  },
  chat: {
    mine: (params?: any) => ['chat', 'mine', params] as const,
    list: (params?: any) => ['chat', 'list', params] as const,
    detail: (id: string) => ['chat', 'detail', id] as const,
    messages: (id: string) => ['chat', 'messages', id] as const,
  },
  admin: {
    dashboard: () => ['admin', 'dashboard'] as const,
    users: (params?: any) => ['admin', 'users', params] as const,
    userDetail: (id: string) => ['admin', 'users', id] as const,
    notifications: (params?: any) => ['admin', 'notifications', params] as const,
  },
  content: {
    banners: (position?: string) => ['content', 'banners', position] as const,
    testimonials: () => ['content', 'testimonials'] as const,
    faqs: () => ['content', 'faqs'] as const,
    faqCategories: () => ['content', 'faqCategories'] as const,
    faqArticles: (params?: any) => ['content', 'faqArticles', params] as const,
    siteSettings: () => ['content', 'siteSettings'] as const,
    seoSettings: () => ['content', 'seoSettings'] as const,
    seo: (path: string) => ['content', 'seo', path] as const,
    contacts: (params?: any) => ['content', 'contacts', params] as const,
  },
} as const;
