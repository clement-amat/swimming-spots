import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NearbySpotRef } from '@app/shared/models/swimming-spot.model';

export type SpotNearbyVariant = 'page' | 'drawer';

@Component({
  selector: 'app-spot-nearby',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './spot-nearby.component.html',
})
export class SpotNearbyComponent {
  spots = input.required<NearbySpotRef[] | undefined>();
  variant = input<SpotNearbyVariant>('page');
  maxCount = input(8);

  displayed = computed(() => (this.spots() ?? []).slice(0, this.maxCount()));
}
