import { Injectable, signal, computed } from '@angular/core';

export interface MapFilter {
  id: string;
  label: string;
  icon: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class MapFiltersService {
  private filters = signal<MapFilter[]>([
    {
      id: 'comfort',
      label: 'Tout Confort',
      icon: 'shower',
      active: false,
    },
    {
      id: 'wheelchair',
      label: 'Accès PMR',
      icon: 'accessible',
      active: false,
    },
    {
      id: 'lifeguard',
      label: 'Baignade Surveillée',
      icon: 'health_and_safety',
      active: false,
    },
    {
      id: 'dogs',
      label: 'Chiens Admis',
      icon: 'pets',
      active: false,
    },
  ]);

  readonly allFilters = this.filters.asReadonly();
  
  readonly activeFilters = computed(() => 
    this.filters().filter(f => f.active)
  );

  readonly hasActiveFilters = computed(() => 
    this.activeFilters().length > 0
  );

  toggleFilter(filterId: string): void {
    this.filters.update(filters =>
      filters.map(f =>
        f.id === filterId ? { ...f, active: !f.active } : f
      )
    );
  }

  clearAllFilters(): void {
    this.filters.update(filters =>
      filters.map(f => ({ ...f, active: false }))
    );
  }
}
