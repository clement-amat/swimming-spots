import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LandingPageData } from '@app/shared/models/landing-page.model';
import { BASE_URL, SeoService } from '@app/shared/seo/seo.service';
import { LandingHeroComponent } from '@app/shared/ui/landing-hero/landing-hero.component';
import { LandingSpotCardComponent } from '@app/shared/ui/landing-spot-card/landing-spot-card.component';
import { NotFoundComponent } from '@app/pages/not-found/not-found.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [LandingHeroComponent, LandingSpotCardComponent, NotFoundComponent],
  providers: [SeoService],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private seoService = inject(SeoService);

  readonly landingPage = signal<LandingPageData | null>(null);

  ngOnInit(): void {
    const data: LandingPageData | null = this.route.snapshot.data['landingPage'];

    if (data) {
      this.landingPage.set(data);
      this.applySeo(data);
    }
  }

  private applySeo(data: LandingPageData): void {
    const canonicalUrl = data.canonicalUrl || `${BASE_URL}/p/${data.slug}`;

    this.seoService.setTitle(data.title);
    this.seoService.setMetaData({
      description: data.description,
      canonicalUrl,
      image: data.ogImage || data.hero.image,
      imageAlt: data.hero.title,
      ogType: 'article',
      structuredData: this.seoService.buildLandingPageStructuredData(data),
    });
  }
}
