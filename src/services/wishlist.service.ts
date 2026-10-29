import { api } from '@/lib/axios';
import type { PaginatedResponse, PaginationParams } from '@/types/api.types';
import type { VehicleCard } from '@/types/vehicle.types';

export const getWishlist = async (params: PaginationParams = {}): Promise<PaginatedResponse<VehicleCard>> =>
  (await api.get<PaginatedResponse<VehicleCard>>('/wishlist', { params })).data;

export const addToWishlist = async (vehicleId: string): Promise<void> => {
  await api.post(`/wishlist/${vehicleId}`);
};

export const removeFromWishlist = async (vehicleId: string): Promise<void> => {
  await api.delete(`/wishlist/${vehicleId}`);
};

export default { getWishlist, addToWishlist, removeFromWishlist };
