import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  signal,
  inject,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { SeoService } from '@app/shared/seo/seo.service';
import { SwimmingSpotDetailComponent } from '@app/shared/ui/swimming-spot-detail/swimming-spot-detail.component';
import { SpotHeroGalleryComponent } from '@app/shared/ui/spot-hero-gallery/spot-hero-gallery.component';
import { SpotFacilitiesComponent } from '@app/shared/ui/spot-facilities/spot-facilities.component';
import { SpotAboutComponent } from '@app/shared/ui/spot-about/spot-about.component';
import { SpotGalleryPreviewComponent } from '@app/shared/ui/spot-gallery/spot-gallery-preview.component';
import { SpotMapCardComponent } from '@app/shared/ui/spot-map-card/spot-map-card.component';

@Component({
  selector: 'app-spot-detail',
  standalone: true,
  imports: [
    CommonModule,
    SwimmingSpotDetailComponent,
    SpotHeroGalleryComponent,
    SpotFacilitiesComponent,
    SpotAboutComponent,
    SpotGalleryPreviewComponent,
    SpotMapCardComponent,
  ],
  providers: [SeoService],
  templateUrl: './spot-detail.component.html',
  styleUrl: './spot-detail.component.css',
})
export class SpotDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private swimmingSpotsService = inject(SwimmingSpotsService);
  private seoService = inject(SeoService);
  private breakpointObserver = inject(BreakpointObserver);

  swimmingSpot = signal<SwimmingSpot | null>(null);
  loading = signal(true);

  isDesktop = toSignal(
    this.breakpointObserver
      .observe('(min-width: 768px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');

    if (!code) {
      this.loading.set(false);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const navigationState = history.state;
      if (navigationState?.swimmingSpot) {
        this.swimmingSpot.set(navigationState.swimmingSpot);
        this.applySpotSeo(navigationState.swimmingSpot);
        this.loading.set(false);
        return;
      }
    }

    this.swimmingSpotsService.getSwimmingSpotByCode(code).subscribe({
      next: (spot) => {
        this.swimmingSpot.set(spot);
        if (spot) {
          this.applySpotSeo(spot);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du spot:', error);
        this.loading.set(false);
      },
    });
  }

  private applySpotSeo(spot: SwimmingSpot): void {
    const description = this.buildSpotDescription(spot);

    this.seoService.setTitle(`${spot.name} - Baignade à ${spot.city} (${spot.department}) | Ça Baigne !`);
    this.seoService.setMetaData({
      description,
      canonicalUrl: `https://ca-baigne.com/spot/${spot.code}`,
      image: spot.images?.[0]?.url,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: spot.name,
        description,
        url: `https://ca-baigne.com/spot/${spot.code}`,
        geo: {
          '@type': 'GeoCoordinates',
          latitude: spot.lat,
          longitude: spot.lng,
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: spot.city,
          addressRegion: spot.region,
          addressCountry: 'FR',
        },
        ...(spot.images?.[0] && { image: spot.images[0].url }),
      },
    });
  }

  private buildSpotDescription(spot: SwimmingSpot): string {
    let description = `Découvrez ${spot.name}, un spot de baignade de type « ${spot.type} » situé à ${spot.city}, dans le département ${spot.department} en ${spot.region}.`;

    if (spot.siteDetails?.lastWaterQuality) {
      description += ` Qualité de l'eau : ${spot.siteDetails.lastWaterQuality}.`;
    }

    description += ` Baignez-vous en toute sécurité avec Ça Baigne !`;

    return description;
  }

  goBack(): void {
    this.location.back();
  }
}
