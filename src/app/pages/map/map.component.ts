import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { SwimmingSpotsService } from '@data/swimming-spots.service';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import type { Map, MapboxOptions, default as MapboxGl } from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { spotTypeMapping } from './spot-type-mapping';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotLight } from '@app/shared/models/swimming-spot-light.model';
import { SwimmingSpotDrawerComponent } from './swimming-spot-drawer/swimming-spot-drawer.component';
import { MapControlService } from '@app/shared/maps/map-control.service';
import { MapFiltersComponent } from '@app/shared/ui/map-filters/map-filters.component';
import { MapFiltersService } from '@app/shared/services/map-filters.service';
import {
  BASE_URL,
  DEFAULT_LOGO,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
  SeoService,
} from '@app/shared/seo/seo.service';
import { AnalyticsService } from '@app/shared/analytics/analytics.service';
import {
  buildCircleRadiusExpression,
  buildCircleOpacityExpression,
  buildCircleStrokeWidthExpression,
} from './map-visibility.config';

let mapboxgl: typeof MapboxGl | undefined;
let mapboxglPromise: Promise<typeof MapboxGl> | undefined;

const TAP_TOLERANCE_PX = 12;

function loadMapboxGl(): Promise<typeof MapboxGl> {
  if (mapboxgl) return Promise.resolve(mapboxgl);
  if (!mapboxglPromise) {
    mapboxglPromise = import('mapbox-gl').then((m) => {
      mapboxgl = m.default;
      return mapboxgl;
    });
  }
  return mapboxglPromise;
}

