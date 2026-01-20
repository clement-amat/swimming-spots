import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface MapCenter {
  lon: number;
  lat: number;
}

@Injectable({
  providedIn: 'root'
})
export class MapControlService {
  private centerMapSubject$ = new Subject<MapCenter>();

  /**
   * Emit coordinates to center the map
   */
  centerMapOn(coordinates: MapCenter): void {
    this.centerMapSubject$.next(coordinates);
  }

  /**
   * Subscribe to map centering events
   */
  onCenterMap(): Observable<MapCenter> {
    return this.centerMapSubject$.asObservable();
  }
}
