export interface GeocodingResult {
  label: string;
  coordinates: {
    lon: number;
    lat: number;
  };
  type: string;
}

export interface GeopfApiResponse {
  type: string;
  version: string;
  features: GeopfFeature[];
  attribution: string;
  licence: string;
  query: string;
  limit: number;
}

export interface GeopfFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
  properties: {
    label: string;
    score: number;
    housenumber?: string;
    id: string;
    type: string;
    name?: string;
    postcode?: string;
    citycode?: string;
    x: number;
    y: number;
    city?: string;
    context?: string;
    importance: number;
    street?: string;
  };
}
