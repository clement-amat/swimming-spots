export enum SwimmingSpotType {
  LAKE = 'Lac',
  RIVER = 'Rivière',
  SEA = 'Mer',
  POND = 'Étang',
  POOL = 'Piscine',
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
