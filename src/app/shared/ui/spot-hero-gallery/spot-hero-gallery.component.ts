import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { GoogleMapsUrlPipe } from '@app/shared/pipes/google-maps-url.pipe';
import { SpotLocationPipe } from '@app/shared/pipes/spot-location.pipe';
import { SpotWaterQualityChipComponent } from '@app/shared/ui/spot-water-quality-chip/spot-water-quality-chip.component';
import { ShareService } from '@app/shared/services/share.service';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';

@Component({
  selector: 'app-spot-hero-gallery',
  standalone: true,
  imports: [
    CommonModule,
    GoogleMapsUrlPipe,
    SpotLocationPipe,
    SpotWaterQualityChipComponent,
  ],
  templateUrl: './spot-hero-gallery.component.html',
  styleUrl: './spot-hero-gallery.component.css',
})
export class SpotHeroGalleryComponent {
  swimmingSpot = input.required<SwimmingSpot>();

  mainImage = computed(() => this.swimmingSpot().images?.[0] || null);
  secondaryImages = computed(() =>
    (this.swimmingSpot().images || []).slice(1, 3),
  );
  hasImages = computed(() => (this.swimmingSpot().images?.length || 0) > 0);

  private shareService = inject(ShareService);
  private analytics = inject(AnalyticsService);

  shareSpot(): void {
    this.shareService.shareSpot(this.swimmingSpot());
  }

  trackDirections(): void {
    this.analytics.trackSpotDirections(this.swimmingSpot(), 'hero_gallery');
  }
}
