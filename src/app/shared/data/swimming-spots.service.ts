import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SwimmingSpot } from '@models/swimming-spot.model';

@Injectable()
export class SwimmingSpotsService {
  constructor(private http: HttpClient) {}

  getSwimmingSpots(): Observable<SwimmingSpot[]> {
    return this.http.get<SwimmingSpot[]>('/swimming-spots.json');
  }
}
