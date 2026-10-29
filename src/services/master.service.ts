import { api } from '@/lib/axios';
import { stripServerFields } from '@/lib/utils';
import type { ApiResponse } from '@/types/api.types';
import type {
  Brand, BrandInput, VehicleModel, VehicleModelInput, Location, LocationInput, Feature, FeatureInput,
} from '@/types/master.types';

// ---- Brands ----
export const listBrands = async (params: { category?: string; all?: boolean } = {}): Promise<Brand[]> =>
  (await api.get<ApiResponse<Brand[]>>('/master/brands', { params })).data.data;
export const createBrand = async (payload: BrandInput): Promise<Brand> =>
  (await api.post<ApiResponse<Brand>>('/master/brands', payload)).data.data;
export const updateBrand = async (id: string, payload: Partial<BrandInput>): Promise<Brand> =>
  (await api.put<ApiResponse<Brand>>(`/master/brands/${id}`, stripServerFields(payload))).data.data;
export const deleteBrand = async (id: string): Promise<void> => { await api.delete(`/master/brands/${id}`); };

// ---- Models ----
export const listModels = async (params: { brandId?: string; category?: string } = {}): Promise<VehicleModel[]> =>
  (await api.get<ApiResponse<VehicleModel[]>>('/master/models', { params })).data.data;
export const createModel = async (payload: VehicleModelInput): Promise<VehicleModel> =>
  (await api.post<ApiResponse<VehicleModel>>('/master/models', payload)).data.data;
export const updateModel = async (id: string, payload: Partial<VehicleModelInput>): Promise<VehicleModel> =>
  (await api.put<ApiResponse<VehicleModel>>(`/master/models/${id}`, stripServerFields(payload))).data.data;
export const deleteModel = async (id: string): Promise<void> => { await api.delete(`/master/models/${id}`); };

// ---- Locations ----
export const listLocations = async (): Promise<Location[]> =>
  (await api.get<ApiResponse<Location[]>>('/master/locations')).data.data;
export const createLocation = async (payload: LocationInput): Promise<Location> =>
  (await api.post<ApiResponse<Location>>('/master/locations', payload)).data.data;
export const updateLocation = async (id: string, payload: Partial<LocationInput>): Promise<Location> =>
  (await api.put<ApiResponse<Location>>(`/master/locations/${id}`, stripServerFields(payload))).data.data;
export const deleteLocation = async (id: string): Promise<void> => { await api.delete(`/master/locations/${id}`); };

// ---- Features ----
export const listFeatures = async (params: { category?: string } = {}): Promise<Feature[]> =>
  (await api.get<ApiResponse<Feature[]>>('/master/features', { params })).data.data;
export const createFeature = async (payload: FeatureInput): Promise<Feature> =>
  (await api.post<ApiResponse<Feature>>('/master/features', payload)).data.data;
export const updateFeature = async (id: string, payload: Partial<FeatureInput>): Promise<Feature> =>
  (await api.put<ApiResponse<Feature>>(`/master/features/${id}`, stripServerFields(payload))).data.data;
export const deleteFeature = async (id: string): Promise<void> => { await api.delete(`/master/features/${id}`); };

export default {
  listBrands, createBrand, updateBrand, deleteBrand,
  listModels, createModel, updateModel, deleteModel,
  listLocations, createLocation, updateLocation, deleteLocation,
  listFeatures, createFeature, updateFeature, deleteFeature,
};
