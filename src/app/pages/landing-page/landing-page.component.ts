import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPageData } from '@app/shared/models/landing-page.model';
import { SeoService } from '@app/shared/seo/seo.service';
import { LandingHeroComponent } from '@app/shared/ui/landing-hero/landing-hero.component';
import { LandingSpotCardComponent } from '@app/shared/ui/landing-spot-card/landing-spot-card.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LandingHeroComponent, LandingSpotCardComponent],
  providers: [SeoService],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  landingPage: LandingPageData | null = null;

  ngOnInit(): void {
    this.landingPage = this.route.snapshot.data['landingPage'];
    console.log('Landing page data:', this.landingPage);

    if (!this.landingPage) {
      console.error('No landing page data found, redirecting to 404');
      this.router.navigate(['/404']);
      return;
    }

    this.setupSeo();
  }

  private setupSeo(): void {
    if (!this.landingPage) return;

    this.seoService.setTitle(this.landingPage.title);
    this.seoService.setMetaData({
      description: this.landingPage.description,
      canonicalUrl:
        this.landingPage.canonicalUrl ||
        `https://yoursite.com/p/${this.landingPage.slug}`,
      image: this.landingPage.ogImage,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: this.landingPage.title,
        numberOfItems: this.landingPage.spotsCount,
        itemListElement: this.landingPage.spots.map((spot, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Place',
            name: spot.name,
            url: `https://yoursite.com/spot/${spot.code}`,
          },
        })),
      },
    });
  }
}
