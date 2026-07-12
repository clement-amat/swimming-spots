export enum SwimmingSpotType {
  LAKE = 'Lac',
  RIVER = 'Rivière',
  COASTAL_WATER = 'Eau côtière',
  TRANSITIONAL_WATER = 'Eau de transition',
}

export enum WaterQuality {
  EXCELLENT = 'Excellent',
  BON = 'Bon',
  MOYEN = 'Moyen',
  MAUVAIS = 'Mauvais',
}

export interface SwimmingSpotImage {
  url: string;
  thumbUrl?: string;
  title: string;
  description: string;
  license: string;
  score: number;
}

export interface SiteDetails {
  surveillance?: boolean;
  amenities?: boolean;
  animalsAllowed?: boolean;
  showers?: boolean;
  drinkingWater?: boolean;
  wheelchairAccess?: boolean;
  toilets?: boolean;
  lifeguard?: boolean;
  seasonStart?: string;
  seasonEnd?: string;
  lastWaterQuality?: WaterQuality;
  lastTestDate?: string;
}

export interface NearbySpotRef {
  slug: string;
  name: string;
  city: string;
  department?: string;
  type: SwimmingSpotType | string;
  distanceKm: number;
  score?: number;
  lastWaterQuality?: WaterQuality | string | null;
  thumbUrl?: string;
}

export interface SwimmingSpot {
  region: string;
  department: string;
  code: string;
  slug: string;
  situationUpdate: string;
  name: string;
  insee: string;
  city: string;
  ueDeclarationDate: string;
  type: SwimmingSpotType;
  lng: string;
  lat: string;
  score?: number;
  images?: SwimmingSpotImage[];
  siteDetails?: SiteDetails;
  nearbySpots?: NearbySpotRef[];
}
