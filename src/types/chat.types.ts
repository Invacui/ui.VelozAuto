export type ChatTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ChatPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ChatCategory =
  | 'BUY_REQUEST'
  | 'SELL_REQUEST'
  | 'VEHICLE'
  | 'FINANCE'
  | 'PAYMENT'
  | 'OTHER';

export interface ChatTicket {
  _id: string;
  id?: string;
  ticketId: string;
  user?: { id: string; name: string; email?: string } | string | null;
  subject: string;
  category: ChatCategory;
  priority: ChatPriority;
  status: ChatTicketStatus;
  assignedTo?: { id: string; name: string } | string | null;
  relatedVehicle?: { id: string; slug: string; title?: string } | string | null;
  relatedBuyRequest?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  _id: string;
  id?: string;
  ticket: string;
  sender: { id: string; name: string; role?: string } | string;
  senderRole: 'USER' | 'EMPLOYEE' | 'ADMIN';
  message?: string | null;
  imageUrl?: string | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface CreateTicketDto {
  subject: string;
  description?: string;
  category?: ChatCategory;
  priority?: ChatPriority;
  relatedVehicle?: string;
  relatedBuyRequest?: string;
}

export interface UpdateTicketDto {
  status?: ChatTicketStatus;
  assignedTo?: string;
  priority?: ChatPriority;
}
