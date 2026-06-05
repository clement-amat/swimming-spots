import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AutocompleteInputComponent,
  AutocompleteOption,
} from '@app/shared/ui/forms/autocomplete-input/autocomplete-input.component';
import { GeocodingService } from '@app/shared/data/geocoding.service';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import { SwimmingSpotLight } from '@app/shared/models/swimming-spot-light.model';
import { MapControlService } from '@app/shared/maps/map-control.service';
import { ToastComponent } from '@app/shared/ui/toast/toast.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, AutocompleteInputComponent, ToastComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  constructor(
    private geocodingService: GeocodingService,
    private swimmingSpotsService: SwimmingSpotsService,
    private mapControlService: MapControlService,
    private router: Router,
  ) {}

  searchLocations = (query: string): Observable<AutocompleteOption[]> => {
    return forkJoin({
      spots: this.swimmingSpotsService.searchSpotsByName(query, 5),
      cities: this.geocodingService.searchLocations(query),
    }).pipe(
      map(({ spots, cities }) => [
        ...spots.map((spot) => this.spotToOption(spot)),
        ...cities.map((city) => ({
          label: city.label,
          sublabel: this.buildCitySublabel(city.department, city.region),
          icon: 'location_on',
          value: city.coordinates,
          kind: 'city' as const,
        })),
      ]),
    );
  };

  private spotToOption(spot: SwimmingSpotLight): AutocompleteOption {
    return {
      label: spot.name,
      sublabel: [spot.city, spot.department].filter(Boolean).join(' · '),
      icon: 'pool',
      kind: 'spot',
      value: spot,
    };
  }

  private buildCitySublabel(
    department: string | undefined,
    region: string | undefined,
  ): string | undefined {
    const parts = [department, region].filter(Boolean) as string[];
    return parts.length > 0 ? parts.join(' · ') : undefined;
  }

  goHome(): void {
    this.mapControlService.clearMapState();
    this.router.navigate(['/']);
  }

  onLocationSelected(option: AutocompleteOption): void {
    if (option.kind === 'spot') {
      const spot = option.value as SwimmingSpotLight;
      this.router.navigate(['/spot', spot.slug]);
      return;
    }

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
