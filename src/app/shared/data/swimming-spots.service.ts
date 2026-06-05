import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, shareReplay, catchError, throwError } from 'rxjs';
import { SwimmingSpot } from '@models/swimming-spot.model';
import {
  SwimmingSpotLight,
  SwimmingSpotLightGeoJSON,
} from '@models/swimming-spot-light.model';

@Injectable({
  providedIn: 'root',
})
export class SwimmingSpotsService {
  private http = inject(HttpClient);
  private lightGeoJSONCache$: Observable<SwimmingSpotLightGeoJSON> | null =
    null;

  getSwimmingSpots(): Observable<SwimmingSpotLightGeoJSON> {
    if (!this.lightGeoJSONCache$) {
      this.lightGeoJSONCache$ = this.http
        .get<SwimmingSpotLightGeoJSON>('/spots-light.geojson')
        .pipe(catchError(this.handleError), shareReplay(1));
    }
    return this.lightGeoJSONCache$;
  }

  getSwimmingSpotBySlug(slug: string): Observable<SwimmingSpot | null> {
    return this.http.get<SwimmingSpot>(`/spots/${slug}.json`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of(null);
        }
        return this.handleError(error);
      }),
    );
  }

  searchSpotsByName(query: string, limit = 5): Observable<SwimmingSpotLight[]> {
    const normalized = this.normalize(query);
    if (normalized.length < 2) {
      return of([]);
    }

    return this.getSwimmingSpots().pipe(
      map((geoJSON) => {
        const matches: Array<{ spot: SwimmingSpotLight; rank: number }> = [];
        for (const feature of geoJSON.features) {
          const spot = feature.properties;
          const rank = this.matchRank(normalized, spot);
          if (rank > 0) {
            matches.push({ spot, rank });
          }
        }

        return matches
          .sort(
            (a, b) =>
              b.rank - a.rank || a.spot.name.localeCompare(b.spot.name, 'fr'),
          )
          .slice(0, limit)
          .map((m) => m.spot);
      }),
      catchError(() => of([] as SwimmingSpotLight[])),
    );
  }

  private matchRank(
    normalizedQuery: string,
    spot: SwimmingSpotLight,
  ): number {
    const name = this.normalize(spot.name);
    if (name.startsWith(normalizedQuery)) return 2;
    if (name.includes(normalizedQuery)) return 1;
    return 0;
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage =
      'Une erreur est survenue lors de la récupération des données';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      errorMessage = `Erreur serveur (${error.status}): ${error.message}`;
    }

    console.error('SwimmingSpotsService error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
