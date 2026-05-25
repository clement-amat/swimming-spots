import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SiteDetails,
  SwimmingSpot,
  SwimmingSpotType,
  WaterQuality,
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
    const sentences = [
      this.buildLocationSentence(spot),
      this.buildFacilitiesSentence(spot.siteDetails),
      this.buildWaterQualitySentence(spot),
    ].filter((sentence): sentence is string => Boolean(sentence));
    return sentences.length > 0 ? [sentences.join(' ')] : [];
  });

  private buildLocationSentence(spot: SwimmingSpot): string {
    const opener = this.buildLocationOpener(spot);
    const region = spot.region ? `, dans la région ${spot.region}` : '';
    return `${opener} à ${spot.city}${region}.`;
  }

  private buildLocationOpener(spot: SwimmingSpot): string {
    switch (spot.type) {
      case SwimmingSpotType.LAKE:
        return `${spot.name}, plan d'eau de baignade`;
      case SwimmingSpotType.RIVER:
        return `${spot.name}, baignade en rivière`;
      case SwimmingSpotType.COASTAL_WATER:
        return `${spot.name}, plage du littoral`;
      case SwimmingSpotType.TRANSITIONAL_WATER:
        return `${spot.name}, baignade en eau de transition (estuaire ou lagune)`;
      default:
        return `${spot.name}, site de baignade`;
    }
  }

  private buildFacilitiesSentence(details: SiteDetails | undefined): string | null {
    if (!details) return null;

    const parts: string[] = [];

    const surveillance = this.buildSurveillancePhrase(details);
    if (surveillance) parts.push(surveillance);

    const equipment = this.buildEquipmentPhrase(details);
    if (equipment) parts.push(equipment);

    const access = this.buildAccessPhrase(details);
    if (access) parts.push(access);

    if (parts.length === 0) return null;

    return `${this.capitalize(parts.join(', '))}.`;
  }

  private buildSurveillancePhrase(details: SiteDetails): string | null {
    const season = this.formatSeason(details.seasonStart, details.seasonEnd);

    if (details.lifeguard || details.surveillance) {
      return season ? `baignade surveillée ${season}` : 'baignade surveillée en saison';
    }
    if (details.surveillance === false || details.lifeguard === false) {
      return 'baignade non surveillée';
    }
    return null;
  }

  private buildEquipmentPhrase(details: SiteDetails): string | null {
    const items: string[] = [];
    if (details.showers) items.push('douches');
    if (details.toilets) items.push('WC');
    if (details.drinkingWater) items.push("point d'eau potable");
    if (details.amenities) items.push('aménagements');

    if (items.length === 0) return null;
    return `équipée de ${this.joinFrench(items)}`;
  }

  private buildAccessPhrase(details: SiteDetails): string | null {
    const flags: string[] = [];
    if (details.wheelchairAccess) flags.push('accessible aux personnes à mobilité réduite');
    if (details.animalsAllowed) flags.push('chiens autorisés');
    if (flags.length === 0) return null;
    return this.joinFrench(flags);
  }

  private buildWaterQualitySentence(spot: SwimmingSpot): string | null {
    const quality = spot.siteDetails?.lastWaterQuality;
    if (!quality) return null;

    const adjective = this.qualityAdjective(quality);
    const ars = spot.region ? `l'ARS ${spot.region}` : 'l\'Agence Régionale de Santé';
    const date = this.formatTestDate(spot.siteDetails?.lastTestDate);
    const dateClause = date ? ` (${date})` : '';

    return `Qualité de l'eau classée ${adjective} lors du dernier contrôle de ${ars}${dateClause}.`;
  }

  private qualityAdjective(quality: WaterQuality): string {
    switch (quality) {
      case WaterQuality.EXCELLENT:
        return 'excellente';
      case WaterQuality.BON:
        return 'bonne';
      case WaterQuality.MOYEN:
        return 'suffisante';
      case WaterQuality.MAUVAIS:
        return 'insuffisante';
    }
  }

  private formatSeason(start: string | undefined, end: string | undefined): string | null {
    const startLabel = this.formatDayMonth(start);
    const endLabel = this.formatDayMonth(end);
    if (startLabel && endLabel) return `du ${startLabel} au ${endLabel}`;
    if (startLabel) return `à partir du ${startLabel}`;
    if (endLabel) return `jusqu'au ${endLabel}`;
    return null;
  }

  private formatDayMonth(value: string | undefined): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const day = date.getUTCDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'long', timeZone: 'UTC' });
    return `${day === 1 ? '1er' : day} ${month}`;
  }

  private formatTestDate(value: string | undefined): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }

  private joinFrench(items: string[]): string {
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return `${items[0]} et ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} et ${items.at(-1)}`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
