import { Pipe, PipeTransform } from '@angular/core';
import { WaterQuality } from '@app/shared/models/swimming-spot.model';

type ChipColor = 'green' | 'yellow' | 'orange';

@Pipe({
  name: 'waterQualityChipsColor',
  standalone: true,
})
export class WaterQualityChipsColorPipe implements PipeTransform {
  transform(quality: WaterQuality | undefined | null): ChipColor {
    switch (quality) {
      case WaterQuality.MOYEN:
        return 'yellow';
      case WaterQuality.MAUVAIS:
        return 'orange';
      case WaterQuality.EXCELLENT:
      case WaterQuality.BON:
      default:
        return 'green';
    }
  }
}
