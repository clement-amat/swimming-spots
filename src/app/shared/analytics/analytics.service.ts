import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';

type SpotViewSource = 'overlay' | 'detail_page';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  trackSpotView(spot: SwimmingSpot, source: SpotViewSource): void {
    if (!this.isBrowser || typeof window.gtag !== 'function') return;

    window.gtag('event', 'view_spot', {
      slug: spot.slug,
      name: spot.name,
      department: spot.department,
      source,
    });
  }
}
