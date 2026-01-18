import { SwimmingSpot } from "./swimming-spot.model";

export interface SwimmingSpotGeoJSON {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      geometry: {
        type: 'Point';
        coordinates: [number, number];
      };
      properties: SwimmingSpot
    }>;
  }