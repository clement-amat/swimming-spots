import {
  Component,
  OnInit,
  PLATFORM_ID,
  signal,
  inject,
  computed,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import {
  SwimmingSpot,
  SwimmingSpotImage,
} from '@app/shared/models/swimming-spot.model';
import { SpotImageDirective } from '@app/shared/ui/spot-image/spot-image.directive';

@Component({
  selector: 'app-spot-gallery',
  standalone: true,
  imports: [CommonModule, SpotImageDirective],
  templateUrl: './spot-gallery.component.html',
  styleUrl: './spot-gallery.component.css',
})
export class SpotGalleryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private swimmingSpotsService = inject(SwimmingSpotsService);
  private platformId = inject(PLATFORM_ID);

  swimmingSpot = signal<SwimmingSpot | null>(null);
  loading = signal(true);

  imageCount = computed(() => this.swimmingSpot()?.images?.length || 0);
  columnClass = computed(() => {
    const count = this.imageCount();
    if (count < 10) {
      return 'columns-1 md:columns-2 lg:columns-3';
    }
    return 'columns-1 md:columns-2 lg:columns-4';
  });
  spotName = computed(() => this.swimmingSpot()?.name || '');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
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

    this.swimmingSpotsService.getSwimmingSpotBySlug(slug).subscribe({
      next: (spot) => {
        this.swimmingSpot.set(spot);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  trackByUrl(_index: number, image: SwimmingSpotImage): string {
    return image.url;
  }
}
