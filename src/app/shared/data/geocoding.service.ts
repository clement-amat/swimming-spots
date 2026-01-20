import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GeocodingResult, GeopfApiResponse } from '@app/shared/models/geocoding.model';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly API_URL = 'https://data.geopf.fr/geocodage/search';

  constructor(private http: HttpClient) {}

  searchLocations(query: string): Observable<GeocodingResult[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', query.trim())
      .set('limit', '10')
      .set('type', 'municipality');

    return this.http.get<GeopfApiResponse>(this.API_URL, { params }).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => {
        console.error('Error fetching geocoding results:', error);
        return of([]);
      })
    );
  }

  private transformResponse(response: GeopfApiResponse): GeocodingResult[] {
    if (!response.features || response.features.length === 0) {
      return [];
    }

    return response.features.map(feature => ({
      label: feature.properties.label,
      coordinates: {
        lon: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1]
      },
      type: feature.properties.type
    }));
  }
}
