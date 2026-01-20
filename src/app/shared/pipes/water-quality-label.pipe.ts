import { Pipe, PipeTransform } from '@angular/core';
import { WaterQuality } from '@app/shared/models/swimming-spot.model';

@Pipe({
  name: 'waterQualityLabel',
  standalone: true,
})
export class WaterQualityLabelPipe implements PipeTransform {
  transform(quality: WaterQuality | undefined | null): string {
    switch (quality) {
      case WaterQuality.MOYEN:
        return 'Moyenne'
      case WaterQuality.MAUVAIS:
        return 'Mauvaise'
      case WaterQuality.EXCELLENT:
        return 'Excellente'
      case WaterQuality.BON:
        return 'Bonne';
      default:
        return 'Non disponible';
    }
  }
}
