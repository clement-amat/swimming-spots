import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { SwimmingSpotsService } from './swimming-spots.service';
import { SwimmingSpot } from '@models/swimming-spot.model';

export interface SwimmingSpotGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
    properties: {
      id: string;
      name: string;
      type: string;
      city: string;
      region: string;
      lat: string;
      lng: string;
    };
  }>;
}

@Injectable()
export class SwimmingSpotMapService {
  constructor(private swimmingSpotsService: SwimmingSpotsService) {}

  getSwimmingSpotsGeoJSON(): Observable<SwimmingSpotGeoJSON> {
    return this.swimmingSpotsService
      .getSwimmingSpots()
      .pipe(map((spots) => this.transformToGeoJSON(spots)));
  }

  private transformToGeoJSON(spots: SwimmingSpot[]): SwimmingSpotGeoJSON {
    // Filtrer les points avec des coordonnées valides
    const validSpots = spots.filter((spot) => {
      const lngStr = spot.lng.replace(',', '.');
      const latStr = spot.lat.replace(',', '.');

      const lng = parseFloat(lngStr);
      const lat = parseFloat(latStr);
      return !isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0;
    });

    return {
      type: 'FeatureCollection',
      features: validSpots.map((spot) => {
        const lngStr = spot.lng.replace(',', '.');
        const latStr = spot.lat.replace(',', '.');

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [parseFloat(lngStr), parseFloat(latStr)],
          },
          properties: {
            id: spot.code,
            name: spot.name,
            type: spot.type,
            city: spot.city,
            region: spot.region,
            lat: latStr,
            lng: lngStr,
          },
        };
      }),
    };
  }
}
