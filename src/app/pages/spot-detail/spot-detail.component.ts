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
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotDetailComponent } from '@app/shared/ui/swimming-spot-detail/swimming-spot-detail.component';
import { SpotHeroGalleryComponent } from '@app/shared/ui/spot-hero-gallery/spot-hero-gallery.component';
import { SpotFacilitiesComponent } from '@app/shared/ui/spot-facilities/spot-facilities.component';
import { SpotAboutComponent } from '@app/shared/ui/spot-about/spot-about.component';
import { SpotGalleryComponent } from '@app/shared/ui/spot-gallery/spot-gallery.component';
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
    SpotGalleryComponent,
    SpotMapCardComponent,
  ],
  templateUrl: './spot-detail.component.html',
  styleUrl: './spot-detail.component.css',
})
export class SpotDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private swimmingSpotsService = inject(SwimmingSpotsService);
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
        this.loading.set(false);
        return;
      }
    }

    this.swimmingSpotsService.getSwimmingSpotByCode(code).subscribe({
      next: (spot) => {
        this.swimmingSpot.set(spot);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du spot:', error);
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
