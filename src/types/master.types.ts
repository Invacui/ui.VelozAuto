export interface Brand {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  categories?: string[];
  logo?: string | null;
  country?: string | null;
  isActive: boolean;
  sortOrder?: number;
}

export interface BrandInput {
  name: string;
  categories?: string[];
  logo?: string;
  country?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface VehicleModel {
  _id: string;
  id?: string;
  brand: string | { id: string; name: string };
  name: string;
  slug: string;
  category: string;
  bodyTypes?: string[];
  fuelOptions?: string[];
  transmissionOptions?: string[];
  priceRange?: { min?: number; max?: number };
  isActive: boolean;
}

export interface VehicleModelInput {
  brand: string;
  name: string;
  category: string;
  bodyTypes?: string[];
  fuelOptions?: string[];
  transmissionOptions?: string[];
  priceRange?: { min?: number; max?: number };
  isActive?: boolean;
}

export interface CityEntry {
  name: string;
  rtoCodes?: string[];
  pincodePrefix?: string;
}

export interface Location {
  _id: string;
  id?: string;
  state: string;
  stateCode: string;
  cities: CityEntry[];
  isActive: boolean;
}

export interface LocationInput {
  state: string;
  stateCode: string;
  cities?: CityEntry[];
  isActive?: boolean;
}

export interface Feature {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  category: 'SAFETY' | 'COMFORT' | 'EXTERIOR' | 'INTERIOR' | 'TECH' | 'COMMERCIAL';
  applicableCategories?: string[];
  isActive: boolean;
}

export interface FeatureInput {
  name: string;
  category: string;
  applicableCategories?: string[];
  isActive?: boolean;
}
