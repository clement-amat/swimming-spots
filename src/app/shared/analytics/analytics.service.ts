import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';

type SpotViewSource = 'overlay' | 'detail_page';
type SpotShareMethod = 'native' | 'clipboard';
type SpotDirectionsSource = 'hero_gallery' | 'detail_card';
type SearchOutcome = 'selected' | 'abandoned';
type SearchResultType = 'spot' | 'city';
type NearbyVariant = 'page' | 'drawer';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  trackSpotView(spot: SwimmingSpot, openFrom: SpotViewSource, mapZoom?: number): void {
    this.send('view_spot', {
      slug: spot.slug,
      name: spot.name,
      department: spot.department,
      open_from: openFrom,
      map_zoom: mapZoom,
    });
  }

  trackSpotShare(spot: SwimmingSpot, method: SpotShareMethod): void {
    this.send('share_spot', {
      slug: spot.slug,
      name: spot.name,
      method,
    });
  }

  trackSpotDirections(spot: SwimmingSpot, openFrom: SpotDirectionsSource): void {
    this.send('get_directions', {
      slug: spot.slug,
      name: spot.name,
      open_from: openFrom,
    });
  }

  trackFilterToggle(filterId: string, active: boolean, activeCount: number): void {
    this.send('filter_toggle', {
      filter_id: filterId,
      active,
      active_count: activeCount,
    });
  }

  trackSearch(
    term: string,
    resultsCount: number,
    outcome: SearchOutcome,
    resultType?: SearchResultType,
  ): void {
    this.send('search', {
      search_term: term,
      results_count: resultsCount,
      outcome,
      result_type: resultType,
    });
  }

  trackNearbySpotClick(
    fromSlug: string | undefined,
    toSlug: string,
    position: number,
    variant: NearbyVariant,
  ): void {
    this.send('nearby_spot_click', {
      from_slug: fromSlug,
      to_slug: toSlug,
      position,
      variant,
    });
  }

  private send(eventName: string, params: Record<string, unknown>): void {
    if (!this.isBrowser || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
  }
}
