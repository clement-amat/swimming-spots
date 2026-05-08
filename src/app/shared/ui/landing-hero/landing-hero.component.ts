import { Component, input } from '@angular/core';
import { LandingPageHero } from '@models/landing-page.model';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  templateUrl: './landing-hero.component.html',
})
export class LandingHeroComponent {
  hero = input.required<LandingPageHero>();
}
