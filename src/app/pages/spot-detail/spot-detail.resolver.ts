import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { SwimmingSpot } from '@models/swimming-spot.model';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import { of } from 'rxjs';

export const spotDetailResolver: ResolveFn<SwimmingSpot | null> = (route) => {
  const slug = route.paramMap.get('slug');

  if (!slug) {
    return null;
  }

  const navState = inject(Router).getCurrentNavigation()?.extras?.state?.['swimmingSpot'];
  if (navState) {
    return of(navState as SwimmingSpot);
  }

  return inject(SwimmingSpotsService).getSwimmingSpotBySlug(slug);
};
