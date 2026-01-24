import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SwimmingSpot,
  SwimmingSpotType,
} from '@app/shared/models/swimming-spot.model';

@Component({
  selector: 'app-spot-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-about.component.html',
  styleUrl: './spot-about.component.css',
})
export class SpotAboutComponent {
  swimmingSpot = input.required<SwimmingSpot>();

  description = computed(() => {
    const spot = this.swimmingSpot();
    return this.generateDescription(spot);
  });

  private generateDescription(spot: SwimmingSpot): string[] {
    const paragraphs: string[] = [];

    switch (spot.type) {
      case SwimmingSpotType.LAKE:
        paragraphs.push(
          `${spot.name} est un lieu de baignade situé sur un lac dans la commune de ${spot.city}. Ce site offre un cadre naturel agréable pour la baignade et les activités nautiques.`,
        );
        break;
      case SwimmingSpotType.RIVER:
        paragraphs.push(
          `${spot.name} est un site de baignade en rivière situé à ${spot.city}. Ce spot offre une expérience de baignade naturelle dans un environnement fluvial.`,
        );
        break;
      case SwimmingSpotType.COASTAL_WATER:
        paragraphs.push(
          `${spot.name} est une plage située sur le littoral de ${spot.city}. Ce site de baignade en mer offre un accès direct à l'océan.`,
        );
        break;
      case SwimmingSpotType.TRANSITIONAL_WATER:
        paragraphs.push(
          `${spot.name} est un site de baignade situé en eau de transition à ${spot.city}. Ce type de plan d'eau se trouve généralement dans les estuaires ou les lagunes.`,
        );
        break;
      default:
        paragraphs.push(
          `${spot.name} est un lieu de baignade situé à ${spot.city}, dans le département ${spot.department || 'France'}.`,
        );
    }

    // Add second paragraph based on facilities
    if (spot.siteDetails) {
      const features: string[] = [];
      if (spot.siteDetails.lifeguard) {
        features.push('une surveillance par des maîtres-nageurs');
      }
      if (spot.siteDetails.amenities) {
        features.push('des aménagements pour le confort des baigneurs');
      }
      if (spot.siteDetails.wheelchairAccess) {
        features.push("un accès adapté aux personnes à mobilité réduite");
      }

      if (features.length > 0) {
        paragraphs.push(
          `Ce site dispose de ${features.join(', ')}. ${spot.siteDetails.lastWaterQuality ? `La qualité de l'eau est régulièrement contrôlée.` : ''}`,
        );
      }
    }

    return paragraphs;
  }
}
