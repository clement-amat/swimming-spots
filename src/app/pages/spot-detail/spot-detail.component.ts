import {
  Component,
  DestroyRef,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DOCUMENT, Location, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { BASE_URL, SeoService, SITE_NAME } from '@app/shared/seo/seo.service';
import { SwimmingSpotDetailComponent } from '@app/shared/ui/swimming-spot-detail/swimming-spot-detail.component';
import { SpotHeroGalleryComponent } from '@app/shared/ui/spot-hero-gallery/spot-hero-gallery.component';
import { SpotFacilitiesComponent } from '@app/shared/ui/spot-facilities/spot-facilities.component';
import { SpotAboutComponent } from '@app/shared/ui/spot-about/spot-about.component';
import { SpotGalleryPreviewComponent } from '@app/shared/ui/spot-gallery/spot-gallery-preview.component';
import { SpotMapCardComponent } from '@app/shared/ui/spot-map-card/spot-map-card.component';
import { SpotNearbyComponent } from '@app/shared/ui/spot-nearby/spot-nearby.component';
import { NotFoundComponent } from '@app/pages/not-found/not-found.component';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';

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
    SpotNearbyComponent,
    NotFoundComponent,
  ],
  providers: [SeoService],
  templateUrl: './spot-detail.component.html',
  styleUrl: './spot-detail.component.css',
})
export class SpotDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private seoService = inject(SeoService);
  private breakpointObserver = inject(BreakpointObserver);
  private analytics = inject(AnalyticsService);
  private destroyRef = inject(DestroyRef);
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);

  swimmingSpot = signal<SwimmingSpot | null>(null);
  loading = signal(true);

  isDesktop = toSignal(
    this.breakpointObserver
      .observe('(min-width: 768px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  ngOnInit(): void {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const spot: SwimmingSpot | null = data['spot'] ?? null;
        this.swimmingSpot.set(spot);
        if (spot) {
          this.applySpotSeo(spot);
          this.analytics.trackSpotView(spot, 'detail_page');
          this.scrollMainToTop();
        }
        this.loading.set(false);
      });
  }

  private scrollMainToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const scroll = () => {
      const selectors = ['.spot-detail-desktop', '.spot-detail-page', '.layout-main'];
      for (const sel of selectors) {
        const el = this.document.querySelector(sel) as HTMLElement | null;
        if (el) el.scrollTop = 0;
      }
      this.document.defaultView?.scrollTo({ top: 0 });
    };
    scroll();
    this.document.defaultView?.requestAnimationFrame(scroll);
  }

  private applySpotSeo(spot: SwimmingSpot): void {
    const description = this.buildSpotDescription(spot);
    const url = `${BASE_URL}/spot/${spot.slug}`;
    const heroImage = spot.images?.[0];
    const amenityFeature = this.buildAmenityFeatures(spot);

    this.seoService.setTitle(
      `${spot.name} - Baignade à ${spot.city} (${spot.department}) | ${SITE_NAME}`,
    );
    this.seoService.setMetaData({
      description,
      canonicalUrl: url,
      image: heroImage?.url,
      imageAlt: heroImage?.title || spot.name,
      ogType: 'place',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: spot.name,
        description,
        url,
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
        ...(heroImage && { image: heroImage.url }),
        ...(amenityFeature.length > 0 && { amenityFeature }),
      },
    });
  }

  private buildAmenityFeatures(spot: SwimmingSpot): Record<string, unknown>[] {
    const details = spot.siteDetails;
    if (!details) return [];

    const features: Array<{ key: keyof typeof details; name: string }> = [
      { key: 'showers', name: 'Douches' },
      { key: 'toilets', name: 'Toilettes' },
      { key: 'drinkingWater', name: "Point d'eau potable" },
      { key: 'lifeguard', name: 'Poste de secours' },
      { key: 'surveillance', name: 'Baignade surveillée' },
      { key: 'animalsAllowed', name: 'Chiens autorisés' },
      { key: 'wheelchairAccess', name: 'Accessible PMR' },
      { key: 'amenities', name: 'Aménagements' },
    ];

    return features
      .filter(({ key }) => typeof details[key] === 'boolean')
      .map(({ key, name }) => ({
        '@type': 'LocationFeatureSpecification',
        name,
        value: details[key] as boolean,
      }));
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
