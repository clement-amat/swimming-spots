import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SwimmingSpotImage } from '@app/shared/models/swimming-spot.model';
import { SpotImageDirective, buildThumbUrl } from './spot-image.directive';

const WIKIMEDIA_WITH_THUMB: SwimmingSpotImage = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Plage_%282%29.jpg',
  thumbUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Plage_%282%29.jpg/960px-Plage_%282%29.jpg',
  title: 'Plage',
  description: '',
  license: '',
  score: 1,
};

const WIKIMEDIA_WITHOUT_THUMB: SwimmingSpotImage = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/%C3%89tang.jpg',
  title: 'Étang',
  description: '',
  license: '',
  score: 1,
};

const EXTERNAL_IMAGE: SwimmingSpotImage = {
  url: 'https://www.verneuil78.fr/wp-content/uploads/2024/12/photo.jpeg',
  title: 'Externe',
  description: '',
  license: '',
  score: 1,
};

describe('buildThumbUrl', () => {
  it('rewrites the width of an existing thumbUrl', () => {
    expect(buildThumbUrl(WIKIMEDIA_WITH_THUMB, 500)).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Plage_%282%29.jpg/500px-Plage_%282%29.jpg',
    );
  });

  it('snaps widths to the allowed Wikimedia buckets', () => {
    expect(buildThumbUrl(WIKIMEDIA_WITH_THUMB, 480)).toContain('/500px-');
    expect(buildThumbUrl(WIKIMEDIA_WITH_THUMB, 640)).toContain('/960px-');
    expect(buildThumbUrl(WIKIMEDIA_WITH_THUMB, 99999)).toContain('/1920px-');
  });

  it('derives a thumb from a Wikimedia original without thumbUrl', () => {
    expect(buildThumbUrl(WIKIMEDIA_WITHOUT_THUMB, 960)).toBe(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/%C3%89tang.jpg/960px-%C3%89tang.jpg',
    );
  });

  it('returns null for non-Wikimedia URLs', () => {
    expect(buildThumbUrl(EXTERNAL_IMAGE, 960)).toBeNull();
  });

  it('returns null for non-resizable Wikimedia files', () => {
    const tiff: SwimmingSpotImage = {
      ...WIKIMEDIA_WITHOUT_THUMB,
      url: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Carte.tif',
    };
    expect(buildThumbUrl(tiff, 960)).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [SpotImageDirective],
  template: `<img [appSpotImage]="image()" [displayWidth]="960" sizes="100vw" alt="" />`,
})
class HostComponent {
  image = input.required<SwimmingSpotImage | string>();
}

describe('SpotImageDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  function createWith(image: SwimmingSpotImage | string): HTMLImageElement {
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('image', image);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('img');
  }

  it('sets a sized src and srcset for Wikimedia images', () => {
    const img = createWith(WIKIMEDIA_WITH_THUMB);
    expect(img.getAttribute('src')).toContain('/960px-');
    expect(img.getAttribute('srcset')).toContain('/500px-');
    expect(img.getAttribute('srcset')).toContain('1920w');
    expect(img.getAttribute('sizes')).toBe('100vw');
  });

  it('uses the original URL without srcset for external images', () => {
    const img = createWith(EXTERNAL_IMAGE);
    expect(img.getAttribute('src')).toBe(EXTERNAL_IMAGE.url);
    expect(img.getAttribute('srcset')).toBeNull();
    expect(img.getAttribute('sizes')).toBeNull();
  });

  it('accepts a plain URL string and derives Wikimedia thumbs', () => {
    const img = createWith(WIKIMEDIA_WITHOUT_THUMB.url);
    expect(img.getAttribute('src')).toContain('/thumb/');
    expect(img.getAttribute('srcset')).toContain('960w');
  });

  it('falls back to the original URL when the thumb fails to load', () => {
    const img = createWith(WIKIMEDIA_WITHOUT_THUMB);
    expect(img.getAttribute('src')).toContain('/thumb/');

    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(img.getAttribute('src')).toBe(WIKIMEDIA_WITHOUT_THUMB.url);
    expect(img.getAttribute('srcset')).toBeNull();
  });

  it('does not loop when the original URL itself fails', () => {
    const img = createWith(EXTERNAL_IMAGE);
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(img.getAttribute('src')).toBe(EXTERNAL_IMAGE.url);
  });
});
