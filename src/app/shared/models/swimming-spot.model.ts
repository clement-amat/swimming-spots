export enum SwimmingSpotType {
  LAKE = 'Lac',
  RIVER = 'Rivière',
  COASTAL_WATER = 'Eau côtière',
  TRANSITIONAL_WATER = 'Eau de transition',
}

export interface SwimmingSpot {
  region: string;
  department: string;
  code: string;
  situationUpdate: string;
  name: string;
  insee: string;
  city: string;
  ueDeclarationDate: string;
  type: SwimmingSpotType;
  lng: string;
  lat: string;
}
