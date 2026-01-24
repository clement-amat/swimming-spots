import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AutocompleteInputComponent,
  AutocompleteOption,
} from '@app/shared/ui/forms/autocomplete-input/autocomplete-input.component';
import { GeocodingService } from '@app/shared/data/geocoding.service';
import { MapControlService } from '@app/shared/maps/map-control.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, AutocompleteInputComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  constructor(
    private geocodingService: GeocodingService,
    private mapControlService: MapControlService,
    private router: Router,
  ) {}

  searchLocations = (query: string): Observable<AutocompleteOption[]> => {
    return this.geocodingService.searchLocations(query).pipe(
      map((results) =>
        results.map((result) => ({
          label: result.label,
          icon: 'location_on',
          value: result.coordinates,
        })),
      ),
    );
  };

  onLocationSelected(option: AutocompleteOption): void {
    const coordinates = option.value;

    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        this.mapControlService.whenMapReady().subscribe(() => {
          this.mapControlService.centerMapOn(coordinates);
        });
      });
    } else {
      this.mapControlService.centerMapOn(coordinates);
    }
  }
}