@Component({
  selector: 'app-map',
  imports: [SwimmingSpotDrawerComponent, MapFiltersComponent],
  providers: [SeoService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: Map;
  private mapInitialized = false;
  private layerAdded = false;
  private isMobile = false;

  selectedLight: SwimmingSpotLight | null = null;
  selectedSpot: SwimmingSpot | null = null;

  legendItems: Array<{ color: string; label: string }> = [];

  isLegendOpen = false;

  toggleLegend(): void {
    this.isLegendOpen = !this.isLegendOpen;
  }

  closeLegend(): void {
    this.isLegendOpen = false;
  }

  constructor(
    private swimmingSpotsService: SwimmingSpotsService,
    private mapControlService: MapControlService,
    private mapFiltersService: MapFiltersService,
    private seoService: SeoService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private analytics: AnalyticsService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      loadMapboxGl();
    }

    this.mapControlService
      .onCenterMap()
      .pipe(takeUntilDestroyed())
      .subscribe((coordinates) => {
        this.centerMapOn(coordinates.lon, coordinates.lat);
      });

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    effect(() => {
      const activeFilters = this.mapFiltersService.activeFilters();
      if (this.layerAdded) {
        this.applyFilters();
      }
    });
  }

  ngOnInit(): void {
    this.seoService.setTitle(HOMEPAGE_TITLE);
    this.seoService.setMetaData({
      description: HOMEPAGE_DESCRIPTION,
      canonicalUrl: BASE_URL,
      image: DEFAULT_LOGO,
      ogType: 'website',
      structuredData: this.seoService.buildHomepageStructuredData(HOMEPAGE_DESCRIPTION),
    });
    this.generateLegendItems();
  }

  private centerMapOn(lon: number, lat: number): void {
    if (!this.map || !this.mapInitialized) {
      console.warn('Map not initialized yet');
      return;
    }

    this.map.flyTo({
      center: [lon, lat],
      zoom: 11,
      essential: true,
      duration: 2000,
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && !this.mapInitialized) {
      await this.initMap();
    }
  }

  private generateLegendItems(): void {
    this.legendItems = Object.entries(spotTypeMapping).map(
      ([type, config]) => ({
        color: config.color,
        label: type,
      }),
    );
  }

  ngOnDestroy(): void {
    if (this.map && this.mapInitialized) {
      const center = this.map.getCenter();
      this.mapControlService.saveMapState({
        center: [center.lng, center.lat],
        zoom: this.map.getZoom(),
      });
    }
    this.mapControlService.setMapReady(false);
  }

  private async initMap(): Promise<void> {
    if (this.mapInitialized) return;

    this.mapControlService.setMapReady(false);

    const mapbox = await loadMapboxGl();

    const savedState = this.mapControlService.getSavedMapState();

    const mapOptions: MapboxOptions = {
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: savedState?.center ?? [2.2137, 46.2276],
      zoom: savedState?.zoom ?? 5,
      attributionControl: false,
      // Default (3px) turns most mobile taps into micro-pans, swallowing the click
      clickTolerance: 10,
    };

    this.map = new mapbox.Map(mapOptions);
    this.mapInitialized = true;

    this.map.on('load', () => {
      this.map.resize();
      this.addSwimmingSpotsLayer();
      this.mapControlService.setMapReady(true);
    });
  }

  private addSwimmingSpotsLayer(): void {
    if (this.layerAdded) return;

    this.map.addSource('swimming-spots', {
      type: 'geojson',
      data: '/spots-light.json',
    });

    const colorArray = Object.entries(spotTypeMapping).flatMap(
      ([key, value]) => [key, value.color],
    );

    this.map.addLayer({
      id: 'swimming-spots-circles',
      type: 'circle',
      source: 'swimming-spots',
      layout: {
        'circle-sort-key': ['coalesce', ['get', 'score'], 0] as any,
      },
      paint: {
        'circle-radius': buildCircleRadiusExpression() as any,
        'circle-opacity': buildCircleOpacityExpression() as any,
        'circle-color': ['match', ['get', 'type'], ...colorArray, '#9B9B9B'],
        'circle-stroke-width': buildCircleStrokeWidthExpression() as any,
        'circle-stroke-opacity': buildCircleOpacityExpression() as any,
        'circle-stroke-color': '#ffffff',
      },
    });

    this.map.on('click', (e: any) => {
      const { x, y } = e.point;
      const features = this.map.queryRenderedFeatures(
        [
          [x - TAP_TOLERANCE_PX, y - TAP_TOLERANCE_PX],
          [x + TAP_TOLERANCE_PX, y + TAP_TOLERANCE_PX],
        ],
        { layers: ['swimming-spots-circles'] },
      );
      if (!features.length) return;

      let nearest = features[0];
      let minDist = Infinity;
      for (const feature of features) {
        const coords = (feature.geometry as any).coordinates;
        const projected = this.map.project(coords);
        const dist = Math.hypot(projected.x - x, projected.y - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = feature;
        }
      }

      this.openDrawer(nearest.properties as SwimmingSpotLight);
    });

    this.map.on('mouseenter', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.layerAdded = true;
    this.applyFilters();
  }

  openDrawer(light: SwimmingSpotLight): void {
    if (this.isMobile) {
      this.router.navigate(['/spot', light.slug]);
      return;
    }

    this.selectedLight = light;
    this.selectedSpot = null;

    this.swimmingSpotsService.getSwimmingSpotBySlug(light.slug).subscribe({
      next: (spot) => {
        if (spot && this.selectedLight?.slug === light.slug) {
          this.selectedSpot = spot;
          this.analytics.trackSpotView(spot, 'overlay');
        }
      },
      error: () => {
        if (this.selectedLight?.slug === light.slug) {
          this.selectedSpot = null;
        }
      },
    });
  }

  closeDrawer(): void {
    this.selectedLight = null;
    this.selectedSpot = null;
  }

  private applyFilters(): void {
    if (!this.layerAdded) return;

    const activeFilters = this.mapFiltersService.activeFilters();
    const exprs = activeFilters.map(
      (f) => ['==', ['get', f.id], true] as any,
    );

    this.map.setFilter(
      'swimming-spots-circles',
      exprs.length ? (['all', ...exprs] as any) : null,
    );
  }
}
