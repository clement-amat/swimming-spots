import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingPageSpot } from '@models/landing-page.model';
import { SpotImageDirective } from '@app/shared/ui/spot-image/spot-image.directive';

@Component({
  selector: 'app-landing-spot-card',
  standalone: true,
  imports: [RouterLink, SpotImageDirective],
  templateUrl: './landing-spot-card.component.html',
})
export class LandingSpotCardComponent {
  spot = input.required<LandingPageSpot>();
  index = input.required<number>();

  get spotNumber(): string {
    return (this.index() + 1).toString().padStart(2, '0');
  }
}
