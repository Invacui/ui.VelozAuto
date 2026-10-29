export type BannerPosition = 'HERO' | 'SELL_STRIP' | 'CATEGORIES' | 'FOOTER';

export interface Banner {
  _id: string;
  id?: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string | null;
  position: BannerPosition;
  sortOrder?: number;
  isActive: boolean;
}

export interface BannerInput {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: BannerPosition;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Testimonial {
  _id: string;
  id?: string;
  name: string;
  city?: string;
  role?: string;
  quote: string;
  rating: number;
  avatar?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface TestimonialInput {
  name: string;
  city?: string;
  role?: string;
  quote: string;
  rating: number;
  avatar?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface FaqArticle {
  _id: string;
  id?: string;
  category: string;
  question: string;
  answer: string;
  order?: number;
  isActive: boolean;
}

export interface FaqCategory {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive: boolean;
  articles?: FaqArticle[];
}

export interface FaqArticleInput {
  category: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

export interface FaqCategoryInput {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface SiteSetting {
  _id?: string;
  siteName: string;
  tagline?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  social?: { facebook?: string; instagram?: string; twitter?: string; youtube?: string; linkedin?: string };
  defaultMeta?: { title?: string; description?: string; image?: string };
  footerText?: string;
  workingHours?: string;
}

export type SiteSettingInput = Partial<SiteSetting>;

export interface SeoSetting {
  _id: string;
  id?: string;
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string | null;
  canonical?: string | null;
  noindex?: boolean;
  lastmod?: string;
}

export interface SeoSettingInput {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export interface Contact {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  adminNotes?: string | null;
  createdAt: string;
}

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactUpdateInput {
  status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  adminNotes?: string;
}
