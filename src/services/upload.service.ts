import { api } from '@/lib/axios';
import type { ApiResponse, UploadedFile } from '@/types/api.types';

/** Upload up to 6 images in one call (used by the guest sell flow). */
export const uploadImages = async (files: File[]): Promise<UploadedFile[]> => {
  const form = new FormData();
  files.forEach((f) => form.append('photo', f));
  return (await api.post<ApiResponse<UploadedFile[]>>('/uploads', form)).data.data;
};

export default { uploadImages };
