import { Pipe, PipeTransform } from '@angular/core';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';

@Pipe({
  name: 'spotLocation',
  standalone: true,
})
export class SpotLocationPipe implements PipeTransform {
  transform(spot: SwimmingSpot, includeFrance = false): string {
    const location = `${spot.city}${spot.department ? ', ' + spot.department : ''}`;
    return includeFrance ? `${location}, France` : location;
  }
}
