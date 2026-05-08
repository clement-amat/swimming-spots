import {
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
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
import { NotFoundComponent } from '@app/pages/not-found/not-found.component';

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

  swimmingSpot = signal<SwimmingSpot | null>(null);
  loading = signal(true);

  isDesktop = toSignal(
    this.breakpointObserver
      .observe('(min-width: 768px)')
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  ngOnInit(): void {
    const spot: SwimmingSpot | null = this.route.snapshot.data['spot'];

    if (spot) {
      this.swimmingSpot.set(spot);
      this.applySpotSeo(spot);
    }

    this.loading.set(false);
  }

  private applySpotSeo(spot: SwimmingSpot): void {
    const description = this.buildSpotDescription(spot);
    const url = `${BASE_URL}/spot/${spot.code}`;
    const heroImage = spot.images?.[0];

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
