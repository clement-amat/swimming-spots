import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SwimmingSpot,
  SwimmingSpotImage,
} from '@app/shared/models/swimming-spot.model';
import { StatCardComponent } from '@app/shared/ui/card/stat-card/stat-card.component';
import { TagComponent } from '@app/shared/ui/tag/tag.component';
import { ChipComponent } from '@app/shared/ui/chip/chip.component';
import { WaterQualityChipsColorPipe } from '@app/shared/pipes/water-quality-chips-color.pipe';
import { WaterQualityLabelPipe } from '@app/shared/pipes/water-quality-label.pipe';

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
  @Input() swimmingSpot: SwimmingSpot | null = null;

  get images(): SwimmingSpotImage[] {
    return (this.swimmingSpot?.images || []).slice(0, 3);
  }
}
