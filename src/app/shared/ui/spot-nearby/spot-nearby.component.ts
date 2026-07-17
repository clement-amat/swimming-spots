import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NearbySpotRef } from '@app/shared/models/swimming-spot.model';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';

export type SpotNearbyVariant = 'page' | 'drawer';

@Component({
  selector: 'app-spot-nearby',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './spot-nearby.component.html',
})
export class SpotNearbyComponent {
  private analytics = inject(AnalyticsService);

  spots = input.required<NearbySpotRef[] | undefined>();
  variant = input<SpotNearbyVariant>('page');
  maxCount = input(8);
  fromSlug = input<string>();

  displayed = computed(() => (this.spots() ?? []).slice(0, this.maxCount()));

  onSpotClick(spot: NearbySpotRef, position: number): void {
    this.analytics.trackNearbySpotClick(this.fromSlug(), spot.slug, position, this.variant());
  }
}
