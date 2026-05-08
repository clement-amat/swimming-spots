import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { LandingPageData } from '@app/shared/models/landing-page.model';
import { SERVER_RESPONSE } from './server-response.token';

export type OgType = 'website' | 'article' | 'place' | 'profile';

export interface SeoMetaData {
  description: string;
  canonicalUrl?: string;
  image?: string;
  imageAlt?: string;
  ogType?: OgType;
  structuredData?: Record<string, unknown>;
}

const STRUCTURED_DATA_ID = 'seo-structured-data';
export const BASE_URL = 'https://ca-baigne.com';
export const SITE_NAME = 'Ça Baigne !';
export const DEFAULT_LOGO = `${BASE_URL}/assets/icons/og-image.png`;
export const HOMEPAGE_TITLE = `Carte des spots de baignade en France | ${SITE_NAME}`;
export const HOMEPAGE_DESCRIPTION =
  'Découvrez les meilleurs spots de baignade en France avec notre carte interactive. Trouvez des lacs, rivières et plages pour vous baigner en toute sécurité.';

const FEATURED_LANDING_PAGES: ReadonlyArray<{ slug: string; name: string }> = [
  { slug: 'lyon', name: 'Lyon' },
  { slug: 'paris', name: 'Paris' },
  { slug: 'marseille', name: 'Marseille' },
  { slug: 'nice', name: 'Nice' },
  { slug: 'toulouse', name: 'Toulouse' },
];

@Injectable()
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);
  private serverResponse = inject(SERVER_RESPONSE, { optional: true });

  markAsNotFound(): void {
    this.serverResponse?.status(404);

    this.setTitle(`Page introuvable | ${SITE_NAME}`);
    this.meta.updateTag({
      name: 'description',
      content: 'La page demandée est introuvable.',
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
    this.removeCanonicalUrl();
    this.removeStructuredData();
  }

  buildHomepageStructuredData(description: string): Record<string, unknown> {
    const orgId = `${BASE_URL}/#organization`;
    const websiteId = `${BASE_URL}/#website`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': orgId,
          name: SITE_NAME,
          url: BASE_URL,
          logo: {
            '@type': 'ImageObject',
            url: DEFAULT_LOGO,
          },
          description:
            'Plateforme française de référence pour découvrir les spots de baignade autorisés et leur qualité de l’eau.',
        },
        {
          '@type': 'WebSite',
          '@id': websiteId,
          url: BASE_URL,
          name: SITE_NAME,
          description,
          inLanguage: 'fr-FR',
          publisher: { '@id': orgId },
        },
        {
          '@type': 'WebPage',
          '@id': `${BASE_URL}/#webpage`,
          url: BASE_URL,
          name: HOMEPAGE_TITLE,
          description,
          isPartOf: { '@id': websiteId },
          about: {
            '@type': 'Thing',
            name: 'Baignade en France',
            description:
              'Lacs, rivières, plages et eaux côtières où la baignade est autorisée et surveillée.',
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: DEFAULT_LOGO,
          },
          inLanguage: 'fr-FR',
        },
        {
          '@type': 'ItemList',
          '@id': `${BASE_URL}/#featured-cities`,
          name: 'Sélections de spots de baignade par ville',
          numberOfItems: FEATURED_LANDING_PAGES.length,
          itemListElement: FEATURED_LANDING_PAGES.map((page, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: `Spots de baignade à ${page.name}`,
            url: `${BASE_URL}/p/${page.slug}`,
          })),
        },
      ],
    };
  }

  buildLandingPageStructuredData(landingPage: LandingPageData): Record<string, unknown> {
    const pageUrl = landingPage.canonicalUrl || `${BASE_URL}/p/${landingPage.slug}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${pageUrl}#webpage`,
          url: pageUrl,
          name: landingPage.title,
          description: landingPage.description,
          inLanguage: 'fr-FR',
          isPartOf: { '@id': `${BASE_URL}/#website` },
          primaryImageOfPage: landingPage.hero.image
            ? { '@type': 'ImageObject', url: landingPage.hero.image }
            : undefined,
        },
        {
          '@type': 'ItemList',
          '@id': `${pageUrl}#spots`,
          name: landingPage.title,
          numberOfItems: landingPage.spotsCount,
          itemListElement: landingPage.spots.map((spot, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'TouristAttraction',
              name: spot.name,
              url: `${BASE_URL}/spot/${spot.code}`,
              ...(spot.image && {
                image: { '@type': 'ImageObject', url: spot.image },
              }),
              address: {
                '@type': 'PostalAddress',
                addressLocality: spot.city,
                addressCountry: 'FR',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: spot.lat,
                longitude: spot.lng,
              },
            },
          })),
        },
      ],
    };
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  setMetaData(data: SeoMetaData): void {
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });

    this.meta.updateTag({ property: 'og:type', content: data.ogType ?? 'website' });

    if (data.canonicalUrl) {
      this.setCanonicalUrl(data.canonicalUrl);
      this.meta.updateTag({ property: 'og:url', content: data.canonicalUrl });
    }

    const image = data.image ?? DEFAULT_LOGO;
    const imageAlt = data.imageAlt ?? SITE_NAME;
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:alt', content: imageAlt });
    this.meta.updateTag({ name: 'twitter:image', content: image });
    this.meta.updateTag({ name: 'twitter:image:alt', content: imageAlt });

    this.removeStructuredData();
    if (data.structuredData) {
      this.setStructuredData(data.structuredData);
    }
  }

  private setCanonicalUrl(url: string): void {
    const existing = this.document.querySelector("link[rel='canonical']");
    if (existing) {
      existing.setAttribute('href', url);
    } else {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  private removeCanonicalUrl(): void {
    this.document.querySelector("link[rel='canonical']")?.remove();
  }

  private setStructuredData(data: Record<string, unknown>): void {
    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('id', STRUCTURED_DATA_ID);
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private removeStructuredData(): void {
    this.document.getElementById(STRUCTURED_DATA_ID)?.remove();
  }
}
