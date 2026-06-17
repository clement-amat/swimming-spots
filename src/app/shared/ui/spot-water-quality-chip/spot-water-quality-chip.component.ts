import { Component, computed, input } from '@angular/core';
import { WaterQuality } from '@app/shared/models/swimming-spot.model';
import { ChipComponent } from '@app/shared/ui/chip/chip.component';
import { WaterQualityChipsColorPipe } from '@app/shared/pipes/water-quality-chips-color.pipe';
import { WaterQualityLabelPipe } from '@app/shared/pipes/water-quality-label.pipe';

@Component({
  selector: 'app-spot-water-quality-chip',
  standalone: true,
  imports: [ChipComponent, WaterQualityChipsColorPipe, WaterQualityLabelPipe],
  template: `
    @if (testYear()) {
      <app-chip [color]="quality() | waterQualityChipsColor">
        Qualité de l'eau: {{ quality() | waterQualityLabel }} ({{ testYear() }})
      </app-chip>
    }
  `,
})
export class SpotWaterQualityChipComponent {
  quality = input<WaterQuality | undefined>();
  lastTestDate = input<string | undefined>();

  testYear = computed(() => {
    const value = this.lastTestDate();
    if (!value) return null;
    const year = new Date(value).getUTCFullYear();
    return Number.isNaN(year) ? null : year;
  });
}
