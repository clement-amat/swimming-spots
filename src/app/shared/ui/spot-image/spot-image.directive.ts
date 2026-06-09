import { Directive, computed, input, signal } from '@angular/core';
import { SwimmingSpotImage } from '@app/shared/models/swimming-spot.model';

export type SpotImageSource = Pick<SwimmingSpotImage, 'url' | 'thumbUrl'>;

const THUMB_WIDTH_BUCKETS = [250, 330, 500, 960, 1280, 1920];
const SRCSET_WIDTHS = [500, 960, 1280, 1920];

function snapToBucket(width: number): number {
  return (
    THUMB_WIDTH_BUCKETS.find((bucket) => bucket >= width) ??
    THUMB_WIDTH_BUCKETS[THUMB_WIDTH_BUCKETS.length - 1]
  );
}

const WIKIMEDIA_ORIGINAL_PATTERN =
  /^(https?:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/i;
const THUMB_WIDTH_PATTERN = /^\d+px-/;
const RESIZABLE_FILE_PATTERN = /\.(jpe?g|png|gif|webp)$/i;

export function buildThumbUrl(
  image: SpotImageSource,
  width: number,
): string | null {
  const bucketWidth = snapToBucket(width);

  if (image.thumbUrl?.includes('/thumb/')) {
    const segments = image.thumbUrl.split('/');
    const last = segments[segments.length - 1];
    if (THUMB_WIDTH_PATTERN.test(last)) {
      segments[segments.length - 1] = last.replace(
        THUMB_WIDTH_PATTERN,
        `${bucketWidth}px-`,
      );
      return segments.join('/');
    }
  }

  const match = image.url?.match(WIKIMEDIA_ORIGINAL_PATTERN);
  if (match && RESIZABLE_FILE_PATTERN.test(match[4])) {
    return `${match[1]}/thumb/${match[2]}/${match[3]}/${match[4]}/${bucketWidth}px-${match[4]}`;
  }

  return null;
}

@Directive({
  selector: 'img[appSpotImage]',
  standalone: true,
  host: {
    '[attr.src]': 'src()',
    '[attr.srcset]': 'srcset()',
    '[attr.sizes]': 'sizesValue()',
    '(error)': 'handleError()',
  },
})
export class SpotImageDirective {
  appSpotImage = input.required<SpotImageSource | string>();
  displayWidth = input(960);
  sizes = input('100vw');

  private failedImageUrl = signal<string | null>(null);

  private image = computed<SpotImageSource>(() => {
    const value = this.appSpotImage();
    return typeof value === 'string' ? { url: value } : value;
  });

  private useOriginal = computed(
    () => this.failedImageUrl() === this.image().url,
  );

  protected src = computed(() => {
    const image = this.image();
    if (this.useOriginal()) {
      return image.url;
    }
    return (
      buildThumbUrl(image, this.displayWidth()) ?? image.thumbUrl ?? image.url
    );
  });

  protected srcset = computed(() => {
    if (this.useOriginal()) {
      return null;
    }
    const image = this.image();
    const candidates = SRCSET_WIDTHS.map((width) => {
      const url = buildThumbUrl(image, width);
      return url ? `${url} ${width}w` : null;
    }).filter((candidate): candidate is string => candidate !== null);
    return candidates.length ? candidates.join(', ') : null;
  });

  protected sizesValue = computed(() =>
    this.srcset() ? this.sizes() : null,
  );

  protected handleError(): void {
    const image = this.image();
    if (this.src() !== image.url) {
      this.failedImageUrl.set(image.url);
    }
  }
}
