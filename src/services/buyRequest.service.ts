import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '@/types/api.types';
import type { BuyRequest, CreateBuyRequestDto, UpdateBuyRequestDto } from '@/types/buyRequest.types';

export const createBuyRequest = async (payload: CreateBuyRequestDto): Promise<BuyRequest> =>
  (await api.post<ApiResponse<BuyRequest>>('/buy-requests', payload)).data.data;

export const listBuyRequests = async (params: any = {}): Promise<PaginatedResponse<BuyRequest>> =>
  (await api.get<PaginatedResponse<BuyRequest>>('/buy-requests', { params })).data;

export const getMyBuyRequests = async (params: PaginationParams = {}): Promise<PaginatedResponse<BuyRequest>> =>
  (await api.get<PaginatedResponse<BuyRequest>>('/buy-requests/mine', { params })).data;

export const getBuyRequest = async (id: string): Promise<BuyRequest> =>
  (await api.get<ApiResponse<BuyRequest>>(`/buy-requests/${id}`)).data.data;

export const updateBuyRequest = async (id: string, payload: UpdateBuyRequestDto): Promise<BuyRequest> =>
  (await api.patch<ApiResponse<BuyRequest>>(`/buy-requests/${id}`, payload)).data.data;

export default { createBuyRequest, listBuyRequests, getMyBuyRequests, getBuyRequest, updateBuyRequest };
