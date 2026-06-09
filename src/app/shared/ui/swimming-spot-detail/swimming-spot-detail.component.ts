import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { StatCardComponent } from '@app/shared/ui/card/stat-card/stat-card.component';
import { SpotFacilitiesComponent } from '@app/shared/ui/spot-facilities/spot-facilities.component';
import { GoogleMapsUrlPipe } from '@app/shared/pipes/google-maps-url.pipe';
import { SpotLocationPipe } from '@app/shared/pipes/spot-location.pipe';
import { SpotWaterQualityChipComponent } from '@app/shared/ui/spot-water-quality-chip/spot-water-quality-chip.component';
import { getSpotLabel } from '@app/shared/tools/spot-label.tool';
import { ShareService } from '@app/shared/services/share.service';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';
import { SpotImageDirective } from '@app/shared/ui/spot-image/spot-image.directive';

@Component({
  selector: 'app-swimming-spot-detail',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    SpotFacilitiesComponent,
    GoogleMapsUrlPipe,
    SpotLocationPipe,
    SpotWaterQualityChipComponent,
    SpotImageDirective,
  ],
  templateUrl: './swimming-spot-detail.component.html',
  styleUrl: './swimming-spot-detail.component.css',
})
export class SwimmingSpotDetailComponent {
  swimmingSpot = input<SwimmingSpot | null>(null);

  images = computed(() => (this.swimmingSpot()?.images || []).slice(0, 3));

  spotLabel = computed(() => getSpotLabel(this.swimmingSpot()?.score));

  private shareService = inject(ShareService);
  private analytics = inject(AnalyticsService);

  constructor(private router: Router) {}

  navigateToGallery(): void {
    const spot = this.swimmingSpot();
    if (spot?.slug) {
      this.router.navigate(['/spot', spot.slug, 'gallery'], {
        state: { swimmingSpot: spot }
      });
    }
  }

  shareSpot(): void {
    const spot = this.swimmingSpot();
    if (spot) {
      this.shareService.shareSpot(spot);
    }
  }

  trackDirections(): void {
    const spot = this.swimmingSpot();
    if (spot) {
      this.analytics.trackSpotDirections(spot, 'detail_card');
    }
  }
}
