import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SwimmingSpotImage } from '@app/shared/models/swimming-spot.model';

@Component({
  selector: 'app-spot-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-gallery.component.html',
  styleUrl: './spot-gallery.component.css',
})
export class SpotGalleryComponent {
  images = input<SwimmingSpotImage[]>([]);
  spotName = input<string>('');

  displayedImages = computed(() => (this.images() || []).slice(0, 3));
  totalImages = computed(() => (this.images() || []).length);
  hasMoreImages = computed(() => this.totalImages() > 3);
  remainingCount = computed(() => this.totalImages() - 3);
  hasImages = computed(() => this.displayedImages().length > 0);
}
