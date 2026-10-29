import type { VehicleCard } from './vehicle.types';

export type BuyRequestStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'TEST_DRIVE_SCHEDULED'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export type BudgetRange =
  | 'UNDER_2_LAKH'
  | '2_5_LAKH'
  | '5_10_LAKH'
  | '10_20_LAKH'
  | '20_50_LAKH'
  | 'ABOVE_50_LAKH';

export interface StatusHistoryEntry {
  from?: string | null;
  to: string;
  note?: string | null;
  by?: string | null;
  at: string;
}

export interface InternalNote {
  author?: string | null;
  note: string;
  at: string;
}

export interface BuyRequest {
  _id: string;
  id?: string;
  vehicle: VehicleCard | string;
  user?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  budget?: BudgetRange | null;
  needsFinance?: boolean;
  wantsTestDrive?: boolean;
  testDriveDate?: string | null;
  hasExchangeVehicle?: boolean;
  exchangeDetails?: string | null;
  message?: string | null;
  status: BuyRequestStatus;
  assignedTo?: { id: string; name: string } | string | null;
  statusHistory?: StatusHistoryEntry[];
  internalNotes?: InternalNote[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBuyRequestDto {
  vehicle: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  budget?: BudgetRange;
  needsFinance?: boolean;
  wantsTestDrive?: boolean;
  testDriveDate?: string;
  hasExchangeVehicle?: boolean;
  exchangeDetails?: string;
  message?: string;
}

export interface UpdateBuyRequestDto {
  status?: BuyRequestStatus;
  assignedTo?: string;
  note?: string;
  internalNote?: string;
}
