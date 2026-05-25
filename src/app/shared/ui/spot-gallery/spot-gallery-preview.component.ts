import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SwimmingSpotImage } from '@app/shared/models/swimming-spot.model';

@Component({
  selector: 'app-spot-gallery-preview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './spot-gallery-preview.component.html',
  styleUrl: './spot-gallery-preview.component.css',
})
export class SpotGalleryPreviewComponent {
  images = input<SwimmingSpotImage[]>([]);
  spotName = input<string>('');
  spotSlug = input<string>('');

  totalImages = computed(() => (this.images() || []).length);
  displayedImages = computed(() => {
    const all = this.images() || [];
    const useThumb = all.length > 1;
    return all.slice(0, 3).map((image) => ({
      image,
      src: useThumb ? image.thumbUrl || image.url : image.url,
    }));
  });
  hasMoreImages = computed(() => this.totalImages() > 3);
  remainingCount = computed(() => this.totalImages() - 3);
  hasImages = computed(() => this.displayedImages().length > 0);
}
