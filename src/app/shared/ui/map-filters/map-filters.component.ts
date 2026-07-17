import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapFiltersService } from '@app/shared/services/map-filters.service';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';

@Component({
  selector: 'app-map-filters',
  imports: [CommonModule],
  templateUrl: './map-filters.component.html',
  styleUrl: './map-filters.component.css',
})
export class MapFiltersComponent {
  private filtersService = inject(MapFiltersService);
  private analytics = inject(AnalyticsService);

  filters = this.filtersService.allFilters;

  onFilterClick(filterId: string): void {
    this.filtersService.toggleFilter(filterId);
    this.trackFilterToggle(filterId);
  }

  private trackFilterToggle(filterId: string): void {
    const filter = this.filtersService.allFilters().find((f) => f.id === filterId);
    if (!filter) return;
    this.analytics.trackFilterToggle(
      filterId,
      filter.active,
      this.filtersService.activeFilters().length,
    );
  }
}
