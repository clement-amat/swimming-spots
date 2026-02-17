import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoMetaData {
  description: string;
  canonicalUrl?: string;
  image?: string;
  structuredData?: Record<string, unknown>;
}

const STRUCTURED_DATA_ID = 'seo-structured-data';

@Injectable()
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private document = inject(DOCUMENT);

  setTitle(title: string): void {
    this.titleService.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  setMetaData(data: SeoMetaData): void {
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });

    if (data.canonicalUrl) {
      this.setCanonicalUrl(data.canonicalUrl);
      this.meta.updateTag({ property: 'og:url', content: data.canonicalUrl });
    }

    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: data.image });
      this.meta.updateTag({ name: 'twitter:image', content: data.image });
    }

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
