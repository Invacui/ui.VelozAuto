import type { StatusHistoryEntry, InternalNote } from './buyRequest.types';

export type SellRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTED'
  | 'OFFER_MADE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'NEGOTIATING'
  | 'LISTED'
  | 'CLOSED';

export type SellImageTag =
  | 'FRONT'
  | 'BACK'
  | 'SIDES'
  | 'INTERIOR'
  | 'ODOMETER'
  | 'ENGINE'
  | 'TYRES'
  | 'RC_COPY';

export interface SellRequestImage {
  url: string;
  s3Key?: string;
  tag: SellImageTag;
}

export interface SellRequest {
  _id: string;
  id?: string;
  user?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  city?: string | null;
  pincode?: string | null;
  inspectionSlot?: string | null;
  sellerType?: 'INDIVIDUAL' | 'DEALER';
  expectedPrice?: number | null;

  category?: string | null;
  usageType?: string | null;
  subCategory?: string | null;
  bodyType?: string | null;
  brand?: string | { id: string; name: string } | null;
  brandName?: string;
  model?: string | null;
  variant?: string | null;
  manufacturingYear?: number | null;
  registrationYear?: number | null;
  color?: string | null;
  fuelType?: string | null;
  transmission?: string | null;
  bsNorm?: string | null;
  engineCapacityCc?: number | null;
  powerBhp?: number | null;
  kmDriven?: number | null;
  condition?: string | null;
  ownerCount?: string | null;
  seats?: number | null;
  registrationNumber?: string | null;
  registrationState?: string | null;
  rtoCode?: string | null;
  registrationCity?: string | null;
  registrationType?: string | null;
  rcAvailable?: boolean;
  insuranceType?: string | null;
  insuranceValidTill?: string | null;
  loanStatus?: string | null;
  financierName?: string | null;
  accidentHistory?: string | null;
  floodDamage?: boolean;
  serviceHistoryAvailable?: boolean;
  tyreCondition?: string | null;
  grossVehicleWeightKg?: number | null;
  payloadCapacityKg?: number | null;
  axleConfiguration?: string | null;
  numberOfTyres?: number | null;
  sleepingCapacity?: number | null;
  hasKitchenette?: boolean;
  hasToilet?: boolean;
  description?: string | null;
  images?: SellRequestImage[];

  status: SellRequestStatus;
  offerPrice?: number | null;
  inspectionDate?: string | null;
  inspector?: { id: string; name: string } | string | null;
  rejectionReason?: string | null;
  internalNotes?: InternalNote[];
  statusHistory?: StatusHistoryEntry[];
  listedVehicle?: { id: string; slug: string } | string | null;
  assignedTo?: { id: string; name: string } | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSellRequestDto {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  pincode?: string;
  inspectionSlot?: string;
  sellerType?: string;
  expectedPrice?: number;
  category?: string;
  usageType?: string;
  subCategory?: string;
  bodyType?: string;
  brand?: string;
  brandName?: string;
  model?: string;
  variant?: string;
  manufacturingYear?: number;
  registrationYear?: number;
  color?: string;
  fuelType?: string;
  transmission?: string;
  bsNorm?: string;
  engineCapacityCc?: number;
  powerBhp?: number;
  kmDriven?: number;
  condition?: string;
  ownerCount?: string;
  seats?: number;
  registrationNumber?: string;
  registrationState?: string;
  rtoCode?: string;
  registrationCity?: string;
  registrationType?: string;
  rcAvailable?: boolean;
  insuranceType?: string;
  insuranceValidTill?: string;
  loanStatus?: string;
  financierName?: string;
  accidentHistory?: string;
  floodDamage?: boolean;
  serviceHistoryAvailable?: boolean;
  tyreCondition?: string;
  grossVehicleWeightKg?: number;
  payloadCapacityKg?: number;
  axleConfiguration?: string;
  numberOfTyres?: number;
  sleepingCapacity?: number;
  hasKitchenette?: boolean;
  hasToilet?: boolean;
  description?: string;
  images?: SellRequestImage[];
}

export interface UpdateSellRequestDto {
  status?: SellRequestStatus;
  offerPrice?: number;
  inspectionDate?: string;
  inspector?: string;
  rejectionReason?: string;
  assignedTo?: string;
  internalNote?: string;
  note?: string;
}

export interface ConvertSellRequestDto {
  override?: {
    price?: number;
    status?: string;
    isFeatured?: boolean;
    locationState?: string;
    locationCity?: string;
    locationPincode?: string;
    yardName?: string;
    description?: string;
  };
}

export interface ConvertResult {
  sellRequest: SellRequest;
  vehicle: any;
  slug: string;
}
