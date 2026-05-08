import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LandingPageData } from '@models/landing-page.model';
import { LandingPageService } from '@app/shared/data/landing-page.service';

export const landingPageResolver: ResolveFn<LandingPageData | null> = (
  route
) => {
  const landingPageService = inject(LandingPageService);
  const slug = route.paramMap.get('slug');

  if (!slug) {
    return null;
  }

  return landingPageService.getLandingPage(slug);
};
