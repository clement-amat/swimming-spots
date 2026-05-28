import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { BASE_URL } from '@app/shared/seo/seo.service';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';
import { ToastService } from '@app/shared/services/toast.service';

@Injectable({ providedIn: 'root' })
export class ShareService {
  private platformId = inject(PLATFORM_ID);
  private analytics = inject(AnalyticsService);
  private toast = inject(ToastService);

  async shareSpot(spot: SwimmingSpot): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = `${BASE_URL}/spot/${spot.slug}`;
    const title = `${spot.name} - Ça Baigne !`;
    const text = `Découvrez ce spot de baignade : ${spot.name}`;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        this.analytics.trackSpotShare(spot, 'native');
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
      }
    }

    await this.copyToClipboard(spot, url);
  }

  private async copyToClipboard(spot: SwimmingSpot, url: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      this.toast.show('Lien copié dans le presse-papier');
      this.analytics.trackSpotShare(spot, 'clipboard');
    } catch {
      this.toast.show('Impossible de copier le lien', 'error');
    }
  }
}
