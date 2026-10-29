import type { VehicleCategory, UsageType, VehicleStatus, OwnerCount } from '@/types/vehicle.types';

export const VEHICLE_CATEGORIES: { value: VehicleCategory; label: string }[] = [
  { value: 'PASSENGER_CAR', label: 'Passenger Car' },
  { value: 'TWO_WHEELER', label: 'Two Wheeler' },
  { value: 'THREE_WHEELER', label: 'Three Wheeler' },
  { value: 'COMMERCIAL', label: 'Commercial Vehicle' },
  { value: 'CARAVAN_MOTORHOME', label: 'Caravan / Motorhome' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  VEHICLE_CATEGORIES.map((c) => [c.value, c.label]),
);

export const USAGE_TYPES: { value: UsageType; label: string }[] = [
  { value: 'PRIVATE', label: 'Private (white plate)' },
  { value: 'COMMERCIAL', label: 'Commercial (yellow plate)' },
];

export const COMMERCIAL_SUBCATEGORIES = [
  'LIGHT_COMMERCIAL',
  'MEDIUM_COMMERCIAL',
  'HEAVY_COMMERCIAL',
  'BUS_MINIBUS',
  'TAXI_CAB',
  'PASSENGER_AUTO',
  'E_RICKSHAW',
  'TRACTOR',
  'CONSTRUCTION_EQUIPMENT',
];

export const BODY_TYPES_BY_CATEGORY: Record<string, string[]> = {
  PASSENGER_CAR: ['HATCHBACK', 'SEDAN', 'SUV', 'MUV', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN'],
  TWO_WHEELER: ['MOTORCYCLE', 'SCOOTER', 'MOPED', 'BICYCLE_EV'],
  THREE_WHEELER: ['PASSENGER_AUTO', 'E_RICKSHAW', 'GOODS_CARRIER'],
  COMMERCIAL: [
    'OPEN_BODY',
    'CLOSED_CONTAINER',
    'TIPPER',
    'TANKER',
    'FLATBED',
    'REFRIGERATED',
    'CAR_CARRIER',
    'TRAILER',
    'CHASSIS_ONLY',
  ],
  CARAVAN_MOTORHOME: ['VANITY_VAN', 'MOTORHOME', 'CAMPER_TRAILER'],
};

export const FUEL_TYPES = ['PETROL', 'DIESEL', 'CNG', 'LPG', 'ELECTRIC', 'HYBRID', 'PETROL_CNG', 'PETROL_LPG'];
export const TRANSMISSIONS = ['MANUAL', 'AUTOMATIC', 'AMT', 'CVT', 'DCT', 'IMT'];
export const BS_NORMS = ['BS3', 'BS4', 'BS6', 'BS6_PHASE_2', 'ELECTRIC_NA'];
export const OWNER_COUNTS: { value: OwnerCount; label: string }[] = [
  { value: '1ST', label: '1st Owner' },
  { value: '2ND', label: '2nd Owner' },
  { value: '3RD', label: '3rd Owner' },
  { value: '4TH_PLUS', label: '4th+ Owner' },
];
export const VEHICLE_STATUSES: { value: VehicleStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'INACTIVE', label: 'Inactive' },
];
export const ROAD_TAX_TYPES = ['LIFETIME', 'PAID_TILL_DATE', 'NOT_PAID'];
export const ACCIDENT_HISTORY = ['NONE', 'MINOR', 'MAJOR'];
export const TYRE_CONDITIONS = ['NEW', 'GOOD', 'AVERAGE', 'NEEDS_REPLACEMENT'];

/** Overall vehicle condition options shown on the streamlined sell form. */
export const VEHICLE_CONDITIONS: { value: string; label: string }[] = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'NEEDS_REPLACEMENT', label: 'Needs work' },
];
export const REGISTRATION_TYPES = ['PRIVATE', 'COMMERCIAL', 'TAXI', 'GOVERNMENT_OTHER'];
export const PERMIT_TYPES = [
  'ALL_INDIA_NATIONAL',
  'STATE',
  'DISTRICT',
  'CONTRACT_CARRIAGE',
  'STAGE_CARRIAGE',
  'GOODS_CARRIAGE',
  'NONE',
];
export const AXLE_CONFIGURATIONS = [
  '2X2', '4X2', '4X4', '6X2', '6X4', '6X6', '8X2', '8X4',
  '10_WHEELER', '12_WHEELER', '14_WHEELER', '16_WHEELER', 'OTHER',
];
export const CABIN_TYPES = ['DAY', 'SLEEPER', 'CREW'];
export const INSPECTION_SLOTS = ['MORNING_9_12', 'AFTERNOON_12_3', 'EVENING_3_6', 'WEEKEND'];

export const BUDGET_RANGES: { value: string; label: string }[] = [
  { value: 'UNDER_2_LAKH', label: 'Under ₹2 Lakh' },
  { value: '2_5_LAKH', label: '₹2 Lakh – ₹5 Lakh' },
  { value: '5_10_LAKH', label: '₹5 Lakh – ₹10 Lakh' },
  { value: '10_20_LAKH', label: '₹10 Lakh – ₹20 Lakh' },
  { value: '20_50_LAKH', label: '₹20 Lakh – ₹50 Lakh' },
  { value: 'ABOVE_50_LAKH', label: 'Above ₹50 Lakh' },
];

export const BUDGET_RANGE_LABELS: Record<string, string> = Object.fromEntries(
  BUDGET_RANGES.map((b) => [b.value, b.label]),
);

export const getBudgetRangeLabel = (value?: string | null): string =>
  value ? BUDGET_RANGE_LABELS[value] ?? value : '';
