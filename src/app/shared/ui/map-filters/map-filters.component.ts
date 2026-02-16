import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapFiltersService } from '@app/shared/services/map-filters.service';

@Component({
  selector: 'app-map-filters',
  imports: [CommonModule],
  templateUrl: './map-filters.component.html',
  styleUrl: './map-filters.component.css',
})
export class MapFiltersComponent {
  private filtersService = inject(MapFiltersService);

  filters = this.filtersService.allFilters;

  onFilterClick(filterId: string): void {
    this.filtersService.toggleFilter(filterId);
  }
}
