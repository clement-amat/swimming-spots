import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { StatCardComponent } from '@app/shared/ui/card/stat-card/stat-card.component';
import { SpotFacilitiesComponent } from '@app/shared/ui/spot-facilities/spot-facilities.component';
import { GoogleMapsUrlPipe } from '@app/shared/pipes/google-maps-url.pipe';
import { SpotLocationPipe } from '@app/shared/pipes/spot-location.pipe';
import { SpotWaterQualityChipComponent } from '@app/shared/ui/spot-water-quality-chip/spot-water-quality-chip.component';
import { getSpotLabel } from '@app/shared/tools/spot-label.tool';

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
  ],
  templateUrl: './swimming-spot-detail.component.html',
  styleUrl: './swimming-spot-detail.component.css',
})
export class SwimmingSpotDetailComponent {
  swimmingSpot = input<SwimmingSpot | null>(null);

  images = computed(() => (this.swimmingSpot()?.images || []).slice(0, 3));

  spotLabel = computed(() => getSpotLabel(this.swimmingSpot()?.score));
}
