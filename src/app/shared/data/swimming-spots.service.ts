import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, shareReplay, catchError, throwError } from 'rxjs';
import { SwimmingSpot } from '@models/swimming-spot.model';
import { SwimmingSpotGeoJSON } from '@models/swimming-spot-geojson.model';

@Injectable({
  providedIn: 'root'
})
export class SwimmingSpotsService {
  private http = inject(HttpClient);
  private geoJSONCache$: Observable<SwimmingSpotGeoJSON> | null = null;

  getSwimmingSpots(): Observable<SwimmingSpotGeoJSON> {
    if (!this.geoJSONCache$) {
      this.geoJSONCache$ = this.http
        .get<SwimmingSpotGeoJSON>('/geojson.json')
        .pipe(
          catchError(this.handleError),
          shareReplay(1)
        );
    }
    return this.geoJSONCache$;
  }

  getSwimmingSpotByCode(code: string): Observable<SwimmingSpot | null> {
    return this.getSwimmingSpots().pipe(
      map((geoJSON) => {
        const feature = geoJSON.features.find(
          (f) => f.properties.code === code,
        );
        return feature ? feature.properties : null;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue lors de la récupération des données';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur (${error.status}): ${error.message}`;
    }
    
    console.error('SwimmingSpotsService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
