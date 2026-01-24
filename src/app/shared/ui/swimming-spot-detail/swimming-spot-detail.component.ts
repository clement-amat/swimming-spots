import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { StatCardComponent } from '@app/shared/ui/card/stat-card/stat-card.component';
import { TagComponent } from '@app/shared/ui/tag/tag.component';
import { ChipComponent } from '@app/shared/ui/chip/chip.component';
import { WaterQualityChipsColorPipe } from '@app/shared/pipes/water-quality-chips-color.pipe';
import { WaterQualityLabelPipe } from '@app/shared/pipes/water-quality-label.pipe';
import { getSpotLabel } from '@app/shared/tools/spot-label.tool';

@Component({
  selector: 'app-swimming-spot-detail',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    TagComponent,
    ChipComponent,
    WaterQualityChipsColorPipe,
    WaterQualityLabelPipe,
  ],
  templateUrl: './swimming-spot-detail.component.html',
  styleUrl: './swimming-spot-detail.component.css',
})
export class SwimmingSpotDetailComponent {
  swimmingSpot = input<SwimmingSpot | null>(null);

  images = computed(() => (this.swimmingSpot()?.images || []).slice(0, 3));

  spotLabel = computed(() => getSpotLabel(this.swimmingSpot()?.score));
}
