import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, of } from 'rxjs';
import { SwimmingSpot } from '@models/swimming-spot.model';
import { SwimmingSpotGeoJSON } from '@models/swimming-spot-geojson.model';

@Injectable()
export class SwimmingSpotsService {
  private cachedGeoJSON: SwimmingSpotGeoJSON | null = null;

  constructor(private http: HttpClient) {}

  getSwimmingSpots(): Observable<SwimmingSpotGeoJSON> {
    return this.http
      .get<SwimmingSpotGeoJSON>('/geojson.json')
      .pipe(tap((geoJson) => (this.cachedGeoJSON = geoJson)));
  }

  getSwimmingSpotByCode(code: string): Observable<SwimmingSpot | null> {
    if (this.cachedGeoJSON) {
      const feature = this.cachedGeoJSON.features.find(
        (f) => f.properties.code === code,
      );
      return of(feature ? feature.properties : null);
    }

    return this.getSwimmingSpots().pipe(
      map((geoJSON) => {
        const feature = geoJSON.features.find(
          (f) => f.properties.code === code,
        );
        return feature ? feature.properties : null;
      }),
    );
  }
}
