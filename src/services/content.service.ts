import { api } from '@/lib/axios';
import { stripServerFields } from '@/lib/utils';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type {
  Banner, BannerInput, Testimonial, TestimonialInput, FaqCategory, FaqArticle,
  FaqCategoryInput, FaqArticleInput, SiteSetting, SiteSettingInput, SeoSetting, SeoSettingInput,
  Contact, ContactInput, ContactUpdateInput,
} from '@/types/content.types';

// ---- Banners ----
export const listBanners = async (position?: string): Promise<Banner[]> =>
  (await api.get<ApiResponse<Banner[]>>('/content/banners', { params: position ? { position } : {} })).data.data;
export const createBanner = async (payload: BannerInput): Promise<Banner> =>
  (await api.post<ApiResponse<Banner>>('/content/banners', payload)).data.data;
export const updateBanner = async (id: string, payload: Partial<BannerInput>): Promise<Banner> =>
  (await api.put<ApiResponse<Banner>>(`/content/banners/${id}`, stripServerFields(payload))).data.data;
export const deleteBanner = async (id: string): Promise<void> => { await api.delete(`/content/banners/${id}`); };

// ---- Testimonials ----
export const listTestimonials = async (): Promise<Testimonial[]> =>
  (await api.get<ApiResponse<Testimonial[]>>('/content/testimonials')).data.data;
export const createTestimonial = async (payload: TestimonialInput): Promise<Testimonial> =>
  (await api.post<ApiResponse<Testimonial>>('/content/testimonials', payload)).data.data;
export const updateTestimonial = async (id: string, payload: Partial<TestimonialInput>): Promise<Testimonial> =>
  (await api.put<ApiResponse<Testimonial>>(`/content/testimonials/${id}`, stripServerFields(payload))).data.data;
export const deleteTestimonial = async (id: string): Promise<void> => { await api.delete(`/content/testimonials/${id}`); };

// ---- FAQ ----
export const listFaqs = async (): Promise<FaqCategory[]> =>
  (await api.get<ApiResponse<FaqCategory[]>>('/content/faqs')).data.data;
export const listFaqCategories = async (): Promise<FaqCategory[]> =>
  (await api.get<ApiResponse<FaqCategory[]>>('/content/faq-categories')).data.data;
export const createFaqCategory = async (payload: FaqCategoryInput): Promise<FaqCategory> =>
  (await api.post<ApiResponse<FaqCategory>>('/content/faq-categories', payload)).data.data;
export const updateFaqCategory = async (id: string, payload: Partial<FaqCategoryInput>): Promise<FaqCategory> =>
  (await api.put<ApiResponse<FaqCategory>>(`/content/faq-categories/${id}`, stripServerFields(payload))).data.data;
export const deleteFaqCategory = async (id: string): Promise<void> => { await api.delete(`/content/faq-categories/${id}`); };

export const listFaqArticles = async (params: { category?: string } = {}): Promise<FaqArticle[]> =>
  (await api.get<ApiResponse<FaqArticle[]>>('/content/faq-articles', { params })).data.data;
export const createFaqArticle = async (payload: FaqArticleInput): Promise<FaqArticle> =>
  (await api.post<ApiResponse<FaqArticle>>('/content/faq-articles', payload)).data.data;
export const updateFaqArticle = async (id: string, payload: Partial<FaqArticleInput>): Promise<FaqArticle> =>
  (await api.put<ApiResponse<FaqArticle>>(`/content/faq-articles/${id}`, stripServerFields(payload))).data.data;
export const deleteFaqArticle = async (id: string): Promise<void> => { await api.delete(`/content/faq-articles/${id}`); };

// ---- Site settings ----
type FlatSiteSettings = SiteSetting & {
  facebook?: string; instagram?: string; twitter?: string; youtube?: string; linkedin?: string;
};
export const getSiteSettings = async (): Promise<SiteSetting> => {
  const s = (await api.get<ApiResponse<FlatSiteSettings>>('/content/site-settings')).data.data;
  return {
    ...s,
    social: {
      facebook: s.facebook ?? s.social?.facebook,
      instagram: s.instagram ?? s.social?.instagram,
      twitter: s.twitter ?? s.social?.twitter,
      youtube: s.youtube ?? s.social?.youtube,
      linkedin: s.linkedin ?? s.social?.linkedin,
    },
  };
};
export const updateSiteSettings = async (payload: SiteSettingInput): Promise<SiteSetting> => {
  const { social, ...rest } = payload;
  const body = stripServerFields({
    ...rest,
    facebook: social?.facebook,
    instagram: social?.instagram,
    twitter: social?.twitter,
    youtube: social?.youtube,
    linkedin: social?.linkedin,
  });
  return (await api.put<ApiResponse<SiteSetting>>('/content/site-settings', body)).data.data;
};

// ---- SEO ----
export const resolveSeo = async (path: string): Promise<SeoSetting | null> =>
  (await api.get<ApiResponse<SeoSetting | null>>('/content/seo', { params: { path } })).data.data;
export const listSeoSettings = async (): Promise<SeoSetting[]> =>
  (await api.get<ApiResponse<SeoSetting[]>>('/content/seo-settings')).data.data;
export const upsertSeoSetting = async (payload: SeoSettingInput): Promise<SeoSetting> =>
  (await api.put<ApiResponse<SeoSetting>>('/content/seo-settings', stripServerFields(payload))).data.data;
export const deleteSeoSetting = async (id: string): Promise<void> => { await api.delete(`/content/seo-settings/${id}`); };

// ---- Contacts ----
export const createContact = async (payload: ContactInput): Promise<Contact> =>
  (await api.post<ApiResponse<Contact>>('/content/contacts', payload)).data.data;
export const listContacts = async (params: any = {}): Promise<PaginatedResponse<Contact>> =>
  (await api.get<PaginatedResponse<Contact>>('/content/contacts', { params })).data;
export const updateContact = async (id: string, payload: ContactUpdateInput): Promise<Contact> =>
  (await api.patch<ApiResponse<Contact>>(`/content/contacts/${id}`, payload)).data.data;

export default {
  listBanners, createBanner, updateBanner, deleteBanner,
  listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  listFaqs, listFaqCategories, createFaqCategory, updateFaqCategory, deleteFaqCategory,
  listFaqArticles, createFaqArticle, updateFaqArticle, deleteFaqArticle,
  getSiteSettings, updateSiteSettings, resolveSeo, listSeoSettings, upsertSeoSetting, deleteSeoSetting,
  createContact, listContacts, updateContact,
};
