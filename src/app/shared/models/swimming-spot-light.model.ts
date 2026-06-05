import { SwimmingSpotType } from './swimming-spot.model';

export interface SwimmingSpotLight {
  slug: string;
  name: string;
  city: string;
  department: string;
  type: SwimmingSpotType;
  score: number;
  comfort: boolean;
  wheelchair: boolean;
  lifeguard: boolean;
  dogs: boolean;
}

export interface SwimmingSpotLightFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: SwimmingSpotLight;
}

export interface SwimmingSpotLightGeoJSON {
  type: 'FeatureCollection';
  features: SwimmingSpotLightFeature[];
}
