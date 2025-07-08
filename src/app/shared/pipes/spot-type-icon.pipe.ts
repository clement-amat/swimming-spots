import { Pipe, PipeTransform } from '@angular/core';
import { SwimmingSpotType } from '@app/shared/models/swimming-spot.model';

@Pipe({
  name: 'spotTypeIcon',
  standalone: true
})
export class SpotTypeIconPipe implements PipeTransform {
  transform(type: SwimmingSpotType): string {
    switch (type) {
      case SwimmingSpotType.RIVER:
        return '🏞️';
      case SwimmingSpotType.LAKE:
        return '🏊‍♀️';
      case SwimmingSpotType.COASTAL_WATER:
        return '🏖️';
      case SwimmingSpotType.TRANSITIONAL_WATER:
        return '💧';
      default:
        return '💧';
    }
  }
} 