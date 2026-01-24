import { Pipe, PipeTransform } from '@angular/core';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';

@Pipe({
  name: 'googleMapsUrl',
  standalone: true,
})
export class GoogleMapsUrlPipe implements PipeTransform {
  transform(spot: SwimmingSpot): string {
    return `https://www.google.com/maps?q=${spot.lat},${spot.lng}`;
  }
}
