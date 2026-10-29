import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';
import type {
  SellRequest,
  CreateSellRequestDto,
  UpdateSellRequestDto,
  ConvertSellRequestDto,
  ConvertResult,
} from '@/types/sellRequest.types';

export const createSellRequest = async (payload: CreateSellRequestDto): Promise<SellRequest> =>
  (await api.post<ApiResponse<SellRequest>>('/sell-requests', payload)).data.data;

export const listSellRequests = async (params: any = {}): Promise<PaginatedResponse<SellRequest>> =>
  (await api.get<PaginatedResponse<SellRequest>>('/sell-requests', { params })).data;

export const getMySellRequests = async (params: PaginationParams = {}): Promise<PaginatedResponse<SellRequest>> =>
  (await api.get<PaginatedResponse<SellRequest>>('/sell-requests/mine', { params })).data;

export const trackSellRequests = async (phone: string, params: PaginationParams = {}): Promise<PaginatedResponse<SellRequest>> =>
  (await api.get<PaginatedResponse<SellRequest>>('/sell-requests/track', { params: { phone, ...params } })).data;

export const getSellRequest = async (id: string): Promise<SellRequest> =>
  (await api.get<ApiResponse<SellRequest>>(`/sell-requests/${id}`)).data.data;

export const updateSellRequest = async (id: string, payload: UpdateSellRequestDto): Promise<SellRequest> =>
  (await api.patch<ApiResponse<SellRequest>>(`/sell-requests/${id}`, payload)).data.data;

export const convertSellRequest = async (id: string, payload: ConvertSellRequestDto): Promise<ConvertResult> =>
  (await api.post<ApiResponse<ConvertResult>>(`/sell-requests/${id}/convert`, payload)).data.data;

export default {
  createSellRequest, listSellRequests, getMySellRequests, trackSellRequests,
  getSellRequest, updateSellRequest, convertSellRequest,
};
