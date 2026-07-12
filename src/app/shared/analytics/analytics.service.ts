import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';

type SpotViewSource = 'overlay' | 'detail_page';
type SpotShareMethod = 'native' | 'clipboard';
type SpotDirectionsSource = 'hero_gallery' | 'detail_card';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  trackSpotView(spot: SwimmingSpot, openFrom: SpotViewSource): void {
    if (!this.isBrowser || typeof window.gtag !== 'function') return;

    window.gtag('event', 'view_spot', {
      slug: spot.slug,
      name: spot.name,
      department: spot.department,
      open_from: openFrom,
    });
  }

  trackSpotShare(spot: SwimmingSpot, method: SpotShareMethod): void {
    if (!this.isBrowser || typeof window.gtag !== 'function') return;

    window.gtag('event', 'share_spot', {
      slug: spot.slug,
      name: spot.name,
      method,
    });
  }

  trackSpotDirections(spot: SwimmingSpot, openFrom: SpotDirectionsSource): void {
    if (!this.isBrowser || typeof window.gtag !== 'function') return;

    window.gtag('event', 'get_directions', {
      slug: spot.slug,
      name: spot.name,
      open_from: openFrom,
    });
  }
}
