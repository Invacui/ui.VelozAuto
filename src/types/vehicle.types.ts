export type VehicleCategory =
  | 'TWO_WHEELER'
  | 'THREE_WHEELER'
  | 'PASSENGER_CAR'
  | 'COMMERCIAL'
  | 'CARAVAN_MOTORHOME';

export type UsageType = 'PRIVATE' | 'COMMERCIAL';
export type VehicleStatus = 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'INACTIVE';
export type OwnerCount = '1ST' | '2ND' | '3RD' | '4TH_PLUS';

export interface VehicleImage {
  _id?: string;
  url: string;
  s3Key?: string | null;
  order?: number;
  isPrimary?: boolean;
  tag?:
    | 'EXTERIOR'
    | 'INTERIOR'
    | 'ENGINE'
    | 'ODOMETER'
    | 'DOCUMENTS'
    | 'TYRES'
    | 'FRONT'
    | 'BACK'
    | 'SIDE';
}

/** Card shape returned by the public list endpoint. */
export interface VehicleCard {
  id: string;
  title: string;
  slug: string;
  category: VehicleCategory;
  usageType: UsageType;
  subCategory?: string | null;
  bodyType?: string | null;
  brandName: string;
  model: string;
  variant?: string | null;
  manufacturingYear: number;
  kmDriven: number;
  fuelType: string;
  transmission: string;
  ownerCount?: OwnerCount | null;
  price: number;
  isPriceNegotiable?: boolean;
  emiStartingFrom?: number | null;
  locationCity?: string | null;
  locationState?: string | null;
  primaryImage?: string | null;
  images?: VehicleImage[];
  status: VehicleStatus;
  isFeatured?: boolean;
  isInspected?: boolean;
  views?: number;
  createdAt?: string;
  createdBy?: string;
  postedBy?: PostedBy | null;
}

export interface PostedBy {
  id: string;
  name: string;
  email: string;
  isVendor: boolean;
  companyName?: string | null;
}

/** Full vehicle shape (public detail: admin-only fields masked). */
export interface Vehicle {
  id: string;
  _id?: string;
  title?: string;
  slug: string;
  category: VehicleCategory;
  usageType: UsageType;
  subCategory?: string | null;
  bodyType?: string | null;
  brand?: string;
  brandName: string;
  model: string;
  variant?: string | null;
  manufacturingYear: number;
  color?: string | null;

  fuelType: string;
  transmission: string;
  bsNorm?: string | null;
  engineCapacityCc?: number | null;
  powerBhp?: number | null;
  torqueNm?: number | null;
  mileageKmpl?: number | null;
  batteryCapacityKwh?: number | null;
  rangeKm?: number | null;

  kmDriven: number;
  ownerCount?: OwnerCount | null;
  seats?: number | null;
  numberOfKeys?: number | null;

  price: number;
  isPriceNegotiable?: boolean;
  emiStartingFrom?: number | null;

  description?: string | null;
  features?: string[];
  highlights?: string[];
  images?: VehicleImage[];
  videoUrl?: string | null;

  status: VehicleStatus;
  isFeatured?: boolean;
  views?: number;

  registrationNumber?: string | null;
  registrationState?: string | null;
  rtoCode?: string | null;
  registrationCity?: string | null;
  registrationType?: string | null;
  rcAvailable?: boolean;
  rcType?: string | null;
  ownershipTransferStatus?: string | null;
  roadTax?: string | null;
  roadTaxValidTill?: string | null;
  permitType?: string | null;
  fastagInstalled?: boolean;
  chassisNumber?: string | null;
  engineNumber?: string | null;
  accidentHistory?: string | null;
  floodDamage?: boolean;
  serviceHistoryAvailable?: boolean;
  lastServiceDate?: string | null;
  tyreCondition?: string | null;
  modifications?: string | null;
  isInspected?: boolean;
  inspectionScore?: number | null;
  inspectionReportUrl?: string | null;
  warrantyMonths?: number | null;
  warrantyKm?: number | null;
  warrantyType?: string | null;

  grossVehicleWeightKg?: number | null;
  payloadCapacityKg?: number | null;
  unladenWeightKg?: number | null;
  axleConfiguration?: string | null;
  numberOfTyres?: number | null;
  wheelbaseMm?: number | null;
  bodyLengthFt?: number | null;
  cabinType?: string | null;
  tankCapacityLitres?: number | null;
  seatingCapacity?: number | null;
  tipperCapacityCubicM?: number | null;
  hasAc?: boolean;
  hasGpsTelematics?: boolean;

  sleepingCapacity?: number | null;
  hasKitchenette?: boolean;
  hasToilet?: boolean;
  hasGenerator?: boolean;
  waterTankLitres?: number | null;
  solarPanel?: boolean;
  awning?: boolean;
  buildType?: string | null;
  rtoModificationApproved?: boolean;
  rtoModificationDetails?: string | null;
  lengthFt?: number | null;
  widthFt?: number | null;
  heightFt?: number | null;

  locationState?: string | null;
  locationCity?: string | null;
  locationPincode?: string | null;
  yardName?: string | null;
  sellerType?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleFiltersMeta {
  brands: { id: string; name: string; categories?: string[] }[];
  fuelTypes: string[];
  transmissions: string[];
  bodyTypes: string[];
  categories: string[];
  subCategories: string[];
  states: string[];
  priceRange?: { min: number; max: number };
  yearRange?: { min: number; max: number };
}

export interface VehicleListParams {
  page?: number;
  limit?: number;
  q?: string;
  category?: VehicleCategory;
  usageType?: UsageType;
  subCategory?: string;
  bodyType?: string;
  brand?: string;
  model?: string;
  fuelType?: string;
  transmission?: string;
  ownerCount?: OwnerCount;
  state?: string;
  city?: string;
  bsNorm?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKm?: number;
  maxKm?: number;
  isInspected?: boolean;
  isFeatured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'km_asc' | 'year_desc';
  status?: VehicleStatus;
}
