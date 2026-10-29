import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { Vehicle, VehicleCard, VehicleFiltersMeta, VehicleListParams } from '@/types/vehicle.types';

export const listVehicles = async (params: VehicleListParams = {}): Promise<PaginatedResponse<VehicleCard>> =>
  (await api.get<PaginatedResponse<VehicleCard>>('/vehicles', { params })).data;

export const getFeatured = async (params: { limit?: number } = {}): Promise<VehicleCard[]> =>
  (await api.get<ApiResponse<VehicleCard[]>>('/vehicles/featured', { params })).data.data;

export const getFiltersMeta = async (): Promise<VehicleFiltersMeta> =>
  (await api.get<ApiResponse<VehicleFiltersMeta>>('/vehicles/filters-meta')).data.data;

export const getBySlug = async (slug: string): Promise<Vehicle> =>
  (await api.get<ApiResponse<Vehicle>>(`/vehicles/slug/${slug}`)).data.data;

export const getById = async (id: string): Promise<Vehicle> =>
  (await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)).data.data;

export const getSimilar = async (id: string): Promise<VehicleCard[]> =>
  (await api.get<ApiResponse<VehicleCard[]>>(`/vehicles/${id}/similar`)).data.data;

// ---- admin / employee ----
export const listAllVehicles = async (params: any = {}): Promise<PaginatedResponse<VehicleCard>> =>
  (await api.get<PaginatedResponse<VehicleCard>>('/vehicles/admin/all', { params })).data;

export const getAdminVehicle = async (id: string): Promise<Vehicle> =>
  (await api.get<ApiResponse<Vehicle>>(`/vehicles/admin/${id}`)).data.data;

export const createVehicle = async (payload: Partial<Vehicle>): Promise<Vehicle> =>
  (await api.post<ApiResponse<Vehicle>>('/vehicles', payload)).data.data;

export const updateVehicle = async (id: string, payload: Partial<Vehicle>): Promise<Vehicle> =>
  (await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, payload)).data.data;

export const updateVehicleStatus = async (id: string, status: string): Promise<Vehicle> =>
  (await api.patch<ApiResponse<Vehicle>>(`/vehicles/${id}/status`, { status })).data.data;

export const deleteVehicle = async (id: string): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};

export const addVehicleImages = async (id: string, files: File[], tags?: string[]): Promise<Vehicle> => {
  const form = new FormData();
  files.forEach((f) => form.append('photo', f));
  if (tags) tags.forEach((t) => form.append('tags', t));
  return (await api.post<ApiResponse<Vehicle>>(`/vehicles/${id}/images`, form)).data.data;
};

export const addVehicleImageUrls = async (
  id: string,
  images: { url: string; tag?: string }[],
): Promise<Vehicle> =>
  (await api.post<ApiResponse<Vehicle>>(`/vehicles/${id}/images/urls`, { images })).data.data;

export const removeVehicleImage = async (id: string, imageId: string): Promise<Vehicle> =>
  (await api.delete<ApiResponse<Vehicle>>(`/vehicles/${id}/images/${imageId}`)).data.data;

export default {
  listVehicles, getFeatured, getFiltersMeta, getBySlug, getById, getSimilar,
  listAllVehicles, getAdminVehicle, createVehicle, updateVehicle, updateVehicleStatus,
  deleteVehicle, addVehicleImages, addVehicleImageUrls, removeVehicleImage,
};
