import { api } from '@/lib/axios';
import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import type { ChatTicket, ChatMessage, CreateTicketDto, UpdateTicketDto } from '@/types/chat.types';

export const createTicket = async (payload: CreateTicketDto): Promise<ChatTicket> =>
  (await api.post<ApiResponse<ChatTicket>>('/chat/tickets', payload)).data.data;

export const listTickets = async (params: any = {}): Promise<PaginatedResponse<ChatTicket>> =>
  (await api.get<PaginatedResponse<ChatTicket>>('/chat/tickets', { params })).data;

export const getMyTickets = async (params: any = {}): Promise<PaginatedResponse<ChatTicket>> =>
  (await api.get<PaginatedResponse<ChatTicket>>('/chat/tickets/mine', { params })).data;

export const getTicket = async (id: string): Promise<ChatTicket> =>
  (await api.get<ApiResponse<ChatTicket>>(`/chat/tickets/${id}`)).data.data;

export const updateTicket = async (id: string, payload: UpdateTicketDto): Promise<ChatTicket> =>
  (await api.patch<ApiResponse<ChatTicket>>(`/chat/tickets/${id}`, payload)).data.data;

export const getMessages = async (id: string): Promise<ChatMessage[]> =>
  (await api.get<ApiResponse<ChatMessage[]>>(`/chat/tickets/${id}/messages`)).data.data;

export const sendMessage = async (id: string, message: string): Promise<ChatMessage> =>
  (await api.post<ApiResponse<ChatMessage>>(`/chat/tickets/${id}/messages`, { message })).data.data;

export const sendImage = async (id: string, file: File): Promise<ChatMessage> => {
  const form = new FormData();
  form.append('photo', file);
  return (await api.post<ApiResponse<ChatMessage>>(`/chat/tickets/${id}/messages/image`, form)).data.data;
};

export const markRead = async (id: string): Promise<void> => {
  await api.patch(`/chat/tickets/${id}/read`);
};

export default {
  createTicket, listTickets, getMyTickets, getTicket, updateTicket,
  getMessages, sendMessage, sendImage, markRead,
};
