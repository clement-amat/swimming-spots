import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SwimmingSpot } from '@models/swimming-spot.model';
import { SwimmingSpotGeoJSON } from '@models/swimming-spot-geojson.model';

@Injectable()
export class SwimmingSpotsService {
  constructor(private http: HttpClient) {}

  getSwimmingSpots(): Observable<SwimmingSpotGeoJSON> {
    return this.http.get<SwimmingSpotGeoJSON>('/geojson.json');
  }
}
