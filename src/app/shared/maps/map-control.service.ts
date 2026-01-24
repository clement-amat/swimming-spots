import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject, Observable, filter, take } from 'rxjs';

export interface MapCenter {
  lon: number;
  lat: number;
}

@Injectable({
  providedIn: 'root',
})
export class MapControlService {
  private centerMapSubject$ = new Subject<MapCenter>();
  private mapReadySubject$ = new BehaviorSubject<boolean>(false);

  centerMapOn(coordinates: MapCenter): void {
    this.centerMapSubject$.next(coordinates);
  }

  onCenterMap(): Observable<MapCenter> {
    return this.centerMapSubject$.asObservable();
  }

  setMapReady(ready: boolean): void {
    this.mapReadySubject$.next(ready);
  }

  isMapReady(): boolean {
    return this.mapReadySubject$.getValue();
  }

  whenMapReady(): Observable<boolean> {
    return this.mapReadySubject$.pipe(
      filter((ready) => ready),
      take(1),
    );
  }
}
