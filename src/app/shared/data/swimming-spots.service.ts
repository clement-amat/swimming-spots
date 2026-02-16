import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, of, shareReplay, catchError, throwError } from 'rxjs';
import { SwimmingSpot, SiteDetails } from '@models/swimming-spot.model';
import { SwimmingSpotGeoJSON } from '@models/swimming-spot-geojson.model';
import { MapFilter } from '@app/shared/services/map-filters.service';

@Injectable({
  providedIn: 'root',
})
export class SwimmingSpotsService {
  private http = inject(HttpClient);
  private geoJSONCache$: Observable<SwimmingSpotGeoJSON> | null = null;

  getSwimmingSpots(): Observable<SwimmingSpotGeoJSON> {
    if (!this.geoJSONCache$) {
      this.geoJSONCache$ = this.http
        .get<SwimmingSpotGeoJSON>('/geojson.json')
        .pipe(catchError(this.handleError), shareReplay(1));
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
      catchError(this.handleError),
    );
  }

  filteredGeoJSON(
    geoJSON: SwimmingSpotGeoJSON,
    activeFilters: MapFilter[],
  ): SwimmingSpotGeoJSON {
    if (activeFilters.length === 0) {
      return geoJSON;
    }

    return {
      ...geoJSON,
      features: geoJSON.features.filter((feature) => {
        const siteDetails = this.parseSiteDetails(
          feature.properties.siteDetails,
        );

        if (!siteDetails) return false;

        return activeFilters.every((filter) =>
          this.matchesFilter(filter.id, siteDetails),
        );
      }),
    };
  }

  private parseSiteDetails(siteDetails: any): SiteDetails | null {
    if (!siteDetails) return null;

    return typeof siteDetails === 'string'
      ? JSON.parse(siteDetails)
      : siteDetails;
  }

  private matchesFilter(filterId: string, siteDetails: SiteDetails): boolean {
    switch (filterId) {
      case 'comfort':
        return !!siteDetails.toilets && !!siteDetails.showers;
      case 'wheelchair':
        return !!siteDetails.wheelchairAccess;
      case 'lifeguard':
        return !!siteDetails.surveillance || !!siteDetails.lifeguard;
      case 'dogs':
        return !!siteDetails.animalsAllowed;
      default:
        return true;
    }
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
